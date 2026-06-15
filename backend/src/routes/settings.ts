import type { FastifyInstance } from "fastify";
import { ActivityAction, UserRole } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { logActivity } from "../services/activityLog.js";
import {
  getPortalSettings,
  toPublicSettings,
  toRepPortalSettingsForModel,
  updatePortalSettingsValues
} from "../services/settings.js";
import { getRepCommissionModel } from "../services/commissionModel.js";
export async function registerSettingsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/settings",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const settings = await getPortalSettings(app.prisma);
      if (user.role === UserRole.SALES_REP) {
        const model = await getRepCommissionModel(app.prisma, user.id);
        return reply.send({ settings: toRepPortalSettingsForModel(model, settings) });
      }
      return reply.send({ settings: toRepPortalSettingsForModel("MODEL_A", settings) });
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
