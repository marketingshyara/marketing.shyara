import type { PortalState } from "../domain/types";
import type { PortalRepository } from "./types";

export class MemoryPortalRepository implements PortalRepository {
  constructor(private state: PortalState) {}

  async load(): Promise<PortalState> {
    return structuredClone(this.state);
  }

  async save(state: PortalState): Promise<void> {
    if (state.meta.version !== this.state.meta.version) {
      throw new Error("Portal state conflict detected. Please refresh and try again.");
    }

    this.state = structuredClone({
      ...state,
      meta: {
        ...state.meta,
        version: state.meta.version + 1
      }
    });
  }
}
