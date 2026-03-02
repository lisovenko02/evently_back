import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  return Promise.all(
    Array.from({ length: 40 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          username: faker.internet.username(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          avatar: faker.image.avatar(),
          password: 'hashed-password',
        },
      }),
    ),
  );
}
