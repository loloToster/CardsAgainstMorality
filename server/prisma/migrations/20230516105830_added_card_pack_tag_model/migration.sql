-- CreateTable
CREATE TABLE "card_pack_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "card_pack_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CardPackToCardPackTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CardPackToCardPackTag_AB_unique" ON "_CardPackToCardPackTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CardPackToCardPackTag_B_index" ON "_CardPackToCardPackTag"("B");

-- AddForeignKey
ALTER TABLE "_CardPackToCardPackTag" ADD CONSTRAINT "_CardPackToCardPackTag_A_fkey" FOREIGN KEY ("A") REFERENCES "card_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardPackToCardPackTag" ADD CONSTRAINT "_CardPackToCardPackTag_B_fkey" FOREIGN KEY ("B") REFERENCES "card_pack_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
