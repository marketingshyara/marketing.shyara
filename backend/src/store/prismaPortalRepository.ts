import type { PrismaClient } from "@prisma/client";
import { createProductionBootstrapState } from "../domain/defaults";
import type { PortalState } from "../domain/types";
import type { PortalRepository } from "./types";

interface PrismaPortalRepositoryOptions {
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

const PORTAL_META_ID = "portal";
const PORTAL_SETTINGS_ID = "portal-settings";

const toDate = (value: string | undefined) => (value ? new Date(value) : undefined);
const toIso = (value: Date | null | undefined) => value?.toISOString();

export class PrismaPortalRepository implements PortalRepository {
  constructor(
    private prisma: PrismaClient,
    private options: PrismaPortalRepositoryOptions
  ) {}

  async load(): Promise<PortalState> {
    await this.ensureBootstrapped();

    const [
      meta,
      users,
      leads,
      leadNotes,
      followUps,
      leadActivities,
      duplicateFlags,
      ownershipHistory,
      servicePackages,
      salesInstructions,
      objectionGuides,
      closingGuides,
      closures,
      commissionRules,
      commissions,
      commissionLogs,
      projects,
      revisions,
      notifications,
      auditEvents,
      settings
    ] = await this.prisma.$transaction([
      this.prisma.portalMeta.findUnique({ where: { id: PORTAL_META_ID } }),
      this.prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      this.prisma.lead.findMany({ orderBy: { createdAt: "asc" } }),
      this.prisma.leadNote.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.followUp.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.leadActivityLog.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.leadDuplicateFlag.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.leadOwnershipHistory.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.servicePackage.findMany({ orderBy: { packageName: "asc" } }),
      this.prisma.salesInstruction.findMany({ orderBy: { title: "asc" } }),
      this.prisma.objectionGuide.findMany({ orderBy: { title: "asc" } }),
      this.prisma.closingGuide.findMany({ orderBy: { title: "asc" } }),
      this.prisma.leadClosure.findMany({ orderBy: { closureDate: "desc" } }),
      this.prisma.commissionRule.findMany({ orderBy: { name: "asc" } }),
      this.prisma.commissionRecord.findMany({ orderBy: { closureDate: "desc" } }),
      this.prisma.commissionLog.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.project.findMany({ orderBy: { startedAt: "desc" } }),
      this.prisma.revision.findMany({ orderBy: [{ projectId: "asc" }, { roundNumber: "asc" }] }),
      this.prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.auditEvent.findMany({ orderBy: { createdAt: "desc" } }),
      this.prisma.portalSettings.findUnique({ where: { id: PORTAL_SETTINGS_ID } })
    ]);

    if (!meta || !settings) {
      throw new Error("Portal bootstrap is incomplete.");
    }

    return {
      meta: {
        nextId: meta.nextId,
        version: meta.version
      },
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        role: user.role,
        status: user.status,
        passwordHash: user.passwordHash,
        mustChangePassword: user.mustChangePassword,
        passwordResetAt: toIso(user.passwordResetAt),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })),
      leads: leads.map((lead) => ({
        ...lead,
        closureId: lead.closureId ?? undefined,
        projectId: lead.projectId ?? undefined,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString()
      })),
      leadNotes: leadNotes.map((note) => ({
        ...note,
        objections: note.objections ?? undefined,
        nextSteps: note.nextSteps ?? undefined,
        promisedFollowUp: note.promisedFollowUp ?? undefined,
        internalReminder: note.internalReminder ?? undefined,
        createdAt: note.createdAt.toISOString()
      })),
      followUps: followUps.map((followUp) => ({
        ...followUp,
        nextFollowUpDate: followUp.nextFollowUpDate ?? undefined,
        createdAt: followUp.createdAt.toISOString(),
        dateTime: followUp.dateTime.toISOString()
      })),
      leadActivities: leadActivities.map((activity) => ({
        ...activity,
        oldValue: activity.oldValue ?? undefined,
        newValue: activity.newValue ?? undefined,
        details: activity.details ?? undefined,
        createdAt: activity.createdAt.toISOString()
      })),
      duplicateFlags: duplicateFlags.map((flag) => ({
        ...flag,
        status: flag.status as "open" | "resolved",
        resolvedAt: toIso(flag.resolvedAt),
        resolvedByUserId: flag.resolvedByUserId ?? undefined,
        resolutionNote: flag.resolutionNote ?? undefined,
        createdAt: flag.createdAt.toISOString()
      })),
      ownershipHistory: ownershipHistory.map((entry) => ({
        ...entry,
        fromUserId: entry.fromUserId ?? undefined,
        createdAt: entry.createdAt.toISOString()
      })),
      servicePackages: servicePackages.map((entry) => ({
        ...entry,
        pricing: entry.pricing ?? undefined
      })),
      salesInstructions,
      objectionGuides,
      closingGuides,
      closures: closures.map((closure) => ({
        ...closure,
        remarks: closure.remarks ?? undefined,
        closureDate: closure.closureDate.toISOString()
      })),
      commissionRules: commissionRules.map((rule) => ({
        ...rule,
        packageName: rule.packageName ?? undefined,
        role: rule.role ?? undefined,
        amount: rule.amount ?? undefined,
        percentage: rule.percentage ?? undefined
      })),
      commissions: commissions.map((commission) => ({
        ...commission,
        payoutDate: commission.payoutDate ?? undefined,
        remarks: commission.remarks ?? undefined,
        rejectionReason: commission.rejectionReason ?? undefined,
        holdReason: commission.holdReason ?? undefined,
        closureDate: commission.closureDate.toISOString()
      })),
      commissionLogs: commissionLogs.map((entry) => ({
        ...entry,
        oldValue: entry.oldValue ?? undefined,
        newValue: entry.newValue ?? undefined,
        details: entry.details ?? undefined,
        createdAt: entry.createdAt.toISOString()
      })),
      projects: projects.map((project) => ({
        ...project,
        operationsOwnerUserId: project.operationsOwnerUserId ?? undefined,
        completedAt: toIso(project.completedAt),
        currentRevisionStage: project.currentRevisionStage ?? undefined,
        startedAt: project.startedAt.toISOString()
      })),
      revisions: revisions.map((revision) => ({
        ...revision,
        completedDate: revision.completedDate ?? undefined
      })),
      notifications: notifications.map((notification) => ({
        ...notification,
        readAt: toIso(notification.readAt),
        createdAt: notification.createdAt.toISOString()
      })),
      auditEvents: auditEvents.map((entry) => ({
        ...entry,
        oldValue: entry.oldValue ?? undefined,
        newValue: entry.newValue ?? undefined,
        details: entry.details ?? undefined,
        createdAt: entry.createdAt.toISOString()
      })),
      settings: {
        leadStatuses: settings.leadStatuses,
        commissionStatuses: settings.commissionStatuses,
        projectStatuses: settings.projectStatuses,
        revisionStatuses: settings.revisionStatuses,
        inactivityReminderDays: settings.inactivityReminderDays,
        notifications: {
          inAppEnabled: settings.inAppNotificationsEnabled,
          emailEnabled: settings.emailNotificationsEnabled
        }
      }
    };
  }

  async save(state: PortalState): Promise<void> {
    await this.ensureBootstrapped();

    await this.prisma.$transaction(async (tx) => {
      const meta = await tx.portalMeta.findUnique({ where: { id: PORTAL_META_ID } });
      if (!meta) {
        throw new Error("Portal bootstrap is incomplete.");
      }
      if (meta.version !== state.meta.version) {
        throw new Error("Portal state conflict detected. Please refresh and try again.");
      }

      await tx.auditEvent.deleteMany();
      await tx.notification.deleteMany();
      await tx.revision.deleteMany();
      await tx.project.deleteMany();
      await tx.commissionLog.deleteMany();
      await tx.commissionRecord.deleteMany();
      await tx.commissionRule.deleteMany();
      await tx.leadClosure.deleteMany();
      await tx.closingGuide.deleteMany();
      await tx.objectionGuide.deleteMany();
      await tx.salesInstruction.deleteMany();
      await tx.servicePackage.deleteMany();
      await tx.leadOwnershipHistory.deleteMany();
      await tx.leadDuplicateFlag.deleteMany();
      await tx.leadActivityLog.deleteMany();
      await tx.followUp.deleteMany();
      await tx.leadNote.deleteMany();
      await tx.lead.deleteMany();
      await tx.user.deleteMany();

      for (const user of state.users) {
        await tx.user.create({
          data: {
            ...user,
            passwordResetAt: toDate(user.passwordResetAt),
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
      }

      for (const lead of state.leads) {
        await tx.lead.create({
          data: {
            ...lead,
            closureId: lead.closureId ?? null,
            projectId: lead.projectId ?? null,
            createdAt: new Date(lead.createdAt),
            updatedAt: new Date(lead.updatedAt)
          }
        });
      }

      for (const note of state.leadNotes) {
        await tx.leadNote.create({
          data: {
            ...note,
            createdAt: new Date(note.createdAt)
          }
        });
      }

      for (const followUp of state.followUps) {
        await tx.followUp.create({
          data: {
            ...followUp,
            nextFollowUpDate: followUp.nextFollowUpDate ?? null,
            dateTime: new Date(followUp.dateTime),
            createdAt: new Date(followUp.createdAt)
          }
        });
      }

      for (const activity of state.leadActivities) {
        await tx.leadActivityLog.create({
          data: {
            ...activity,
            oldValue: activity.oldValue ?? null,
            newValue: activity.newValue ?? null,
            details: activity.details ?? null,
            createdAt: new Date(activity.createdAt)
          }
        });
      }

      for (const flag of state.duplicateFlags) {
        await tx.leadDuplicateFlag.create({
          data: {
            ...flag,
            resolvedAt: toDate(flag.resolvedAt),
            resolvedByUserId: flag.resolvedByUserId ?? null,
            resolutionNote: flag.resolutionNote ?? null,
            createdAt: new Date(flag.createdAt)
          }
        });
      }

      for (const history of state.ownershipHistory) {
        await tx.leadOwnershipHistory.create({
          data: {
            ...history,
            fromUserId: history.fromUserId ?? null,
            createdAt: new Date(history.createdAt)
          }
        });
      }

      for (const servicePackage of state.servicePackages) {
        await tx.servicePackage.create({ data: servicePackage });
      }
      for (const instruction of state.salesInstructions) {
        await tx.salesInstruction.create({ data: instruction });
      }
      for (const guide of state.objectionGuides) {
        await tx.objectionGuide.create({ data: guide });
      }
      for (const guide of state.closingGuides) {
        await tx.closingGuide.create({ data: guide });
      }

      for (const closure of state.closures) {
        await tx.leadClosure.create({
          data: {
            ...closure,
            remarks: closure.remarks ?? null,
            closureDate: new Date(closure.closureDate)
          }
        });
      }

      for (const rule of state.commissionRules) {
        await tx.commissionRule.create({
          data: {
            ...rule,
            packageName: rule.packageName ?? null,
            role: rule.role ?? null,
            amount: rule.amount ?? null,
            percentage: rule.percentage ?? null
          }
        });
      }

      for (const commission of state.commissions) {
        await tx.commissionRecord.create({
          data: {
            ...commission,
            payoutDate: commission.payoutDate ?? null,
            remarks: commission.remarks ?? null,
            rejectionReason: commission.rejectionReason ?? null,
            holdReason: commission.holdReason ?? null,
            closureDate: new Date(commission.closureDate)
          }
        });
      }

      for (const log of state.commissionLogs) {
        await tx.commissionLog.create({
          data: {
            ...log,
            oldValue: log.oldValue ?? null,
            newValue: log.newValue ?? null,
            details: log.details ?? null,
            createdAt: new Date(log.createdAt)
          }
        });
      }

      for (const project of state.projects) {
        await tx.project.create({
          data: {
            ...project,
            operationsOwnerUserId: project.operationsOwnerUserId ?? null,
            completedAt: toDate(project.completedAt),
            currentRevisionStage: project.currentRevisionStage ?? null,
            startedAt: new Date(project.startedAt)
          }
        });
      }

      for (const revision of state.revisions) {
        await tx.revision.create({
          data: {
            ...revision,
            completedDate: revision.completedDate ?? null
          }
        });
      }

      for (const notification of state.notifications) {
        await tx.notification.create({
          data: {
            ...notification,
            readAt: toDate(notification.readAt),
            createdAt: new Date(notification.createdAt)
          }
        });
      }

      for (const event of state.auditEvents) {
        await tx.auditEvent.create({
          data: {
            ...event,
            oldValue: event.oldValue ?? null,
            newValue: event.newValue ?? null,
            details: event.details ?? null,
            createdAt: new Date(event.createdAt)
          }
        });
      }

      await tx.portalSettings.upsert({
        where: { id: PORTAL_SETTINGS_ID },
        update: {
          leadStatuses: state.settings.leadStatuses,
          commissionStatuses: state.settings.commissionStatuses,
          projectStatuses: state.settings.projectStatuses,
          revisionStatuses: state.settings.revisionStatuses,
          inactivityReminderDays: state.settings.inactivityReminderDays,
          inAppNotificationsEnabled: state.settings.notifications.inAppEnabled,
          emailNotificationsEnabled: state.settings.notifications.emailEnabled
        },
        create: {
          id: PORTAL_SETTINGS_ID,
          leadStatuses: state.settings.leadStatuses,
          commissionStatuses: state.settings.commissionStatuses,
          projectStatuses: state.settings.projectStatuses,
          revisionStatuses: state.settings.revisionStatuses,
          inactivityReminderDays: state.settings.inactivityReminderDays,
          inAppNotificationsEnabled: state.settings.notifications.inAppEnabled,
          emailNotificationsEnabled: state.settings.notifications.emailEnabled
        }
      });

      await tx.portalMeta.update({
        where: { id: PORTAL_META_ID },
        data: {
          nextId: state.meta.nextId,
          version: state.meta.version + 1
        }
      });
    });
  }

  private async ensureBootstrapped() {
    const meta = await this.prisma.portalMeta.findUnique({ where: { id: PORTAL_META_ID } });
    if (meta) return;

    const initialState = createProductionBootstrapState({
      adminName: this.options.adminName,
      adminEmail: this.options.adminEmail,
      adminPassword: this.options.adminPassword
    });

    await this.prisma.$transaction(async (tx) => {
      const existingMeta = await tx.portalMeta.findUnique({ where: { id: PORTAL_META_ID } });
      if (existingMeta) return;

      await tx.portalMeta.create({
        data: {
          id: PORTAL_META_ID,
          nextId: initialState.meta.nextId,
          version: initialState.meta.version
        }
      });

      await tx.portalSettings.create({
        data: {
          id: PORTAL_SETTINGS_ID,
          leadStatuses: initialState.settings.leadStatuses,
          commissionStatuses: initialState.settings.commissionStatuses,
          projectStatuses: initialState.settings.projectStatuses,
          revisionStatuses: initialState.settings.revisionStatuses,
          inactivityReminderDays: initialState.settings.inactivityReminderDays,
          inAppNotificationsEnabled: initialState.settings.notifications.inAppEnabled,
          emailNotificationsEnabled: initialState.settings.notifications.emailEnabled
        }
      });

      for (const user of initialState.users) {
        await tx.user.create({
          data: {
            ...user,
            passwordResetAt: toDate(user.passwordResetAt),
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
      }

      for (const servicePackage of initialState.servicePackages) {
        await tx.servicePackage.create({ data: servicePackage });
      }
      for (const instruction of initialState.salesInstructions) {
        await tx.salesInstruction.create({ data: instruction });
      }
      for (const guide of initialState.objectionGuides) {
        await tx.objectionGuide.create({ data: guide });
      }
      for (const guide of initialState.closingGuides) {
        await tx.closingGuide.create({ data: guide });
      }
      for (const rule of initialState.commissionRules) {
        await tx.commissionRule.create({
          data: {
            ...rule,
            packageName: rule.packageName ?? null,
            role: rule.role ?? null,
            amount: rule.amount ?? null,
            percentage: rule.percentage ?? null
          }
        });
      }
    });
  }
}
