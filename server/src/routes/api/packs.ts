import { Router } from "express"
import { CardPack } from "@prisma/client"

import db from "../../modules/db"

import { ApiCardPack } from "../../types"

import { getRandomInt } from "../../utils/random"

const router = Router()

interface CardPackWithNumOfCards extends CardPack {
  num_of_whites: bigint
  num_of_blacks: bigint
}

router.get("/", async (req, res) => {
  const packs = await db.$queryRaw<CardPackWithNumOfCards[]>`
    SELECT 
      card_packs.*,
      COUNT(DISTINCT white_cards.id) as num_of_whites,
      COUNT(DISTINCT black_cards.id) as num_of_blacks
    FROM card_packs
      LEFT JOIN white_cards ON card_packs.id=white_cards.pack_id 
      LEFT JOIN black_cards ON card_packs.id=black_cards.pack_id 
    GROUP BY card_packs.id;
  `

  res.json({
    packs: packs.map(
      p =>
        ({
          id: p.id,
          name: p.name,
          color: p.color,
          icon: p.icon,
          numOfBlacks: Number(p.num_of_blacks),
          numOfWhites: Number(p.num_of_whites)
        } satisfies ApiCardPack)
    )
  })
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
