import { nanoid } from "nanoid"
import type { Server, Socket } from "socket.io"
import type { IncomingMessage } from "http"

import { User } from "@prisma/client"
import db from "./db"
import { Game, GameState, Player } from "../utils/game"

interface PlayerMetadata {
  connected: boolean
  socket: Socket
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

export default (io: Server) => {
  function sendPlayers(roomId: string, game: Game<PlayerMetadata>) {
    const players = game.players.map(p => ({
      name: p.metadata?.user.name,
      picture: p.metadata?.user.picture,
      connected: p.metadata?.connected,
      tsar: p.isTsar,
      ready: p.chose,
      points: p.points
    }))

    io.to(roomId).emit("players", { players })
  }

  async function sendNewRound(roomId: string, game: Game<PlayerMetadata>) {
    if (!game.curBlackCard) throw new Error("No black card")

    const blackCard = await db.blackCard.findUnique({
      where: { id: game.curBlackCard.id },
      include: { pack: true }
    })

    if (!blackCard) throw new Error("No corresponding black card")

    const allDbWhiteCards = await db.whiteCard.findMany({
      where: { id: { in: game.players.map(p => p.cards).flat() } },
      include: { pack: true }
    })

    const allWhiteCards = allDbWhiteCards.map(c => ({
      id: c.id,
      text: c.text,
      pack: c.pack.name
    }))

    for (const player of game.players) {
      player.metadata?.socket.emit("new-round", {
        blackCard: {
          text: blackCard.text,
          pack: blackCard.pack.name,
          pick: blackCard.pick || 1
        },
        cards: allWhiteCards.filter(c => player.cards.includes(c.id)),
        tsar: player.isTsar
      })
    }

    sendPlayers(roomId, game)
  }

  async function sendChoices(roomId: string, game: Game<PlayerMetadata>) {
    const allDbCards = await db.whiteCard.findMany({
      where: { id: { in: game.getChoices().flat() } },
      include: { pack: true }
    })

    const allCards = allDbCards.map(c => ({
      id: c.id,
      text: c.text,
      pack: c.pack.name
    }))

    const choices = game
      .getChoices()
      .map(choice => choice.map(cid => allCards.find(c => c.id === cid)))

    io.to(roomId).emit("choices", { choices })
  }

  io.on("connection", async socket => {
    const userId = (socket.request as ExtendedReq).session?.passport?.user
    if (!userId) return socket.disconnect()

    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) return socket.disconnect()

    const { roomId } = socket.handshake.auth
    console.log("connection to room:", roomId)

    const game = rooms.get(roomId)
    if (!game) return

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
        socket.emit("error")
        console.error(err)
      }
    })

    socket.on("submit", async (cardIds: number[]) => {
      try {
        player.choose(cardIds)
      } catch (err) {
        console.error(err)
        return
      }

      if (game.state !== GameState.TSAR_VERDICT) return

      sendChoices(roomId, game)
    })

    socket.on("verdict", choice => {
      try {
        player.makeVerdict(choice)
      } catch (err) {
        console.error(err)
      }

      game.newRound()
      sendNewRound(roomId, game)
    })

    socket.on("disconnect", () => {
      console.log("socket disconnected")
      if (player.metadata) player.metadata.connected = false
      sendPlayers(roomId, game)
    })
  })
}
