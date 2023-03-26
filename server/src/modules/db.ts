import cards from "../../cards.json"
import { PrismaClient } from "@prisma/client"
import { ApiWhiteCard } from "../types"

type ValueOrArray<T> = T | ValueOrArray<T>[]

class Database extends PrismaClient {
  constructor() {
    super()
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
            create: blackCards.map(c => ({ text: c.text, pick: c.pick }))
          },
          whiteCards: { create: whiteCards.map(c => ({ text: c.text })) }
        }
      })
    }
  }

  async getApiBlackCard(id: number) {
    const card = await this.blackCard.findUnique({
      where: { id },
      include: { pack: true }
    })

    if (!card) throw new Error("Non exisitng card")

    return {
      id: card.id,
      text: card.text,
      pick: card.pick || 1,
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
