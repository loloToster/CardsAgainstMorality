import { Router } from "express"
import { createRoom } from "../../modules/io"

const router = Router()

router.get("/", (req, res) => {
  const roomId = createRoom()
  res.json({ roomId })
})

router.get("/:id", (req, res) => {
  res.send()
})

export = router
