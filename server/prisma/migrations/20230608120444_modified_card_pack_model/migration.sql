/*
  Warnings:

  - The primary key for the `card_packs` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_CardPackToCardPackTag" DROP CONSTRAINT "_CardPackToCardPackTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_likes" DROP CONSTRAINT "_likes_A_fkey";

-- DropForeignKey
ALTER TABLE "black_cards" DROP CONSTRAINT "black_cards_pack_id_fkey";

-- DropForeignKey
ALTER TABLE "white_cards" DROP CONSTRAINT "white_cards_pack_id_fkey";

-- AlterTable
ALTER TABLE "_CardPackToCardPackTag" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_likes" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "black_cards" ALTER COLUMN "pack_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "card_packs" DROP CONSTRAINT "card_packs_pkey",
ADD COLUMN     "official" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "number_of_cards" SET DEFAULT 0,
ADD CONSTRAINT "card_packs_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "card_packs_id_seq";

-- AlterTable
ALTER TABLE "white_cards" ALTER COLUMN "pack_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "black_cards" ADD CONSTRAINT "black_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "white_cards" ADD CONSTRAINT "white_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardPackToCardPackTag" ADD CONSTRAINT "_CardPackToCardPackTag_A_fkey" FOREIGN KEY ("A") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likes" ADD CONSTRAINT "_likes_A_fkey" FOREIGN KEY ("A") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
