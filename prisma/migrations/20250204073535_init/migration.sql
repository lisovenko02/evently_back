/*
  Warnings:

  - The values [COMPLETED] on the enum `PinRarity` will be removed. If these variants are still used in the database, this will fail.
  - The values [low,medium,high] on the enum `TaskPriority` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `description` on table `Pin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "EventUserStatus" ADD VALUE 'ACTIVE';

-- AlterEnum
BEGIN;
CREATE TYPE "PinRarity_new" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
ALTER TABLE "Pin" ALTER COLUMN "rarity" TYPE "PinRarity_new" USING ("rarity"::text::"PinRarity_new");
ALTER TYPE "PinRarity" RENAME TO "PinRarity_old";
ALTER TYPE "PinRarity_new" RENAME TO "PinRarity";
DROP TYPE "PinRarity_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskPriority_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
ALTER TABLE "Task" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "priority" TYPE "TaskPriority_new" USING ("priority"::text::"TaskPriority_new");
ALTER TYPE "TaskPriority" RENAME TO "TaskPriority_old";
ALTER TYPE "TaskPriority_new" RENAME TO "TaskPriority";
DROP TYPE "TaskPriority_old";
ALTER TABLE "Task" ALTER COLUMN "priority" SET DEFAULT 'LOW';
COMMIT;

-- AlterTable
ALTER TABLE "EventUser" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Pin" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "priority" SET DEFAULT 'LOW';
