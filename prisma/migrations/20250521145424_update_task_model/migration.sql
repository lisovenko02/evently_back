/*
  Warnings:

  - You are about to drop the column `boardId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TaskBoard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[boardId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId]` on the table `TaskBoard` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_eventId_fkey";

-- DropForeignKey
ALTER TABLE "TaskBoard" DROP CONSTRAINT "TaskBoard_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "boardId" INTEGER;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "boardId",
DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "TaskBoard" DROP COLUMN "title";

-- CreateIndex
CREATE UNIQUE INDEX "Event_boardId_key" ON "Event"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskBoard_eventId_key" ON "TaskBoard"("eventId");

-- AddForeignKey
ALTER TABLE "TaskBoard" ADD CONSTRAINT "TaskBoard_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
