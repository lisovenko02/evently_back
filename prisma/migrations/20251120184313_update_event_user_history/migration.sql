/*
  Warnings:

  - You are about to drop the column `status` on the `EventUser` table. All the data in the column will be lost.
  - Made the column `image` on table `Pin` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EventUserHistoryStatus" AS ENUM ('JOINED', 'SELF_LEFT', 'KICKED', 'BANNED', 'UNBANNED');

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "maxParticipants" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EventUser" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Pin" ALTER COLUMN "image" SET NOT NULL;

-- DropEnum
DROP TYPE "EventUserStatus";

-- CreateTable
CREATE TABLE "EventUserHistory" (
    "id" SERIAL NOT NULL,
    "eventUserId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "status" "EventUserHistoryStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventUserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventUserHistory_userId_idx" ON "EventUserHistory"("userId");

-- CreateIndex
CREATE INDEX "EventUserHistory_eventId_idx" ON "EventUserHistory"("eventId");

-- CreateIndex
CREATE INDEX "EventUserHistory_eventUserId_idx" ON "EventUserHistory"("eventUserId");

-- AddForeignKey
ALTER TABLE "EventUserHistory" ADD CONSTRAINT "EventUserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventUserHistory" ADD CONSTRAINT "EventUserHistory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
