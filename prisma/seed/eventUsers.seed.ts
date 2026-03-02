import { faker } from '@faker-js/faker';
import { Event, PrismaClient, User } from '@prisma/client';

export async function seedEventsUsers(
  prisma: PrismaClient,
  events: Event[],
  users: User[],
) {
  for (const event of events) {
    const members = faker.helpers.arrayElements(
      users,
      faker.number.int({ min: 5, max: 20 }),
    );

    for (const user of members) {
      await prisma.eventUser.create({
        data: {
          eventId: event.id,
          userId: user.id,
          role: faker.helpers.weightedArrayElement([
            { value: 'USER', weight: 7 },
            { value: 'MODERATOR', weight: 2 },
            { value: 'ORGANIZER', weight: 1 },
          ]),
        },
      });
    }
  }
}
