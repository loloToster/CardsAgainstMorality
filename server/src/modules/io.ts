import { nanoid } from "nanoid"
import type { Server, Socket } from "socket.io"
import type { IncomingMessage } from "http"

import { User } from "@prisma/client"
import db from "./db"
import logger from "./logger"

import { Game, GameState, Player, Podium, WinnerData } from "../utils/game"

import {
  ApiWhiteCard,
  ClientToServerSocketEvents,
  PrevRound,
  ServerToClientSocketEvents
} from "../types"

interface PlayerMetadata {
  connected: boolean
  socket: Socket<ClientToServerSocketEvents, ServerToClientSocketEvents>
  user: User
  joinedAt: number
}

interface GameMetadata {
  creator: number
}

interface Room {
  meta: GameMetadata
  game: Game<PlayerMetadata>
}

interface ExtendedReq extends IncomingMessage {
  session?: { passport?: { user?: number } }
}

export const rooms = new Map<string, Room | undefined>()

export function createRoom(userId: number) {
  let roomId = ""

  while (rooms.has(roomId) || !roomId) roomId = nanoid(16)

  rooms.set(roomId, { meta: { creator: userId }, game: new Game() })

  return roomId
}

export function deleteRoom(roomId: string) {
  rooms.delete(roomId)
}

