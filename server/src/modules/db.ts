import cards from "../../cards.json"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const syncedCards = new Promise<void>(res => {
  const main = async () => {
    await prisma.blackCard.deleteMany()
    await prisma.whiteCard.deleteMany()
    await prisma.cardPack.deleteMany()

    for (let i = 0; i < cards.packs.length; i++) {
      const pack = cards.packs[i]
      const blackCards = cards.black.filter(c => c.pack === i)
      const whiteCards = cards.white.filter(c => c.pack === i)

      await prisma.cardPack.create({
        data: {
          name: pack.name,
          blackCards: {
            create: blackCards.map(c => ({ text: c.text, pick: c.pick }))
          },
          whiteCards: { create: whiteCards.map(c => ({ text: c.text })) }
        }
      })
    }

    res()
  }

  main()
})

export default prisma
