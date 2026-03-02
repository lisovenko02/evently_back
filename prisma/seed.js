"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./seed/index");
async function main() {
    try {
        await (0, index_1.runSeed)();
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=seed.js.map