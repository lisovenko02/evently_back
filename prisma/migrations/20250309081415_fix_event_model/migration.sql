-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "points" DROP NOT NULL;

-- DropEnum
DROP TYPE "EventStatus";
