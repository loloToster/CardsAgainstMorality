-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "last_used" TIMESTAMP(3),
    "strategy_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_packs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bundle" TEXT,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "card_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "black_cards" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "pick" INTEGER,
    "draw" INTEGER,
    "pack_id" INTEGER NOT NULL,

    CONSTRAINT "black_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "white_cards" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "pack_id" INTEGER NOT NULL,

    CONSTRAINT "white_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CardPackToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CardPackToUser_AB_unique" ON "_CardPackToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CardPackToUser_B_index" ON "_CardPackToUser"("B");

-- AddForeignKey
ALTER TABLE "black_cards" ADD CONSTRAINT "black_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "white_cards" ADD CONSTRAINT "white_cards_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "card_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardPackToUser" ADD CONSTRAINT "_CardPackToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardPackToUser" ADD CONSTRAINT "_CardPackToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
