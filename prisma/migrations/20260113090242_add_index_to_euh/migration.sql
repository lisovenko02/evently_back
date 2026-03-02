-- DropIndex
DROP INDEX "EventUserHistory_eventId_idx";

-- DropIndex
DROP INDEX "EventUserHistory_eventUserId_idx";

-- DropIndex
DROP INDEX "EventUserHistory_userId_idx";

-- CreateIndex
CREATE INDEX "EventUserHistory_eventId_createdAt_idx" ON "EventUserHistory"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventUserHistory_eventId_status_idx" ON "EventUserHistory"("eventId", "status");

-- CreateIndex
CREATE INDEX "EventUserHistory_eventId_actorUserId_idx" ON "EventUserHistory"("eventId", "actorUserId");
