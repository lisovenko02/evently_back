/*
  Warnings:

  - You are about to drop the column `approverComment` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `approverId` on the `Application` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ApplicationRejectSource" ADD VALUE 'APPLICANT';

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_approverId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "approverComment",
DROP COLUMN "approverId",
ADD COLUMN     "decisionByComment" TEXT,
ADD COLUMN     "decisionById" INTEGER;

-- CreateIndex
CREATE INDEX "Application_eventId_type_applicationStatus_idx" ON "Application"("eventId", "type", "applicationStatus");

-- CreateIndex
CREATE INDEX "Application_decisionById_idx" ON "Application"("decisionById");

-- CreateIndex
CREATE INDEX "Application_senderId_idx" ON "Application"("senderId");

-- CreateIndex
CREATE INDEX "Application_receiverId_idx" ON "Application"("receiverId");

-- CreateIndex
CREATE INDEX "Application_eventId_createdAt_idx" ON "Application"("eventId", "createdAt");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_decisionById_fkey" FOREIGN KEY ("decisionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
