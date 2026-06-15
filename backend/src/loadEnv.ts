import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Backend package root (parent of `src/` or `dist/`). */
const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

let loaded = false;

/** Load tracked `render.env` (production defaults) then optional local `.env` overrides. */
export function loadBackendEnv(): void {
  if (loaded) return;
  dotenv.config({ path: join(backendRoot, "render.env") });
  dotenv.config({ path: join(backendRoot, ".env") });
  loaded = true;
}
