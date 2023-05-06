-- CreateTable
CREATE TABLE "_CardPackToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CardPackToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "card_packs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CardPackToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CardPackToUser_AB_unique" ON "_CardPackToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CardPackToUser_B_index" ON "_CardPackToUser"("B");
