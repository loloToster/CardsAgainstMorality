import { Router } from "express"
import db from "../../modules/db"
import type { Rooms } from "../../modules/rooms"

const router = Router()

router.get("/", async (req, res) => {
  const rooms: Rooms = req.app.get("rooms")

  const responseBody = {
    users: await db.user.count(),
    allOfficialPacks: await db.cardPack.count({ where: { official: true } }),
    allCommunityPacks: await db.cardPack.count({ where: { official: false } }),
    rooms: Array.from(rooms.rooms.keys()).length
  }

  res.header("Content-Type", "application/json")
  res.send(JSON.stringify(responseBody, null, 2))
})

export = router
