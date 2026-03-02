"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = runSeed;
const client_1 = require("@prisma/client");
const tasks_seed_1 = require("./tasks.seed");
const chats_seed_1 = require("./chats.seed");
const applications_seed_1 = require("./applications.seed");
const eventUsers_seed_1 = require("./eventUsers.seed");
const users_seed_1 = require("./users.seed");
const events_seed_1 = require("./events.seed");
const prisma = new client_1.PrismaClient();
async function runSeed() {
    console.log('🌱 Seeding started...');
    const users = await (0, users_seed_1.seedUsers)(prisma);
    console.log(`👤 Users: ${users.length}`);
    const events = await (0, events_seed_1.seedEvents)(prisma, users);
    console.log(`🎉 Events: ${events.length}`);
    await (0, eventUsers_seed_1.seedEventsUsers)(prisma, events, users);
    console.log(`👥 Event users created`);
    await (0, applications_seed_1.seedApplications)(prisma, events, users);
    console.log(`📨 Applications created`);
    await (0, tasks_seed_1.seedTasks)(prisma, events, users);
    console.log(`🧩 Tasks & boards created`);
    await (0, chats_seed_1.seedChats)(prisma, events);
    console.log(`💬 Chats & messages created`);
    console.log('✅ Seeding finished');
}
//# sourceMappingURL=index.js.map