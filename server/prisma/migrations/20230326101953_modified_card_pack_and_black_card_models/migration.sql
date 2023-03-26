-- AlterTable
ALTER TABLE "card_packs" ADD COLUMN "color" TEXT;
ALTER TABLE "card_packs" ADD COLUMN "icon" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_black_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "pick" INTEGER,
    "draw" INTEGER,
    "pack_id" INTEGER NOT NULL,
    CONSTRAINT "black_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_black_cards" ("id", "pack_id", "pick", "text") SELECT "id", "pack_id", "pick", "text" FROM "black_cards";
DROP TABLE "black_cards";
ALTER TABLE "new_black_cards" RENAME TO "black_cards";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
