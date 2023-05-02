import { Router } from "express"
import db from "../../modules/db"
import { ApiCardPack } from "../../types"

const INT_REGEX = /^\d+$/

const router = Router()

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const foundPack = await db.cardPack.findFirst({
    where: {
      OR: [{ id: INT_REGEX.test(id) ? parseInt(id) : -1 }, { name: id }]
    },
    include: {
      _count: {
        select: {
          blackCards: true,
          whiteCards: true
        }
      }
    }
  })

  const pack: ApiCardPack | null = foundPack
    ? {
      id: foundPack.id,
      name: foundPack.name,
      color: foundPack.color,
      icon: foundPack.icon,
      numOfBlacks: foundPack._count.blackCards,
      numOfWhites: foundPack._count.whiteCards
    }
    : null

  res.json({ pack })
})

// TODO: add pagination
router.get("/:id/cards", async (req, res) => {
  const { id } = req.params

  if (!INT_REGEX.test(id)) return res.status(400).send()

  const cards = await db.cardPack.findFirst({
    where: { id: parseInt(id) },
    select: {
      blackCards: { select: { id: true, text: true, draw: true, pick: true } },
      whiteCards: { select: { id: true, text: true } }
    }
  })

  if (!cards) return res.status(404).send()

  res.json({ cards })
})

export = router
