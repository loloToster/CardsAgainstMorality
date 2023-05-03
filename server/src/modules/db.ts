import cards from "../../cards.json"

import { PrismaClient, User } from "@prisma/client"

import { subtractMs } from "../utils"
import { ApiBlackCard, ApiWhiteCard } from "../types"
import {
  MIN_TIME_BETWEEN_ANS_USER_RM,
  INACTIVITY_TIME,
  StrategyIdentifier
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
    await this.syncCards()

    await this.user.deleteMany({
      where: {
        AND: [{ strategyId: StrategyIdentifier.Anonymous }, { lastUsed: null }]
      }
    })
  }

  async syncCards() {
    const numOfBlackCards = await this.blackCard.count()
    const numOfWhiteCards = await this.whiteCard.count()
    const numOfPacks = await this.cardPack.count()

    if (
      numOfBlackCards === cards.black.length &&
      numOfWhiteCards === cards.white.length &&
      numOfPacks === cards.packs.length
    )
      return

    logger.info("Syncing cards")

    await this.blackCard.deleteMany()
    await this.whiteCard.deleteMany()
    await this.cardPack.deleteMany()

    for (const pack of cards.packs) {
      const blackCards = cards.black.filter(c => c.pack === pack.id)
      const whiteCards = cards.white.filter(c => c.pack === pack.id)

      await this.cardPack.create({
        data: {
          name: pack.name,
          color: pack.color,
          icon: pack.icon,
          blackCards: {
            create: blackCards.map(c => ({
              text: c.text,
              draw: c.draw,
              pick: c.pick
            }))
          },
          whiteCards: { create: whiteCards.map(c => ({ text: c.text })) }
        }
      })
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
