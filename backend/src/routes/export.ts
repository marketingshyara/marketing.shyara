import type { FastifyInstance } from "fastify";
import ExcelJS from "exceljs";
import { ActivityAction } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings } from "../services/settings.js";

export async function registerExportRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/export/leads.xlsx",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const settings = await getPortalSettings(app.prisma);
      const totalLeads = await app.prisma.lead.count();
      const leads = await app.prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: settings.exportMaxRows
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Leads");
      sheet.columns = [
        { header: "id", key: "id", width: 28 },
        { header: "clientName", key: "clientName", width: 24 },
        { header: "clientEmail", key: "clientEmail", width: 28 },
        { header: "clientPhone", key: "clientPhone", width: 16 },
        { header: "status", key: "status", width: 18 },
        { header: "createdByUserId", key: "createdByUserId", width: 28 },
        { header: "assignedToUserId", key: "assignedToUserId", width: 28 },
        { header: "advanceAmountCents", key: "advanceAmountCents", width: 18 },
        { header: "finalQuoteCents", key: "finalQuoteCents", width: 18 },
        { header: "createdAt", key: "createdAt", width: 24 }
      ];
      for (const lead of leads) {
        sheet.addRow({
          ...lead,
          createdAt: lead.createdAt.toISOString()
        });
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.EXPORT,
        entityType: "Export",
        entityId: "leads",
        after: {
          format: "xlsx",
          rowCount: leads.length,
          exportMaxRows: settings.exportMaxRows,
          capped: totalLeads > settings.exportMaxRows
        },
        request
      });

      return reply
        .header("Content-Disposition", 'attachment; filename="leads.xlsx"')
        .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .send(buffer);
    }
  );

  app.get(
    "/api/export/commissions.xlsx",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const settings = await getPortalSettings(app.prisma);
      const totalCommissions = await app.prisma.commission.count();
      const rows = await app.prisma.commission.findMany({
        orderBy: { createdAt: "desc" },
        take: settings.exportMaxRows,
        include: {
          lead: { select: { clientName: true, status: true } }
        }
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Commissions");
      sheet.columns = [
        { header: "id", key: "id", width: 28 },
        { header: "leadId", key: "leadId", width: 28 },
        { header: "clientName", key: "clientName", width: 24 },
        { header: "leadStatus", key: "leadStatus", width: 18 },
        { header: "repUserId", key: "repUserId", width: 28 },
        { header: "amountCents", key: "amountCents", width: 14 },
        { header: "isPaid", key: "isPaid", width: 10 },
        { header: "paidAt", key: "paidAt", width: 24 },
        { header: "createdAt", key: "createdAt", width: 24 }
      ];
      for (const commission of rows) {
        sheet.addRow({
          id: commission.id,
          leadId: commission.leadId,
          clientName: commission.lead.clientName,
          leadStatus: commission.lead.status,
          repUserId: commission.repUserId,
          amountCents: commission.amountCents,
          isPaid: commission.isPaid,
          paidAt: commission.paidAt?.toISOString() ?? "",
          createdAt: commission.createdAt.toISOString()
        });
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.EXPORT,
        entityType: "Export",
        entityId: "commissions",
        after: {
          format: "xlsx",
          rowCount: rows.length,
          exportMaxRows: settings.exportMaxRows,
          capped: totalCommissions > settings.exportMaxRows
        },
        request
      });

      return reply
        .header("Content-Disposition", 'attachment; filename="commissions.xlsx"')
        .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .send(buffer);
    }
  );

  app.get(
    "/api/export/users.xlsx",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const settings = await getPortalSettings(app.prisma);
      const totalUsers = await app.prisma.user.count();
      const users = await app.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: settings.exportMaxRows,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true
        }
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Users");
      sheet.columns = [
        { header: "id", key: "id", width: 28 },
        { header: "email", key: "email", width: 28 },
        { header: "displayName", key: "displayName", width: 20 },
        { header: "role", key: "role", width: 12 },
        { header: "isActive", key: "isActive", width: 10 },
        { header: "mustChangePassword", key: "mustChangePassword", width: 18 },
        { header: "createdAt", key: "createdAt", width: 24 }
      ];
      for (const user of users) {
        sheet.addRow({
          ...user,
          createdAt: user.createdAt.toISOString()
        });
      }

      const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.EXPORT,
        entityType: "Export",
        entityId: "users",
        after: {
          format: "xlsx",
          rowCount: users.length,
          exportMaxRows: settings.exportMaxRows,
          capped: totalUsers > settings.exportMaxRows
        },
        request
      });

      return reply
        .header("Content-Disposition", 'attachment; filename="users.xlsx"')
        .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .send(buffer);
    }
  );
}
