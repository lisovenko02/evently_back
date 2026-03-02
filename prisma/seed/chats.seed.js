"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedChats = seedChats;
const faker_1 = require("@faker-js/faker");
async function seedChats(prisma, events) {
    for (const event of events) {
        const eventUsers = await prisma.eventUser.findMany({
            where: { eventId: event.id },
        });
        if (eventUsers.length === 0)
            continue;
        const creator = faker_1.faker.helpers.arrayElement(eventUsers);
        const chat = await prisma.chat.create({
            data: {
                type: 'GENERAL',
                eventId: event.id,
                creatorId: creator.id,
            },
        });
        const messagesCount = faker_1.faker.number.int({ min: 20, max: 80 });
        for (let i = 0; i < messagesCount; i++) {
            const sender = faker_1.faker.helpers.arrayElement(eventUsers);
            await prisma.message.create({
                data: {
                    chatId: chat.id,
                    senderId: sender.id,
                    content: faker_1.faker.lorem.sentence(),
                },
            });
        }
    }
}
//# sourceMappingURL=chats.seed.js.map