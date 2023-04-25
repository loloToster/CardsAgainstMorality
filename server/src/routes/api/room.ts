import { Router } from "express"
import type { Rooms } from "../../modules/rooms"

const router = Router()

router.get("/", (req, res) => {
  if (!req.user) return res.status(401).send()

  const rooms: Rooms = req.app.get("rooms")
  const roomId = rooms.createRoom(req.user.id)

  res.json({ roomId })
})

router.get("/:id", (req, res) => {
  res.send()
})

export = router
