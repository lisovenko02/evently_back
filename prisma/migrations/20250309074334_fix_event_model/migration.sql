/*
  Warnings:

  - You are about to drop the column `status` on the `Event` table. All the data in the column will be lost.
  - Made the column `description` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "status",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "address" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT;
