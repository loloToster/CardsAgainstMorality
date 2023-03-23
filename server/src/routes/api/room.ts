import { Router } from "express"
import { createRoom } from "../../modules/io"

const router = Router()

router.get("/", (req, res) => {
  if (!req.user) return res.status(401).send()

  const roomId = createRoom()
  res.json({ roomId })
})

router.get("/:id", (req, res) => {
  res.send()
})

export = router
