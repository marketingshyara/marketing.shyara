import type { PortalState } from "../domain/types";

export interface PortalRepository {
  load(): Promise<PortalState>;
  save(state: PortalState): Promise<void>;
}
