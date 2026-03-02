/*
  Warnings:

  - You are about to drop the column `tags` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('REQUEST', 'INVITE');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "type" "ApplicationType" NOT NULL DEFAULT 'REQUEST';

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "tags";
