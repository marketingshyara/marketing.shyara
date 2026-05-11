import "dotenv/config";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { ensureBootstrapAdminFromEnv } from "./lib/ensureBootstrapAdmin.js";

const config = loadConfig();
const app = await buildApp({ config });

await ensureBootstrapAdminFromEnv(app.prisma, config.bcryptRounds, app.log);

try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
