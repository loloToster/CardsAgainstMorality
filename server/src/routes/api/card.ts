import { Router } from "express"

import type { CardColor } from "../../types"

import db from "../../modules/db"
import { CARD_COLORS } from "../../consts"
import { validateDto } from "../../utils"
import { nonAnonymous } from "../../middleware/non-anonymous"
import { UpdateCardDto } from "../../dtos/api/update-card.dto"

const router = Router()

async function validateCardOwnage(
  userId: number | undefined,
  color: CardColor,
  cardId: number
) {
  if (!userId) return false

  const opts = {
    where: { id: cardId },
    select: { pack: { select: { ownerId: true } } }
  }

  const targetCard =
    color === "black"
      ? await db.blackCard.findUnique(opts)
      : await db.whiteCard.findUnique(opts)

  return targetCard?.pack.ownerId === userId
}

router.use(nonAnonymous)

const path = "/:clr/:cId"

router.use(path, async (req, res, next) => {
  const { clr, cId } = req.params
  const color = clr as CardColor
  const id = parseInt(cId)

  if (!CARD_COLORS.includes(color)) return res.status(404).send()

  if (!(await validateCardOwnage(req.user?.id, color, id)))
    return res.status(403).send()

  next()
})

router.patch(path, async (req, res) => {
  const { clr, cId } = req.params
  const color = clr as CardColor
  const id = parseInt(cId)

  const cardModifications = await validateDto(UpdateCardDto, req.body)

  if (color === "black") {
    await db.blackCard.update({
      where: { id },
      data: {
        text: cardModifications.text
      }
    })
  } else {
    await db.whiteCard.update({
      where: { id },
      data: {
        text: cardModifications.text
      }
    })
  }

  res.send()
})

router.delete(path, async (req, res) => {
  const { clr, cId } = req.params
  const color = clr as CardColor
  const id = parseInt(cId)

  const isBlack = color === "black"

  if (isBlack) {
    await db.blackCard.delete({ where: { id } })
  } else {
    await db.whiteCard.delete({ where: { id } })
  }

  const where = isBlack
    ? { blackCards: { some: { id } } }
    : { whiteCards: { some: { id } } }

  await db.cardPack.updateMany({
    where,
    data: { numberOfCards: { decrement: 1 } }
  })

  res.send()
})

export = router
