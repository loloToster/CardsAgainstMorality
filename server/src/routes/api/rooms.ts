import { Router } from "express"
import type { Rooms } from "../../modules/rooms"
import { ApiRoom } from "../../types"

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
      leaderAvatar: leader?.metadata?.user.picture,
      leaderName: leader?.metadata?.user.name || "???",
      players: room.game.players.filter(p => p.metadata?.connected).length,
      maxPlayers: room.playersLimit
    })
  }

  res.json({
    rooms: publicRooms
  })
})

export = router
