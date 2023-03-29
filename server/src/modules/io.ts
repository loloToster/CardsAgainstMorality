import { nanoid } from "nanoid"
import type { Server, Socket } from "socket.io"
import type { IncomingMessage } from "http"

import { User } from "@prisma/client"
import db from "./db"
import { Game, GameState, Player, WinnerData } from "../utils/game"
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
}

interface ExtendedReq extends IncomingMessage {
  session?: { passport?: { user?: number } }
}

export const rooms = new Map<string, Game<PlayerMetadata> | undefined>()

export function createRoom() {
  let roomId = ""

  while (rooms.has(roomId) || !roomId) roomId = nanoid(16)

  rooms.set(roomId, new Game())
  return roomId
}

export function deleteRoom(roomId: string) {
  rooms.delete(roomId)
}

export default (
  io: Server<ClientToServerSocketEvents, ServerToClientSocketEvents>
) => {
  function sendPlayers(roomId: string, game: Game<PlayerMetadata>) {
    const players = game.players.map(p => ({
      name: p.metadata?.user.name ?? "Unknown",
      picture: p.metadata?.user.picture ?? "",
      connected: p.metadata?.connected ?? false,
      tsar: p.isTsar,
      ready: p.chose,
      points: p.points
    }))

    io.to(roomId).emit("players", { players })
  }

  async function sendNewRound(
    roomId: string,
    game: Game<PlayerMetadata>,
    winnerData?: WinnerData<PlayerMetadata>
  ) {
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

    sendPlayers(roomId, game)
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

  io.on("connection", async socket => {
    const userId = (socket.request as ExtendedReq).session?.passport?.user
    if (!userId) return socket.disconnect()

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) return socket.disconnect()

    const { roomId } = socket.handshake.auth
    console.log("connection to room:", roomId)

    const game = rooms.get(roomId)
    if (!game) return socket.disconnect()

    try {
      await db.bumpAnonymousUser(user, true)
    } catch (err) {
      console.error(err)
    }

    const foundPlayer = game.players.find(p => p.metadata?.user.id === user.id)

    let player: Player<PlayerMetadata>
    if (foundPlayer) {
      player = foundPlayer
      player.metadata?.socket.disconnect()
      player.metadata = { socket, user, connected: true }
    } else {
      player = game.addPlayer({ socket, user, connected: true })
    }

    socket.join(roomId)

    sendSyncData(player)
    sendPlayers(roomId, game)

    socket.on("start", async settings => {
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

        sendNewRound(roomId, game)
      } catch (err) {
        console.error(err)
      }
    })

    socket.on("submit", async ({ submition }) => {
      try {
        player.choose(submition)
      } catch (err) {
        console.error(err)
        return
      }

      sendPlayers(roomId, game)

      if (game.state !== GameState.TSAR_VERDICT) return

      sendChoices(roomId, game)
    })

    socket.on("verdict", ({ verdict }) => {
      try {
        const winnerData = player.makeVerdict(verdict)
        game.newRound()
        sendNewRound(roomId, game, winnerData)
      } catch (err) {
        console.error(err)
      }
    })

    socket.on("disconnect", () => {
      console.log("socket disconnected")
      if (game.players.every(p => !p.metadata?.connected)) deleteRoom(roomId)
      if (player.metadata) player.metadata.connected = false

      sendPlayers(roomId, game)

      db.bumpAnonymousUser(user, false)
    })
  })
}
