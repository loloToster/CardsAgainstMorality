/*
  Warnings:

  - You are about to drop the `_CardPackToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CardPackToUser" DROP CONSTRAINT "_CardPackToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardPackToUser" DROP CONSTRAINT "_CardPackToUser_B_fkey";

-- AlterTable
ALTER TABLE "card_packs" ADD COLUMN     "owner_id" INTEGER;

-- DropTable
DROP TABLE "_CardPackToUser";

-- CreateTable
CREATE TABLE "_likes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_likes_AB_unique" ON "_likes"("A", "B");

-- CreateIndex
CREATE INDEX "_likes_B_index" ON "_likes"("B");

-- AddForeignKey
ALTER TABLE "card_packs" ADD CONSTRAINT "card_packs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likes" ADD CONSTRAINT "_likes_A_fkey" FOREIGN KEY ("A") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likes" ADD CONSTRAINT "_likes_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