export default (
  io: Server<ClientToServerSocketEvents, ServerToClientSocketEvents>
) => {
  function getRoomLeader(room: Room) {
    let leader: Player<PlayerMetadata> | null = null

    for (const player of room.game.players) {
      if (
        player.metadata?.user.id === room.meta.creator &&
        player.metadata.connected
      ) {
        return player
      }

      if (!player.metadata) continue

      if (
        (!leader?.metadata ||
          player.metadata.joinedAt > leader.metadata.joinedAt) &&
        player.metadata.connected
      ) {
        leader = player
      }
    }

    return leader
  }

  function sendPlayers(roomId: string, room: Room) {
    const leader = getRoomLeader(room)

    const players = room.game.players.map(p => ({
      userId: p.metadata?.user.id ?? -1,
      name: p.metadata?.user.name ?? "Unknown",
      picture: p.metadata?.user.picture ?? "",
      leader: leader === p,
      connected: p.metadata?.connected ?? false,
      tsar: p.isTsar,
      ready: p.chose,
      points: p.points
    }))

    io.to(roomId).emit("players", { players })
  }

  async function sendNewRound(
    roomId: string,
    room: Room,
    winnerData?: WinnerData<PlayerMetadata>
  ) {
    const { game } = room
    if (!game.curBlackCard) throw new Error("No black card")

    const blackCard = await db.getApiBlackCard(game.curBlackCard.id)

    const allPlayersCardsIds = game.players.map(p => p.cards)

    const allPlayersCards = (await db.mapIdsToApiWhiteCards(
      allPlayersCardsIds
    )) as ApiWhiteCard[][]

    let prevRound: PrevRound | undefined

    if (winnerData) {
      const prevRoundBlack = await db.getApiBlackCard(winnerData.blackCard)
      const winningCards = (await db.mapIdsToApiWhiteCards(
        winnerData.winningCards
      )) as ApiWhiteCard[]

      prevRound = {
        winner: winnerData.winner.metadata?.user.name ?? "Unknown",
        blackCard: prevRoundBlack,
        winningCards,
        imWinner: false
      }
    }

    for (let i = 0; i < game.players.length; i++) {
      const player = game.players[i]
      const cards = allPlayersCards[i]

      if (prevRound) {
        prevRound.imWinner = player === winnerData?.winner
      }

      player.metadata?.socket.emit("new-round", {
        blackCard,
        cards,
        tsar: player.isTsar,
        prevRound
      })
    }

    sendPlayers(roomId, room)
  }

  async function sendChoices(roomId: string, game: Game<PlayerMetadata>) {
    const choices = (await db.mapIdsToApiWhiteCards(
      game.getChoices()
    )) as ApiWhiteCard[][]

    io.to(roomId).emit("choices", { choices })
  }

  async function sendSyncData(player: Player<PlayerMetadata>) {
    const { game } = player

    if (game.state === GameState.NOT_STARTED) {
      player.metadata?.socket.emit("sync", { started: false })
      return
    }

    if (!game.curBlackCard) return

    const blackCard = await db.getApiBlackCard(game.curBlackCard.id)

    const cards = (await db.mapIdsToApiWhiteCards(
      player.cards
    )) as ApiWhiteCard[]

    let choices: ApiWhiteCard[][] | undefined

    if (game.state === GameState.TSAR_VERDICT) {
      choices = (await db.mapIdsToApiWhiteCards(
        game.getChoices()
      )) as ApiWhiteCard[][]
    }

    const data = {
      started: true,
      tsar: player.isTsar,
      blackCard,
      cards,
      choices
    }

    player.metadata?.socket.emit("sync", data)
  }

  function sendGameEnd(roomId: string, podium: Podium<PlayerMetadata>) {
    io.to(roomId).emit("end", {
      podium: podium.map((pel, i) => ({
        place: i + 1,
        name: pel.metadata?.user.name || "?",
        picture: pel.metadata?.user.picture || "",
        points: pel.points
      }))
    })
  }

  io.on("connection", async socket => {
    const userId = (socket.request as ExtendedReq).session?.passport?.user
    if (!userId) return socket.disconnect()

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) return socket.disconnect()

    const { roomId } = socket.handshake.auth

    const room = rooms.get(roomId)
    if (!room) return socket.disconnect()

    const { game } = room

    logger.info(
      `User with id: '${user.id}' connected to room with id: '${roomId}'`
    )

    try {
      // dont bump users with null
      await db.bumpAnonymousUser(user, true)
    } catch (err) {
      logger.error(err)
    }

    const foundPlayer = game.players.find(p => p.metadata?.user.id === user.id)

    let player: Player<PlayerMetadata>
    if (foundPlayer) {
      player = foundPlayer
      player.metadata?.socket.disconnect()
      player.metadata = {
        socket,
        user,
        connected: true,
        joinedAt: player.metadata?.joinedAt ?? Date.now()
      }
    } else {
      player = game.addPlayer({
        socket,
        user,
        connected: true,
        joinedAt: Date.now()
      })
    }

    socket.join(roomId)

    sendSyncData(player)
    sendPlayers(roomId, room)

    socket.on("start", async settings => {
      if (getRoomLeader(room) !== player) return

      const whiteCards = await db.whiteCard.findMany({
        where: { packId: { in: settings.packs } },
        select: { id: true }
      })

      const blackCards = await db.blackCard.findMany({
        where: { packId: { in: settings.packs } },
        select: { id: true, pick: true }
      })

      try {
        game.setCards(
          whiteCards.map(c => c.id),
          blackCards
        )
        game.start()

        sendNewRound(roomId, room)
      } catch (err) {
        logger.error(err)
      }
    })

    socket.on("submit", async ({ submition }) => {
      try {
        player.choose(submition)
      } catch (err) {
        logger.error(err)
        return
      }

      sendPlayers(roomId, room)

      if (game.state !== GameState.TSAR_VERDICT) return

      sendChoices(roomId, game)
    })

    socket.on("verdict", ({ verdict }) => {
      try {
        const winnerData = player.makeVerdict(verdict)

        const canContinue = game.newRound()

        if (canContinue) {
          sendNewRound(roomId, room, winnerData)
        } else {
          const podium = game.end()
          sendGameEnd(roomId, podium)
        }
      } catch (err) {
        logger.error(err)
      }
    })

    socket.on("disconnect", () => {
      logger.info(
        `Socket with user id: '${player.metadata?.user.id}' disconnected from room with id: '${roomId}'`
      )

      if (player.metadata) player.metadata.connected = false

      if (game.players.every(p => !p.metadata?.connected)) {
        logger.info(`Deleting room with id: '${roomId}'`)
        deleteRoom(roomId)
      } else {
        sendPlayers(roomId, room)
      }

      db.bumpAnonymousUser(user, false)
    })
  })
}
