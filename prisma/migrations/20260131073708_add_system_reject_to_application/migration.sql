-- CreateEnum
CREATE TYPE "ApplicationRejectSource" AS ENUM ('STAFF', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ApplicationSystemRejectReason" AS ENUM ('CHANGED_VISIBILITY', 'EVENT_IS_OVER');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_eventId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "rejectSource" "ApplicationRejectSource" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "systemRejectReason" "ApplicationSystemRejectReason";

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
