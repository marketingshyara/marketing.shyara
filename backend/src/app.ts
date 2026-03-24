import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import session from "@fastify/session";
import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { readConfig } from "./config";
import { PortalService } from "./services/portalService";
import { PrismaPortalRepository } from "./store/prismaPortalRepository";

declare module "fastify" {
  interface Session {
    userId?: string;
  }
}

declare module "@fastify/session" {
  interface SessionData {
    userId?: string;
  }
}

interface BuildAppOptions {
  portalService?: PortalService;
  sessionSecret?: string;
  allowedOrigins?: string[];
  secureCookies?: boolean;
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: false });
  const runtimeConfig = options.portalService
    ? {
        sessionSecret: options.sessionSecret ?? "test-session-secret-12345678901234567890",
        allowedOrigins: options.allowedOrigins ?? ["http://localhost"],
        secureCookies: options.secureCookies ?? false
      }
    : (() => {
        const config = readConfig();
        return {
          sessionSecret: config.sessionSecret,
          allowedOrigins: config.allowedOrigins,
          secureCookies: config.secureCookies
        };
      })();
  const portalService =
    options.portalService ??
    new PortalService(
      new PrismaPortalRepository(new PrismaClient(), {
        adminName: readConfig().bootstrapAdminName,
        adminEmail: readConfig().bootstrapAdminEmail,
        adminPassword: readConfig().bootstrapAdminPassword
      })
    );

  app.register(cors, {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || runtimeConfig.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed."), false);
    }
  });
  app.register(cookie);
  app.register(session, {
    secret: runtimeConfig.sessionSecret,
    cookieName: "shyara_portal_session",
    cookie: {
      secure: runtimeConfig.secureCookies,
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    }
  });

  const getRequestUser = async (request: any) => {
    if (!request.session.userId) throw new Error("Login required.");
    const user = await portalService.getUserById(request.session.userId);
    if (!user || user.status !== "active") throw new Error("Session is no longer valid.");
    return user;
  };

  const sendError = (reply: any, error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.toLowerCase().includes("conflict")) return reply.code(409).send({ message });
    if (message.toLowerCase().includes("authorized")) return reply.code(403).send({ message });
    if (message.toLowerCase().includes("not found")) return reply.code(404).send({ message });
    if (message.toLowerCase().includes("login")) return reply.code(401).send({ message });
    return reply.code(400).send({ message });
  };

  app.get("/api/health", async () => ({ ok: true }));

  app.post("/api/auth/login", async (request, reply) => {
    try {
      const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(request.body);
      const auth = await portalService.authenticate(body.email, body.password);
      if (!auth.ok || !auth.user) return reply.code(401).send({ message: auth.message });
      request.session.userId = auth.user.id;
      return { user: portalService.toPublicUser(auth.user), message: "Login successful." };
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/auth/logout", async (request) => {
    await request.session.destroy();
    return { ok: true };
  });

  app.get("/api/auth/session", async (request, reply) => {
    try {
      const user = await getRequestUser(request);
      return { authenticated: true, user: portalService.toPublicUser(user) };
    } catch {
      return reply.code(401).send({ authenticated: false });
    }
  });

  app.post("/api/auth/change-password", async (request, reply) => {
    try {
      const body = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8)
      }).parse(request.body);
      const user = await portalService.changePassword(await getRequestUser(request), body.currentPassword, body.newPassword);
      return { ok: true, user };
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/dashboard", async (request, reply) => {
    try {
      return portalService.getDashboardSummary(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/users", async (request, reply) => {
    try {
      return portalService.listUsers(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/users", async (request, reply) => {
    try {
      const body = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        role: z.enum(["admin", "sales_associate", "operations"]),
        status: z.enum(["active", "suspended", "deactivated"]).optional(),
        password: z.string().min(8)
      }).parse(request.body);
      return portalService.createUser(await getRequestUser(request), body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.patch("/api/users/:userId", async (request, reply) => {
    try {
      const params = z.object({ userId: z.string() }).parse(request.params);
      const body = z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "sales_associate", "operations"]).optional(),
        status: z.enum(["active", "suspended", "deactivated"]).optional()
      }).parse(request.body);
      return portalService.updateUser(await getRequestUser(request), params.userId, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/users/:userId/reset-password", async (request, reply) => {
    try {
      const params = z.object({ userId: z.string() }).parse(request.params);
      const body = z.object({ newPassword: z.string().min(8) }).parse(request.body);
      await portalService.resetUserPassword(await getRequestUser(request), params.userId, body.newPassword);
      return { ok: true };
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/leads", async (request, reply) => {
    try {
      const query = z.object({
        search: z.string().optional(),
        salesPersonId: z.string().optional(),
        status: z.enum(["new", "contacted", "under_follow_up", "interested", "not_interested", "callback_later", "payment_pending", "closed_won", "lost", "dormant"]).optional(),
        category: z.string().optional(),
        city: z.string().optional(),
        followUpDue: z.string().optional()
      }).parse(request.query);
      return portalService.listLeadsForUser(await getRequestUser(request), query);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads", async (request, reply) => {
    try {
      const body = z.object({
        businessName: z.string().min(1),
        contactPersonName: z.string().min(1),
        phoneNumber: z.string().min(1),
        whatsappNumber: z.string().min(1),
        email: z.string().email(),
        businessCategory: z.string().min(1),
        city: z.string().min(1),
        locality: z.string().min(1),
        source: z.string().min(1),
        packageInterest: z.string().min(1),
        firstContactDate: z.string().min(1),
        description: z.string().min(1),
        assignedSalesPersonId: z.string().optional(),
        sharedWithUserIds: z.array(z.string()).optional()
      }).parse(request.body);
      return portalService.createLead((await getRequestUser(request)).id, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/leads/:leadId", async (request, reply) => {
    try {
      const params = z.object({ leadId: z.string() }).parse(request.params);
      return portalService.getLeadForUser(await getRequestUser(request), params.leadId);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads/:leadId/status", async (request, reply) => {
    try {
      const params = z.object({ leadId: z.string() }).parse(request.params);
      const body = z.object({
        status: z.enum(["new", "contacted", "under_follow_up", "interested", "not_interested", "callback_later", "payment_pending", "closed_won", "lost", "dormant"])
      }).parse(request.body);
      return portalService.updateLeadStatus(await getRequestUser(request), params.leadId, body.status);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads/:leadId/notes", async (request, reply) => {
    try {
      const params = z.object({ leadId: z.string() }).parse(request.params);
      const body = z.object({
        discussionSummary: z.string().min(1),
        objections: z.string().optional(),
        nextSteps: z.string().optional(),
        promisedFollowUp: z.string().optional(),
        internalReminder: z.string().optional()
      }).parse(request.body);
      return portalService.addLeadNote(await getRequestUser(request), params.leadId, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads/:leadId/follow-ups", async (request, reply) => {
    try {
      const params = z.object({ leadId: z.string() }).parse(request.params);
      const body = z.object({
        dateTime: z.string().min(1),
        followUpType: z.enum(["call", "whatsapp", "email", "meeting", "callback", "payment_discussion", "other"]),
        note: z.string().min(1),
        nextFollowUpDate: z.string().optional(),
        outcome: z.enum(["no_response", "interested", "not_interested", "follow_up_needed", "call_later", "payment_pending"])
      }).parse(request.body);
      return portalService.addFollowUp(await getRequestUser(request), params.leadId, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads/:leadId/assign", async (request, reply) => {
    try {
      const params = z.object({ leadId: z.string() }).parse(request.params);
      const body = z.object({ toUserId: z.string(), sharedWithUserIds: z.array(z.string()).optional() }).parse(request.body);
      return portalService.assignLead(await getRequestUser(request), params.leadId, body.toUserId, body.sharedWithUserIds);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads/duplicates/:flagId/resolve", async (request, reply) => {
    try {
      const params = z.object({ flagId: z.string() }).parse(request.params);
      const body = z.object({ resolutionNote: z.string().min(1) }).parse(request.body);
      return portalService.resolveDuplicateFlag(await getRequestUser(request), params.flagId, body.resolutionNote);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/leads/:leadId/close", async (request, reply) => {
    try {
      const params = z.object({ leadId: z.string() }).parse(request.params);
      const body = z.object({
        packageName: z.string().min(1),
        closedValue: z.number().positive(),
        commissionAmount: z.number().positive().optional(),
        remarks: z.string().optional(),
        operationsOwnerUserId: z.string().optional()
      }).parse(request.body);
      return portalService.closeLead(await getRequestUser(request), params.leadId, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/commissions", async (request, reply) => {
    try {
      return portalService.listCommissions(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.patch("/api/commissions/:commissionId", async (request, reply) => {
    try {
      const params = z.object({ commissionId: z.string() }).parse(request.params);
      const body = z.object({
        status: z.enum(["pending", "under_review", "approved", "paid", "rejected", "on_hold"]),
        remarks: z.string().optional(),
        payoutDate: z.string().optional(),
        rejectionReason: z.string().optional(),
        holdReason: z.string().optional()
      }).parse(request.body);
      return portalService.updateCommissionStatus(await getRequestUser(request), params.commissionId, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/projects", async (request, reply) => {
    try {
      return portalService.listProjects(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.patch("/api/projects/:projectId/status", async (request, reply) => {
    try {
      const params = z.object({ projectId: z.string() }).parse(request.params);
      const body = z.object({
        status: z.enum(["project_started", "content_pending", "in_progress", "preview_shared", "revision_pending", "revision_in_progress", "final_delivery_done", "closed"]),
        currentRevisionStage: z.string().optional()
      }).parse(request.body);
      return portalService.updateProjectStatus(await getRequestUser(request), params.projectId, body.status, body.currentRevisionStage);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/revisions", async (request, reply) => {
    try {
      return portalService.listRevisions(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/projects/:projectId/revisions", async (request, reply) => {
    try {
      const params = z.object({ projectId: z.string() }).parse(request.params);
      const body = z.object({
        revisionNotes: z.string().min(1),
        requestedDate: z.string().min(1),
        status: z.enum(["pending", "in_progress", "completed", "on_hold"])
      }).parse(request.body);
      return portalService.addRevision(await getRequestUser(request), params.projectId, body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.patch("/api/revisions/:revisionId", async (request, reply) => {
    try {
      const params = z.object({ revisionId: z.string() }).parse(request.params);
      const body = z.object({
        status: z.enum(["pending", "in_progress", "completed", "on_hold"]),
        completedDate: z.string().optional()
      }).parse(request.body);
      return portalService.updateRevisionStatus(await getRequestUser(request), params.revisionId, body.status, body.completedDate);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/support-content", async (request, reply) => {
    try {
      await getRequestUser(request);
      return portalService.getSupportContent();
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.put("/api/support-content", async (request, reply) => {
    try {
      const body = z.object({
        servicePackages: z.array(z.object({
          id: z.string(),
          packageName: z.string(),
          shortPitch: z.string(),
          inclusions: z.array(z.string()),
          exclusions: z.array(z.string()),
          pricing: z.number().optional()
        })),
        salesInstructions: z.array(z.object({ id: z.string(), title: z.string(), content: z.string() })),
        objectionGuides: z.array(z.object({ id: z.string(), title: z.string(), response: z.string() })),
        closingGuides: z.array(z.object({ id: z.string(), title: z.string(), content: z.string() }))
      }).parse(request.body);
      return portalService.updateSupportContent(await getRequestUser(request), body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/settings", async (request, reply) => {
    try {
      return portalService.getSettings(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.put("/api/settings", async (request, reply) => {
    try {
      const body = z.object({
        leadStatuses: z.array(z.enum(["new", "contacted", "under_follow_up", "interested", "not_interested", "callback_later", "payment_pending", "closed_won", "lost", "dormant"])),
        commissionStatuses: z.array(z.enum(["pending", "under_review", "approved", "paid", "rejected", "on_hold"])),
        projectStatuses: z.array(z.enum(["project_started", "content_pending", "in_progress", "preview_shared", "revision_pending", "revision_in_progress", "final_delivery_done", "closed"])),
        revisionStatuses: z.array(z.enum(["pending", "in_progress", "completed", "on_hold"])),
        inactivityReminderDays: z.number(),
        notifications: z.object({ inAppEnabled: z.boolean(), emailEnabled: z.boolean() })
      }).parse(request.body);
      return portalService.updateSettings(await getRequestUser(request), body);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/notifications", async (request, reply) => {
    try {
      return portalService.listNotifications(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/api/notifications/:notificationId/read", async (request, reply) => {
    try {
      const params = z.object({ notificationId: z.string() }).parse(request.params);
      return portalService.markNotificationRead(await getRequestUser(request), params.notificationId);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/audit", async (request, reply) => {
    try {
      return portalService.listAuditEvents(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/reports/leads.csv", async (request, reply) => {
    try {
      reply.header("content-type", "text/csv");
      return portalService.exportLeadsCsv(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/reports/commissions.csv", async (request, reply) => {
    try {
      reply.header("content-type", "text/csv");
      return portalService.exportCommissionsCsv(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/reports/projects.csv", async (request, reply) => {
    try {
      reply.header("content-type", "text/csv");
      return portalService.exportProjectsCsv(await getRequestUser(request));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  return app;
}
