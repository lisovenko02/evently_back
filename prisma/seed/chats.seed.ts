import { faker } from '@faker-js/faker';
import { Event, PrismaClient } from '@prisma/client';

export async function seedChats(prisma: PrismaClient, events: Event[]) {
  for (const event of events) {
    const eventUsers = await prisma.eventUser.findMany({
      where: { eventId: event.id },
    });

    if (eventUsers.length === 0) continue;

    const creator = faker.helpers.arrayElement(eventUsers);

    const chat = await prisma.chat.create({
      data: {
        type: 'GENERAL',
        eventId: event.id,
        creatorId: creator.id,
      },
    });

    const messagesCount = faker.number.int({ min: 20, max: 80 });

    for (let i = 0; i < messagesCount; i++) {
      const sender = faker.helpers.arrayElement(eventUsers);

      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: sender.id,
          content: faker.lorem.sentence(),
        },
      });
    }
  }
}
