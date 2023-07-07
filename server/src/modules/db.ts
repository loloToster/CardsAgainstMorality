import cards from "../cards.json"

import { PrismaClient, User } from "@prisma/client"

import { subtractMs } from "../utils"
import { get } from "../utils/get"

import type { ApiBlackCard, ApiWhiteCard } from "../types"

import {
  ICONS_URL,
  MIN_TIME_BETWEEN_ANS_USER_RM,
  INACTIVITY_TIME,
  StrategyIdentifier,
  PROD,
  SYNC_CARDS_ARGV
} from "../consts"

import logger from "./logger"

type ValueOrArray<T> = T | ValueOrArray<T>[]

class Database extends PrismaClient {
  lastInactiveAnonymousUserRemoval: Date

  constructor() {
    super()

    this.lastInactiveAnonymousUserRemoval = new Date(0)

    this.$use(async (params, next) => {
      const result: unknown = await next(params)

      if (params.model === "User" && params.action === "findUnique") {
        this.anonymousUsersMiddleware(result as User | null)
      }

      return result
    })
  }

  async anonymousUsersMiddleware(user: User | null) {
    try {
      if (user) await this.bumpAnonymousUser(user)
    } catch (err) {
      logger.error(err)
    }

    const now = new Date()

    if (
      now.getTime() - this.lastInactiveAnonymousUserRemoval.getTime() >
      MIN_TIME_BETWEEN_ANS_USER_RM
    ) {
      this.lastInactiveAnonymousUserRemoval = now
      await this.deleteInactiveAnonymousUsers()
    }
  }

  async deleteInactiveAnonymousUsers() {
    const { count } = await this.user.deleteMany({
      where: {
        AND: [
          {
            strategyId: { equals: StrategyIdentifier.Anonymous }
          },
          { lastUsed: { not: null } },
          { lastUsed: { lte: subtractMs(new Date(), INACTIVITY_TIME) } }
        ]
      }
    })

    logger.info(
      count
        ? `Deleted ${count} inactive anonymous users`
        : "No inactive anonymous users found"
    )
  }

  async bumpAnonymousUser(user: User, currentlyUsing?: boolean) {
    if (user.strategyId !== StrategyIdentifier.Anonymous) return

    logger.info(`bumping user with id: '${user.id}'`)

    const lastUsed = currentlyUsing ? null : new Date()

    try {
      await this.user.updateMany({
        where:
          currentlyUsing === undefined
            ? { AND: [{ id: user.id }, { NOT: { lastUsed: null } }] }
            : { id: user.id },
        data: { lastUsed }
      })
    } catch (err) {
      logger.error(err)
    }
  }

  async preHttpServerStart() {
    await this.syncIcons()
    await this.syncCards()

    await this.user.deleteMany({
      where: {
        AND: [{ strategyId: StrategyIdentifier.Anonymous }, { lastUsed: null }]
      }
    })
  }

  async syncIcons() {
    if (!PROD && (await db.icon.count())) return

    logger.info("Syncing icons")

    const res = await get(ICONS_URL)

    if (res.status !== 200) throw new Error("Failed to sync icons")

    const icons: Array<{
      name: string
      aliases: string[]
      tags: string[]
      [key: string]: unknown
    }> = JSON.parse(res.data)

    await this.icon.deleteMany()
    await this.icon.createMany({
      data: icons.map(i => ({
        name: i.name,
        search: [i.name, ...i.aliases, ...i.tags].join("|")
      }))
    })
  }

  private filePackToDbPack(pack: (typeof cards.packs)[number]) {
    const blackCards = cards.black.filter(c => c.pack === pack.id)
    const whiteCards = cards.white.filter(c => c.pack === pack.id)

    return {
      id: pack.id.toString(),
      name: pack.name,
      official: true,
      type: { connect: { id: pack.type } },
      bundle:
        pack.bundle === undefined
          ? undefined
          : { connect: { id: pack.bundle } },
      tags: { connect: pack.tags?.map(t => ({ id: t })) ?? [] },
      color: pack.color,
      icon: pack.icon,
      numberOfCards: blackCards.length + whiteCards.length,
      blackCards: {
        create: blackCards.map(c => ({
          text: c.text,
          draw: c.draw,
          pick: c.pick
        }))
      },
      whiteCards: { create: whiteCards.map(c => ({ text: c.text })) }
    }
  }

