/*
  Warnings:

  - You are about to drop the column `eventId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isGroupMessage` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('GENERAL', 'PRIVATE', 'GROUP');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "eventId",
DROP COLUMN "isGroupMessage",
DROP COLUMN "isPinned",
DROP COLUMN "receiverId",
ADD COLUMN     "chatId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "type" "ChatType" NOT NULL,
    "name" TEXT,
    "eventId" INTEGER NOT NULL,
    "lastMessageId" INTEGER,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "eventUserId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" SERIAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "messageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_lastMessageId_key" ON "Chat"("lastMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_eventId_name_key" ON "Chat"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_chatId_eventUserId_key" ON "ChatParticipant"("chatId", "eventUserId");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_eventUserId_fkey" FOREIGN KEY ("eventUserId") REFERENCES "EventUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
