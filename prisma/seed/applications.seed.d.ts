import { Event, PrismaClient, User } from '@prisma/client';
export declare function seedApplications(prisma: PrismaClient, events: Event[], users: User[]): Promise<void>;
