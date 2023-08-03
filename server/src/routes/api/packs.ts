import { Router } from "express"
import db from "../../modules/db"
import type {
  ApiCardPack,
  ApiRandomCard,
  SearchCriteria,
  SortType
} from "../../types"
import { getRandomInt } from "../../utils/random"

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

  const { q, author, owner, types, bundles, tags, sort, liked } = parsedQuery

  const ownerId = owner ? parseInt(owner) : undefined
  const parsedTypes = parseSearchArray(types)
  const parsedBundles = parseSearchArray(bundles)
  const parsedTags = parseSearchArray(tags)

  const parsedSort = SORT_MAP[sort as SortType] as object | undefined

  const packs = await db.cardPack.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              private: req.user && ownerId === req.user.id ? undefined : false,
              ownerId
            },
            ...(req.user && !ownerId
              ? [
                {
                  private: true,
                  ownerId: req.user.id
                }
              ]
              : [])
          ]
        },
        {
          official: author ? author === "official" : undefined,
          name: q && { contains: q, mode: "insensitive" },
          typeId: parsedTypes && { in: parsedTypes },
          bundleId: parsedBundles && { in: parsedBundles },
          tags: parsedTags && { some: { id: { in: parsedTags } } },
          likedBy: liked ? { some: { id: req.user?.id ?? -1 } } : undefined
        }
      ]
    },
    orderBy: [
      ...(parsedSort ? [parsedSort] : []),
      { official: "desc" },
      { typeId: "asc" },
      { numberOfCards: "desc" },
      { icon: "asc" }
    ],
    include: {
      type: true,
      bundle: true,
      tags: true,
      owner: {
        select: {
          id: true,
          displayName: true
        }
      },
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
    allCommunity: await db.cardPack.count({
      where: { official: false, private: false }
    }),
    packs: packs.map(
      p =>
        ({
          id: p.id,
          name: p.name,
          private: p.private,
          official: p.official,
          type: p.type,
          bundle: p.bundle,
          color: p.color,
          icon: p.icon,
          tags: p.tags,
          numOfBlacks: p._count.blackCards,
          numOfWhites: p._count.whiteCards,
          likedBy: p._count.likedBy,
          liked: liked ? true : undefined,
          owner: p.owner
            ? { id: p.owner.id, name: p.owner.displayName }
            : undefined
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

  const criteria = { where: { pack: { private: false } } }

  const totalWhiteCards = await db.whiteCard.count(criteria)
  const totalBlackCards = await db.blackCard.count(criteria)

  const dbWhiteCards = await db.whiteCard.findMany({
    ...criteria,
    include: { pack: true },
    take: NUM_OF_WHITE,
    skip: getRandomInt(0, totalWhiteCards - NUM_OF_WHITE)
  })

  const dbBlackCards = await db.blackCard.findMany({
    ...criteria,
    include: { pack: true },
    take: NUM_OF_BLACK,
    skip: getRandomInt(0, totalBlackCards - NUM_OF_BLACK)
  })

  const cards: ApiRandomCard[] = dbWhiteCards
    .map(
      c =>
        ({
          id: c.id,
          text: c.text,
          pack: c.pack.name,
          color: "white"
        } as ApiRandomCard)
    )
    .concat(
      dbBlackCards.map(
        c =>
          ({
            id: c.id,
            text: c.text,
            pack: c.pack.name,
            color: "black"
          } as ApiRandomCard)
      )
    )

  res.json({ cards })
})

const MAX_ICONS = 64

router.get("/icons", async (req, res) => {
  const { q } = req.query

  if (typeof q !== "string") return res.status(400).send()

  const icons = await db.icon.findMany({
    where: {
      search: { contains: q }
    },
    take: MAX_ICONS
  })

  res.json({ icons: icons.map(i => i.name) })
})

export = router