  async syncCards() {
    if (!PROD && !process.argv.includes(SYNC_CARDS_ARGV)) return

    logger.info("Syncing cards")

    // SYNC TYPES
    const existingTypeIds = (
      await db.cardPackType.findMany({
        select: { id: true }
      })
    ).map(t => t.id)

    for (const typ of cards.types) {
      const { id } = typ

      if (existingTypeIds.includes(id)) {
        await db.cardPackType.update({ where: { id }, data: typ })
      } else {
        await db.cardPackType.create({ data: typ })
      }
    }

    await db.cardPack.updateMany({
      where: { typeId: { notIn: cards.types.map(t => t.id) } },
      data: { typeId: cards.types[0].id }
    })

    await this.cardPackType.deleteMany({
      where: { id: { notIn: cards.types.map(t => t.id) } }
    })

    // SYNC BUNDLES
    const existingBundleIds = (
      await db.cardPackBundle.findMany({
        select: { id: true }
      })
    ).map(b => b.id)

    for (const bun of cards.bundles) {
      const { id } = bun

      if (existingBundleIds.includes(id)) {
        await db.cardPackBundle.update({ where: { id }, data: bun })
      } else {
        await db.cardPackBundle.create({ data: bun })
      }
    }

    await db.cardPack.updateMany({
      where: { bundleId: { notIn: cards.bundles.map(b => b.id) } },
      data: { bundleId: null }
    })

    await this.cardPackBundle.deleteMany({
      where: { id: { notIn: cards.bundles.map(b => b.id) } }
    })

    // SYNC TAGS
    await this.cardPackTag.deleteMany({
      where: { id: { notIn: cards.tags.map(t => t.id) } }
    })

    const existingTagIds = (
      await db.cardPackTag.findMany({
        select: { id: true }
      })
    ).map(t => t.id)

    for (const tag of cards.tags) {
      const { id } = tag

      if (existingTagIds.includes(id)) {
        await db.cardPackTag.update({ where: { id }, data: tag })
      } else {
        await db.cardPackTag.create({ data: tag })
      }
    }

    // DELETE
    await db.cardPack.deleteMany({
      where: {
        id: { notIn: cards.packs.map(p => p.id.toString()) },
        official: true // make sure NO USERS PACK ARE DELETED
      }
    })

    // CREATE & UPDATE
    const existingPackIds = (
      await db.cardPack.findMany({
        where: { official: true },
        select: { id: true }
      })
    ).map(p => p.id)

    for (const pack of cards.packs) {
      const id = pack.id.toString()
      const data = this.filePackToDbPack(pack)

      if (existingPackIds.includes(id)) {
        await this.cardPack.update({
          where: { id },
          data: {
            blackCards: { deleteMany: {} },
            whiteCards: { deleteMany: {} }
          }
        })

        await this.cardPack.update({ where: { id }, data })
      } else {
        await this.cardPack.create({ data })
      }
    }
  }

  async getApiBlackCard(id: number): Promise<ApiBlackCard> {
    const card = await this.blackCard.findUnique({
      where: { id },
      include: { pack: true }
    })

    if (!card) throw new Error("Non exisitng card")

    return {
      id: card.id,
      text: card.text,
      pick: card.pick || 1,
      draw: card.draw || 0,
      pack: card.pack.name
    }
  }

  private rawMapIdsToApiWhiteCards(
    ids: ValueOrArray<number>[],
    cards: ApiWhiteCard[]
  ): ValueOrArray<ApiWhiteCard> {
    return ids.map(idOrIds => {
      if (Array.isArray(idOrIds))
        return this.rawMapIdsToApiWhiteCards(idOrIds, cards)

      const card = cards.find(c => c.id === idOrIds)

      if (!card) throw new Error("Non exisitng card")

      return card
    })
  }

  /**
   * Maps recursive array of card ids to its corresponding ApiWhiteCard
   * remaining the array structure and order.
   * For example [1, 2, [3, 4]] will turn into [card, card, [card, card]]
   */
  async mapIdsToApiWhiteCards(ids: ValueOrArray<number>) {
    if (Array.isArray(ids)) {
      const cards = await this.whiteCard.findMany({
        where: {
          id: {
            in:
              // @ts-ignore
              ids.flat(Infinity) as number[]
          }
        },
        include: { pack: true }
      })

      return this.rawMapIdsToApiWhiteCards(
        ids,
        cards.map(c => ({ id: c.id, text: c.text, pack: c.pack.name }))
      )
    } else {
      const card = await this.whiteCard.findUnique({
        where: { id: ids },
        include: { pack: true }
      })

      if (!card) throw new Error("Non exisitng card")

      return {
        id: card.id,
        text: card.text,
        pack: card.pack.name
      } satisfies ApiWhiteCard
    }
  }
}

const db = new Database()

export default db
