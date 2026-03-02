import { faker } from '@faker-js/faker';
import { Event, PrismaClient, User } from '@prisma/client';

export async function seedTasks(
  prisma: PrismaClient,
  events: Event[],
  users: User[],
) {
  for (const event of events) {
    const board = await prisma.taskBoard.create({
      data: { eventId: event.id },
    });

    const columns = await Promise.all(
      ['Todo', 'In Progress', 'Done'].map((title, order) =>
        prisma.taskColumn.create({
          data: { title, order, boardId: board.id },
        }),
      ),
    );

    for (const column of columns) {
      const tasksCount = faker.number.int({ min: 5, max: 15 });

      for (let i = 0; i < tasksCount; i++) {
        const creator = faker.helpers.arrayElement(users);

        await prisma.task.create({
          data: {
            title: faker.hacker.phrase(),
            columnId: column.id,
            creatorId: creator.id,
          },
        });
      }
    }
  }
}
