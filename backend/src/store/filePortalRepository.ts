import fs from "node:fs";
import path from "node:path";
import { createDefaultState } from "../domain/defaults";
import type { PortalState } from "../domain/types";
import type { PortalRepository } from "./types";

interface FilePortalRepositoryOptions {
  filePath: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export class FilePortalRepository implements PortalRepository {
  constructor(private options: FilePortalRepositoryOptions) {}

  async load(): Promise<PortalState> {
    if (!fs.existsSync(this.options.filePath)) {
      fs.mkdirSync(path.dirname(this.options.filePath), { recursive: true });
      const seeded = createDefaultState(this.options);
      fs.writeFileSync(this.options.filePath, JSON.stringify(seeded, null, 2));
      return seeded;
    }

    return JSON.parse(fs.readFileSync(this.options.filePath, "utf8")) as PortalState;
  }

  async save(state: PortalState): Promise<void> {
    fs.mkdirSync(path.dirname(this.options.filePath), { recursive: true });
    const currentState = (await this.load().catch(() => undefined)) ?? state;
    if (state.meta.version !== currentState.meta.version) {
      throw new Error("Portal state conflict detected. Please refresh and try again.");
    }

    fs.writeFileSync(
      this.options.filePath,
      JSON.stringify(
        {
          ...state,
          meta: {
            ...state.meta,
            version: state.meta.version + 1
          }
        },
        null,
        2
      )
    );
  }
}
