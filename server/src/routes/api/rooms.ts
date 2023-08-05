import { Router } from "express"

import db from "../../modules/db"
import { GameState } from "../../utils/game"
import { userToApiUser } from "../../utils/transformers"

import type { Rooms } from "../../modules/rooms"
import type { ApiRoom } from "../../types"

const router = Router()

router.get("/", async (req, res) => {
  const rooms: Rooms = req.app.get("rooms")

  const publicRooms: ApiRoom[] = []

  const allPackIds = new Set<string>()

  for (const room of rooms.rooms.values()) {
    if (!room || room.game.state === GameState.NOT_STARTED) continue
    room.selectedPacks.forEach(p => allPackIds.add(p.id))
  }

  const allPacks = await db.cardPack.findMany({
    where: { id: { in: Array.from(allPackIds) } },
    select: {
      id: true,
      name: true
    }
  })

  for (const [roomId, room] of rooms.rooms) {
    if (!room?.public) continue

    const leader = room.getLeader()

    const started = room.game.state !== GameState.NOT_STARTED
    const selectedPacks = room.selectedPacks.map(p => p.id)

    publicRooms.push({
      id: roomId,
      name: room.name,
      started,
      leader: userToApiUser(leader?.metadata?.user),
      players: room.game.players
        .filter(p => p !== leader)
        .map(p => p.metadata?.user.displayName || "???"),
      maxPlayers: room.playersLimit,
      packs: started
        ? allPacks.filter(p => selectedPacks.includes(p.id)).map(p => p.name)
        : [],
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
