import { Router } from "express"
import { isAdminMiddleware } from "../../middleware/is-admin"
import type { Rooms, Room } from "../../modules/rooms"

const router = Router()

router.use(isAdminMiddleware)

router.get("/", (req, res) => {
  const rooms: Rooms = req.app.get("rooms")

  const responseBody = {
    rooms: (Array.from(rooms.rooms.values()).filter(r => r) as Room[]).map(
      r => ({
        id: r.id,
        public: r.public,
        creator: r.creator,
        leader: r.getLeader()?.metadata?.user.id,
        blackCards: r.game.blackCards.length,
        whiteCards: r.game.whiteCards,
        scoreLimit: r.scoreLimit,
        roundLimit: r.roundLimit
      })
    )
  }

  res.header("Content-Type", "application/json")
  res.send(JSON.stringify(responseBody, null, 2))
})

export = router
