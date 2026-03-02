import { EventUserHistoryStatus } from '@prisma/client';

export interface RecordEventUserActionInput {
  eventId: number;
  userId: number;
  eventUserId: number;
  actorUserId?: number;
  status: EventUserHistoryStatus;
  reason?: string;
}
