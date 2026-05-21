import type { FastifyInstance } from "fastify";
import { ActivityAction } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { logActivity } from "../services/activityLog.js";
import {
  getPortalSettings,
  toPublicSettings,
  toRepPortalSettings,
  updatePortalSettingsValues
} from "../services/settings.js";
export async function registerSettingsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/settings",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const settings = await getPortalSettings(app.prisma);
      return reply.send({ settings: toRepPortalSettings(settings) });
    }
  );

  app.get(
    "/api/admin/settings",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const settings = await getPortalSettings(app.prisma);
      return reply.send({ settings: toPublicSettings(settings) });
    }
  );

  app.patch(
    "/api/admin/settings",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { settings, before } = await updatePortalSettingsValues(app.prisma, request.body);

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.SETTINGS_UPDATE,
        entityType: "PortalSettings",
        entityId: "default",
        before,
        after: settings,
        request
      });

      return reply.send({ settings: toPublicSettings(settings) });
    }
  );
}
