-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_approverId_fkey";

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "approverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
