"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedEvents = seedEvents;
const faker_1 = require("@faker-js/faker");
async function seedEvents(prisma, users) {
    return Promise.all(Array.from({ length: 12 }).map(() => {
        const organizer = faker_1.faker.helpers.arrayElement(users);
        return prisma.event.create({
            data: {
                title: faker_1.faker.lorem.words(3),
                description: faker_1.faker.lorem.paragraph(),
                image: `https://picsum.photos/seed/${faker_1.faker.string.uuid()}/600/400`,
                category: faker_1.faker.helpers.arrayElement([
                    'TECH',
                    'SPORTS',
                    'MUSIC',
                    'EDUCATION',
                    'GAMING',
                ]),
                organizerId: organizer.id,
            },
        });
    }));
}
//# sourceMappingURL=events.seed.js.map