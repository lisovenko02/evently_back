import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';

export async function seedEvents(prisma: PrismaClient, users: User[]) {
  return Promise.all(
    Array.from({ length: 12 }).map(() => {
      const organizer = faker.helpers.arrayElement(users);

      return prisma.event.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          image: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
          category: faker.helpers.arrayElement([
            'TECH',
            'SPORTS',
            'MUSIC',
            'EDUCATION',
            'GAMING',
          ]),
          organizerId: organizer.id,
        },
      });
    }),
  );
}
