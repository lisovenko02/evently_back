import { PrismaClient } from '@prisma/client';
export declare function seedUsers(prisma: PrismaClient): Promise<{
    id: number;
    points: number | null;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    password: string;
    hashedRefreshToken: string | null;
}[]>;
