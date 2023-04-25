/*
  Warnings:

  - Added the required column `strategy_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "strategy_id" TEXT NOT NULL
);
INSERT INTO "new_users" ("id", "name") SELECT "id", "name" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_strategy_id_key" ON "users"("strategy_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
