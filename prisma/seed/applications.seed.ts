import { faker } from '@faker-js/faker';
import { Event, PrismaClient, User } from '@prisma/client';

export async function seedApplications(
  prisma: PrismaClient,
  events: Event[],
  users: User[],
) {
  for (const event of events) {
    const count = faker.number.int({ min: 8, max: 25 });

    for (let i = 0; i < count; i++) {
      const type = faker.helpers.arrayElement(['REQUEST', 'INVITE']);
      const status = faker.helpers.weightedArrayElement([
        { value: 'PENDING', weight: 5 },
        { value: 'ACCEPTED', weight: 3 },
        { value: 'REJECTED', weight: 2 },
      ]);

      const sender = faker.helpers.arrayElement(users);
      const receiver =
        type === 'INVITE' ? faker.helpers.arrayElement(users) : null;

      await prisma.application.create({
        data: {
          eventId: event.id,
          senderId: sender.id,
          receiverId: receiver?.id,
          type,
          applicationStatus: status,
          decisionById:
            status !== 'PENDING' ? faker.helpers.arrayElement(users).id : null,
          rejectSource:
            status === 'REJECTED'
              ? faker.helpers.arrayElement(['STAFF', 'APPLICANT', 'SYSTEM'])
              : null,
        },
      });
    }
  }
}
