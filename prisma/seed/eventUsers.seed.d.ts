import { Event, PrismaClient, User } from '@prisma/client';
export declare function seedEventsUsers(prisma: PrismaClient, events: Event[], users: User[]): Promise<void>;
