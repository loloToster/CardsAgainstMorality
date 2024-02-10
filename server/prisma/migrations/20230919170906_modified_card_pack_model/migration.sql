/*
  Warnings:

  - You are about to drop the column `private` on the `card_packs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "card_packs" ADD COLUMN "privacy" INTEGER NOT NULL DEFAULT 0;

UPDATE "card_packs" SET privacy = CASE WHEN private = true THEN 2 ELSE 0 END;

ALTER TABLE "card_packs" DROP COLUMN "private";
