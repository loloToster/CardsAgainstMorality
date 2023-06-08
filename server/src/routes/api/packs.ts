import { Router } from "express"
import db from "../../modules/db"
import type { ApiCardPack, SearchCriteria, SortType } from "../../types"
import { getRandomInt } from "../../utils/random"
import { StrategyIdentifier } from "../../consts"

const POS_INT_REGEX = /^\d+$/

const router = Router()

const searchArrSep = ","
function parseSearchArray(str: string | undefined) {
  if (!str) return undefined

  const splited = str.split(searchArrSep)
  const result: number[] = []

  for (const el of splited) {
    if (POS_INT_REGEX.test(el)) result.push(parseInt(el))
  }

  return result
}

const SORT_MAP: Record<SortType, object> = {
  likes: { likedBy: { _count: "desc" } },
  cards: { numberOfCards: "desc" },
  blacks: { blackCards: { _count: "desc" } },
  whites: { whiteCards: { _count: "desc" } }
}

router.get("/", async (req, res) => {
  const parsedQuery: Record<string, string | undefined> = {}

  Object.keys(req.query).forEach(key => {
    parsedQuery[key] = req.query[key]?.toString()
  })

  const { q, types, bundles, tags, sort, my } = parsedQuery

  const parsedTypes = parseSearchArray(types)
  const parsedBundles = parseSearchArray(bundles)
  const parsedTags = parseSearchArray(tags)

  const parsedSort = SORT_MAP[sort as SortType] as object | undefined

  const userPack =
    my &&
    req.user &&
    !req.user.strategyId.startsWith(StrategyIdentifier.Anonymous)

  const packs = await db.cardPack.findMany({
    where: {
      ownerId: userPack ? req.user?.id : undefined,
      name: q && { contains: q, mode: "insensitive" },
      typeId: parsedTypes && { in: parsedTypes },
      bundleId: parsedBundles && { in: parsedBundles },
      tags: parsedTags && { some: { id: { in: parsedTags } } }
    },
    orderBy: parsedSort ?? { id: "asc" },
    include: {
      type: true,
      bundle: true,
      tags: true,
      _count: {
        select: {
          blackCards: true,
          whiteCards: true,
          likedBy: true
        }
      }
    }
  })

  res.json({
    allOfficial: await db.cardPack.count({ where: { official: true } }),
    allCommunity: await db.cardPack.count({ where: { official: false } }),
    packs: packs.map(
      p =>
        ({
          id: p.id,
          name: p.name,
          official: p.official,
          type: p.type,
          bundle: p.bundle,
          color: p.color,
          icon: p.icon,
          tags: p.tags,
          numOfBlacks: p._count.blackCards,
          numOfWhites: p._count.whiteCards,
          likedBy: p._count.likedBy
        } satisfies ApiCardPack)
    )
  })
})

router.get("/search-criteria", async (req, res) => {
  res.json({
    types: await db.cardPackType.findMany(),
    bundles: await db.cardPackBundle.findMany(),
    tags: await db.cardPackTag.findMany()
  } satisfies SearchCriteria)
})

router.get("/random-cards", async (req, res) => {
  const NUM_OF_WHITE = 10
  const NUM_OF_BLACK = 4

  const totalWhiteCards = await db.whiteCard.count()
  const totalBlackCards = await db.blackCard.count()

  const dbWhiteCards = await db.whiteCard.findMany({
    include: { pack: true },
    take: NUM_OF_WHITE,
    skip: getRandomInt(0, totalWhiteCards - NUM_OF_WHITE)
  })

  const dbBlackCards = await db.blackCard.findMany({
    include: { pack: true },
    take: NUM_OF_BLACK,
    skip: getRandomInt(0, totalBlackCards - NUM_OF_BLACK)
  })

  const cards = dbWhiteCards
    .map(c => ({
      id: c.id,
      text: c.text,
      pack: c.pack.name,
      color: "white"
    }))
    .concat(
      dbBlackCards.map(c => ({
        id: c.id,
        text: c.text,
        pack: c.pack.name,
        color: "black"
      }))
    )

  res.json({ cards })
})

export = router
