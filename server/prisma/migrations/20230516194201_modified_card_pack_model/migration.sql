/*
  Warnings:

  - You are about to drop the column `bundle` on the `card_packs` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `card_packs` table. All the data in the column will be lost.
  - Added the required column `type_id` to the `card_packs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "card_packs" DROP COLUMN "bundle",
DROP COLUMN "type",
ADD COLUMN     "bundle_id" INTEGER,
ADD COLUMN     "type_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "card_pack_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "card_pack_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_pack_bundles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "card_pack_bundles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "card_packs" ADD CONSTRAINT "card_packs_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "card_pack_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_packs" ADD CONSTRAINT "card_packs_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "card_pack_bundles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
