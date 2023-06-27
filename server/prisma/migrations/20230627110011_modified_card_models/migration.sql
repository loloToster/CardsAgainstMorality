-- DropForeignKey
ALTER TABLE "black_cards" DROP CONSTRAINT "black_cards_pack_id_fkey";

-- DropForeignKey
ALTER TABLE "white_cards" DROP CONSTRAINT "white_cards_pack_id_fkey";

-- AddForeignKey
ALTER TABLE "black_cards" ADD CONSTRAINT "black_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "white_cards" ADD CONSTRAINT "white_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
