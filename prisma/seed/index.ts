import { PrismaClient } from '@prisma/client';
import { seedTasks } from './tasks.seed';
import { seedChats } from './chats.seed';
import { seedApplications } from './applications.seed';
import { seedEventsUsers } from './eventUsers.seed';
import { seedUsers } from './users.seed';
import { seedEvents } from './events.seed';

const prisma = new PrismaClient();

export async function runSeed() {
  console.log('🌱 Seeding started...');

  // 1. Users
  const users = await seedUsers(prisma);
  console.log(`👤 Users: ${users.length}`);

  // 2. Events
  const events = await seedEvents(prisma, users);
  console.log(`🎉 Events: ${events.length}`);

  // 3. Event members
  await seedEventsUsers(prisma, events, users);
  console.log(`👥 Event users created`);

  // 4. Applications
  await seedApplications(prisma, events, users);
  console.log(`📨 Applications created`);

  // 5. Tasks & boards
  await seedTasks(prisma, events, users);
  console.log(`🧩 Tasks & boards created`);

  // 6. Chats & messages
  await seedChats(prisma, events);
  console.log(`💬 Chats & messages created`);

  console.log('✅ Seeding finished');
}
