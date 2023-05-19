/*
  Warnings:

  - Added the required column `number_of_cards` to the `card_packs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "card_packs" ADD COLUMN     "number_of_cards" INTEGER NOT NULL;
