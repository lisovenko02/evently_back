/*
  Warnings:

  - You are about to drop the column `eventStatus` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `membersLimit` on the `Event` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(120)`.
  - You are about to alter the column `points` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[userId,eventId]` on the table `EventUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SPORTS', 'MUSIC', 'EDUCATION', 'BUSINESS', 'TECH', 'ART', 'GAMING', 'OTHER');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventStatus",
DROP COLUMN "membersLimit",
ADD COLUMN     "address" VARCHAR(200),
ADD COLUMN     "category" "EventCategory" NOT NULL,
ADD COLUMN     "city" VARCHAR(50),
ADD COLUMN     "country" VARCHAR(50),
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DECIMAL(9,6),
ADD COLUMN     "longitude" DECIMAL(9,6),
ADD COLUMN     "maxParticipants" INTEGER DEFAULT 100,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'OPEN_FOR_APPLICATIONS',
ADD COLUMN     "tags" VARCHAR(30)[],
ADD COLUMN     "visibility" "EventVisibility" NOT NULL DEFAULT 'OPEN',
ALTER COLUMN "title" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "points" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");

-- CreateIndex
CREATE INDEX "Event_isOnline_idx" ON "Event"("isOnline");

-- CreateIndex
CREATE INDEX "EventUser_role_idx" ON "EventUser"("role");

-- CreateIndex
CREATE UNIQUE INDEX "EventUser_userId_eventId_key" ON "EventUser"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
