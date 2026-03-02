-- AlterTable
ALTER TABLE "EventUserHistory" ADD COLUMN     "actorUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "EventUserHistory" ADD CONSTRAINT "EventUserHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
