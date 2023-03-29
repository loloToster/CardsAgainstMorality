-- DropIndex
DROP INDEX "users_strategy_id_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN "last_used" DATETIME;
