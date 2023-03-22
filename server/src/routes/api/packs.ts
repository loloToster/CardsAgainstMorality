import { Router } from "express"
import db from "../../modules/db"

const router = Router()

router.get("/", async (req, res) => {
  const packs = await db.cardPack.findMany()
  res.json({ packs })
})

export = router
