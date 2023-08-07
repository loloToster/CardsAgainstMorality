-- DropForeignKey
ALTER TABLE "card_packs" DROP CONSTRAINT "card_packs_owner_id_fkey";

-- AddForeignKey
ALTER TABLE "card_packs" ADD CONSTRAINT "card_packs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
