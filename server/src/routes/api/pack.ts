import { Router } from "express"
import { transformAndValidate } from "class-transformer-validator"

import type { ApiCardPack } from "../../types"

import db from "../../modules/db"
import { StrategyIdentifier } from "../../consts"
import { PackDetailsDto } from "../../dtos/api/pack-details.dto"

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

// ensure non anonymous user is requesting
router.use((req, res, next) => {
  if (!req.user) return res.status(401).send()
  if (req.user.strategyId.startsWith(StrategyIdentifier.Anonymous))
    return res.status(403).send()

  next()
})

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

router.post("/:id/details", async (req, res) => {
  const { id } = req.params

  const details = await transformAndValidate(PackDetailsDto, req.body, {
    validator: {
      whitelist: true
    }
  })

  if (Array.isArray(details)) return res.status(400).send()

  const targetPack = await db.cardPack.findUnique({ where: { id } })

  if (
    !targetPack ||
    typeof targetPack.ownerId !== "number" ||
    targetPack.ownerId !== req.user?.id
  )
    return res.status(403).send()

  if (details.icon !== undefined) {
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

export = router
