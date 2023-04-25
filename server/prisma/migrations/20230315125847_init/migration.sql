-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "card_packs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "black_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "pick" INTEGER NOT NULL DEFAULT 1,
    "pack_id" INTEGER NOT NULL,
    CONSTRAINT "black_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "white_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "pack_id" INTEGER NOT NULL,
    CONSTRAINT "white_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
