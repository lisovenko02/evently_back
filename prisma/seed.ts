import { runSeed } from './seed/index';

async function main() {
  try {
    await runSeed();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
