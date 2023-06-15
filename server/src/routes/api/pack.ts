import { Router } from "express"
import { BlackCard, WhiteCard } from "@prisma/client"

import type { ApiCardPack } from "../../types"

import db from "../../modules/db"

import { PackDetailsDto } from "../../dtos/api/pack-details.dto"
import { CreateCardDto } from "../../dtos/api/create-card.dto"
import { nonAnonymous } from "../../middleware/non-anonymous"
import { validateDto } from "../../utils"

const router = Router()

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const foundPack = await db.cardPack.findFirst({
    where: { id },
    include: {
      type: true,
      bundle: true,
      tags: true,
      owner: true,
      _count: {
        select: {
          blackCards: true,
          whiteCards: true,
          likedBy: true
        }
      }
    }
  })

  let liked: boolean | undefined

  if (req.user && foundPack) {
    const { id: userId } = req.user

    const result = await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { likedPacks: { where: { id: foundPack.id } } }
    })

    liked = Boolean(result.likedPacks.length)
  }

  const pack: ApiCardPack | null = foundPack
    ? {
      id: foundPack.id,
      name: foundPack.name,
      official: foundPack.official,
      type: foundPack.type,
      bundle: foundPack.bundle,
      tags: foundPack.tags,
      color: foundPack.color,
      icon: foundPack.icon,
      numOfBlacks: foundPack._count.blackCards,
      numOfWhites: foundPack._count.whiteCards,
      likedBy: foundPack._count.likedBy,
      liked,
      owner: foundPack.owner
        ? { id: foundPack.owner.id, name: foundPack.owner.name }
        : undefined
    }
    : null

  res.json({ pack })
})

// TODO: add pagination
router.get("/:id/cards", async (req, res) => {
  const { id } = req.params

  const cards = await db.cardPack.findFirst({
    where: { id },
    select: {
      blackCards: { select: { id: true, text: true, draw: true, pick: true } },
      whiteCards: { select: { id: true, text: true } }
    }
  })

  if (!cards) return res.status(404).send()

  res.json({ cards })
})

router.use(nonAnonymous)

router.put("/:id/like", async (req, res) => {
  const { id } = req.params

  await db.user.update({
    where: { id: req.user?.id },
    data: { likedPacks: { connect: { id } } }
  })

  res.send()
})

router.delete("/:id/like", async (req, res) => {
  const { id } = req.params

  await db.user.update({
    where: { id: req.user?.id },
    data: { likedPacks: { disconnect: { id } } }
  })

  res.send()
})

router.post("/", async (req, res) => {
  const numOfPacks = await db.cardPack.count({
    where: { ownerId: req.user?.id }
  })

  const pack = await db.cardPack.create({
    data: {
      name: `My Card Pack #${numOfPacks + 1}`,
      type: { connect: { id: 2 } },
      owner: { connect: { id: req.user?.id } }
    }
  })

  res.json({
    id: pack.id
  })
})

async function validatePackOwnage(packId: string, userId: number | undefined) {
  if (!userId) return false

  const targetPack = await db.cardPack.findUnique({
    where: { id: packId },
    select: { ownerId: true }
  })

  return targetPack && targetPack.ownerId === userId
}

router.post("/:id/details", async (req, res) => {
  const { id } = req.params

  const details = await validateDto(PackDetailsDto, req.body)

  if (!(await validatePackOwnage(id, req.user?.id)))
    return res.status(403).send()

  if (details.icon !== undefined && details.icon !== null) {
    const icon = await db.icon.findUnique({ where: { name: details.icon } })

    if (!icon) return res.status(400).send()
  }

  await db.cardPack.update({
    where: { id },
    data: {
      name: details.name,
      color: details.color ?? null,
      icon: details.icon ?? null
    }
  })

  res.send()
})

router.post("/:id/card", async (req, res) => {
  const { id } = req.params

  const cardDetails = await validateDto(CreateCardDto, req.body)

  if (!(await validatePackOwnage(id, req.user?.id)))
    return res.status(403).send()

  const data = { text: cardDetails.text, pack: { connect: { id } } }

  let card: BlackCard | WhiteCard

  if (cardDetails.color === "black") {
    card = (await db.blackCard.create({
      data,
      select: { id: true, text: true, draw: true, pick: true }
    })) as BlackCard
  } else {
    card = (await db.whiteCard.create({
      data,
      select: { id: true, text: true }
    })) as WhiteCard
  }

  await db.cardPack.update({
    where: { id },
    data: { numberOfCards: { increment: 1 } }
  })

  res.send({ card })
})

export = router
