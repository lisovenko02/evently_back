import { Event, PrismaClient } from '@prisma/client';
export declare function seedChats(prisma: PrismaClient, events: Event[]): Promise<void>;
