"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const faker_1 = require("@faker-js/faker");
async function seedUsers(prisma) {
    return Promise.all(Array.from({ length: 40 }).map(() => prisma.user.create({
        data: {
            email: faker_1.faker.internet.email(),
            username: faker_1.faker.internet.username(),
            firstName: faker_1.faker.person.firstName(),
            lastName: faker_1.faker.person.lastName(),
            avatar: faker_1.faker.image.avatar(),
            password: 'hashed-password',
        },
    })));
}
//# sourceMappingURL=users.seed.js.map