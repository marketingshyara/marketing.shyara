import { createDefaultState } from "../domain/defaults";
import { PortalService } from "../services/portalService";
import { MemoryPortalRepository } from "../store/memoryPortalRepository";

export function buildSeededPortalService() {
  return new PortalService(
    new MemoryPortalRepository(
      createDefaultState({
        adminName: "Portal Admin",
        adminEmail: "admin@shyara.local",
        adminPassword: "password123"
      })
    )
  );
}
