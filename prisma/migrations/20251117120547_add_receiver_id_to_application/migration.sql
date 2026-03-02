-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "receiverId" INTEGER;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
