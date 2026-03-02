"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedEventsUsers = seedEventsUsers;
const faker_1 = require("@faker-js/faker");
async function seedEventsUsers(prisma, events, users) {
    for (const event of events) {
        const members = faker_1.faker.helpers.arrayElements(users, faker_1.faker.number.int({ min: 5, max: 20 }));
        for (const user of members) {
            await prisma.eventUser.create({
                data: {
                    eventId: event.id,
                    userId: user.id,
                    role: faker_1.faker.helpers.weightedArrayElement([
                        { value: 'USER', weight: 7 },
                        { value: 'MODERATOR', weight: 2 },
                        { value: 'ORGANIZER', weight: 1 },
                    ]),
                },
            });
        }
    }
}
//# sourceMappingURL=eventUsers.seed.js.map