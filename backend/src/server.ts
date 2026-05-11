import "dotenv/config";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { ensureBootstrapAdminFromEnv } from "./lib/ensureBootstrapAdmin.js";
import { runSchemaSanityChecks } from "./lib/schemaSanity.js";

const config = loadConfig();
const app = await buildApp({ config });

await runSchemaSanityChecks(app.prisma, app.log);

try {
  await ensureBootstrapAdminFromEnv(app.prisma, config.bcryptRounds, app.log);
} catch (error) {
  // Drift or transient DB issues should not crash startup; API error handler returns DATABASE_ERROR.
  app.log.error({ err: error }, "Bootstrap admin startup step failed; continuing");
}

try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
