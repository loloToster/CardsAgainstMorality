import { Router } from "express"

import type { Rooms } from "../../modules/rooms"
import { ApiRoom } from "../../types"
import { GameState } from "../../utils/game"

const router = Router()

router.get("/", (req, res) => {
  const rooms: Rooms = req.app.get("rooms")

  const publicRooms: ApiRoom[] = []

  for (const [roomId, room] of rooms.rooms) {
    if (!room?.public) continue

    const leader = room.getLeader()

    publicRooms.push({
      id: roomId,
      name: room.name,
      started: room.game.state !== GameState.NOT_STARTED,
      leaderAvatar: leader?.metadata?.user.picture,
      leaderName: leader?.metadata?.user.name || "???",
      players: room.game.players
        .filter(p => p !== leader)
        .map(p => p.metadata?.user.name || "???"),
      maxPlayers: room.playersLimit,
      rejoin: req.user
        ? room.game.players.some(p => p.metadata?.user.id === req.user?.id)
        : false
    })
  }

  res.json({
    rooms: publicRooms
  })
})

export = router
