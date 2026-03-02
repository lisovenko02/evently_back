import { ApplicationSystemRejectReason, Prisma } from '@prisma/client';

export type SystemRejectContext = {
  eventId: number;
  reason: ApplicationSystemRejectReason;
  where: Prisma.ApplicationWhereInput;
};
