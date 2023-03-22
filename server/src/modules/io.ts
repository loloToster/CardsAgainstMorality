import { nanoid } from "nanoid"
import type { Server } from "socket.io"

import { Game } from "../utils/game"

export const rooms = new Map<string, Game | undefined>()

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
  io.on("connection", socket => {
    const { roomId } = socket.handshake.auth

    const game = rooms.get(roomId)
    if (!game) return

    game.addPlayer({ socket })

    socket.on("disconnect", () => {
      console.log("socket disconnected")
    })
  })
}
