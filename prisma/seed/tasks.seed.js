"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTasks = seedTasks;
const faker_1 = require("@faker-js/faker");
async function seedTasks(prisma, events, users) {
    for (const event of events) {
        const board = await prisma.taskBoard.create({
            data: { eventId: event.id },
        });
        const columns = await Promise.all(['Todo', 'In Progress', 'Done'].map((title, order) => prisma.taskColumn.create({
            data: { title, order, boardId: board.id },
        })));
        for (const column of columns) {
            const tasksCount = faker_1.faker.number.int({ min: 5, max: 15 });
            for (let i = 0; i < tasksCount; i++) {
                const creator = faker_1.faker.helpers.arrayElement(users);
                await prisma.task.create({
                    data: {
                        title: faker_1.faker.hacker.phrase(),
                        columnId: column.id,
                        creatorId: creator.id,
                    },
                });
            }
        }
    }
}
//# sourceMappingURL=tasks.seed.js.map