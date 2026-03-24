import { buildApp } from "./app";
import { readConfig } from "./config";

const config = readConfig();

const app = buildApp();

app.listen({ port: config.port, host: config.host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
