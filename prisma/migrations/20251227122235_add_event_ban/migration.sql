-- CreateTable
CREATE TABLE "EventBan" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT,
    "bannedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventBan_eventId_idx" ON "EventBan"("eventId");

-- CreateIndex
CREATE INDEX "EventBan_userId_idx" ON "EventBan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBan_eventId_userId_key" ON "EventBan"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventBan" ADD CONSTRAINT "EventBan_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBan" ADD CONSTRAINT "EventBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBan" ADD CONSTRAINT "EventBan_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
