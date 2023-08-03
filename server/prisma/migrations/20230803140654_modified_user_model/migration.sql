/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `display_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `username` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "users" RENAME COLUMN "name" TO "display_name";
ALTER TABLE "users" ADD COLUMN "username" TEXT NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "users" ALTER COLUMN "username" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
