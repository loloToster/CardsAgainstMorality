import { nanoid } from "nanoid"
import type { Server, Socket } from "socket.io"
import type { IncomingMessage } from "http"

import db from "./db"
import { Game, GameState } from "../utils/game"

interface PlayerMetadata {
  socket: Socket
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
  async function sendNewRound(game: Game<PlayerMetadata>) {
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
  }

  io.on("connection", socket => {
    const userId = (socket.request as ExtendedReq).session?.passport?.user
    console.log(userId)

    const { roomId } = socket.handshake.auth
    console.log("connection", roomId)

    const game = rooms.get(roomId)
    if (!game) return

    socket.join(roomId)
    const player = game.addPlayer({ socket })

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

        await sendNewRound(game)
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
    })

    socket.on("verdict", choice => {
      try {
        player.makeVerdict(choice)
      } catch (err) {
        console.error(err)
      }

      game.newRound()
      sendNewRound(game)
    })

    socket.on("disconnect", () => {
      console.log("socket disconnected")
    })
  })
}
