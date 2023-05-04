/*
  Warnings:

  - Added the required column `type` to the `card_packs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_card_packs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bundle" TEXT,
    "icon" TEXT,
    "color" TEXT
);
INSERT INTO "new_card_packs" ("color", "icon", "id", "name") SELECT "color", "icon", "id", "name" FROM "card_packs";
DROP TABLE "card_packs";
ALTER TABLE "new_card_packs" RENAME TO "card_packs";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
