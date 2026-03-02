/*
  Warnings:

  - You are about to drop the column `assignedById` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `assigneeId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Task` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boardId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `columnId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipant" DROP CONSTRAINT "ChatParticipant_eventUserId_fkey";

-- DropForeignKey
ALTER TABLE "EventUser" DROP CONSTRAINT "EventUser_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventUser" DROP CONSTRAINT "EventUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "chatImg" TEXT,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "recipientId" INTEGER;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignedById",
DROP COLUMN "assigneeId",
DROP COLUMN "status",
ADD COLUMN     "boardId" INTEGER NOT NULL,
ADD COLUMN     "columnId" INTEGER NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "TaskAssignee" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "assignedById" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskBoard" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskColumn" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "boardId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskColumn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignee_taskId_assigneeId_key" ON "TaskAssignee"("taskId", "assigneeId");

-- AddForeignKey
ALTER TABLE "EventUser" ADD CONSTRAINT "EventUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventUser" ADD CONSTRAINT "EventUser_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "TaskColumn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "TaskBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "EventUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignee" ADD CONSTRAINT "TaskAssignee_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "EventUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "EventUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskBoard" ADD CONSTRAINT "TaskBoard_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskColumn" ADD CONSTRAINT "TaskColumn_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "TaskBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "EventUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "EventUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_eventUserId_fkey" FOREIGN KEY ("eventUserId") REFERENCES "EventUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "EventUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
