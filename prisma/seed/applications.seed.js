"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedApplications = seedApplications;
const faker_1 = require("@faker-js/faker");
async function seedApplications(prisma, events, users) {
    for (const event of events) {
        const count = faker_1.faker.number.int({ min: 8, max: 25 });
        for (let i = 0; i < count; i++) {
            const type = faker_1.faker.helpers.arrayElement(['REQUEST', 'INVITE']);
            const status = faker_1.faker.helpers.weightedArrayElement([
                { value: 'PENDING', weight: 5 },
                { value: 'ACCEPTED', weight: 3 },
                { value: 'REJECTED', weight: 2 },
            ]);
            const sender = faker_1.faker.helpers.arrayElement(users);
            const receiver = type === 'INVITE' ? faker_1.faker.helpers.arrayElement(users) : null;
            await prisma.application.create({
                data: {
                    eventId: event.id,
                    senderId: sender.id,
                    receiverId: receiver?.id,
                    type,
                    applicationStatus: status,
                    decisionById: status !== 'PENDING' ? faker_1.faker.helpers.arrayElement(users).id : null,
                    rejectSource: status === 'REJECTED'
                        ? faker_1.faker.helpers.arrayElement(['STAFF', 'APPLICANT', 'SYSTEM'])
                        : null,
                },
            });
        }
    }
}
//# sourceMappingURL=applications.seed.js.map