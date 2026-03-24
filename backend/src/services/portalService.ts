import bcrypt from "bcryptjs";
import type {
  AuditEvent,
  AuthResult,
  CloseLeadInput,
  CommissionRecord,
  CreateLeadInput,
  Lead,
  LeadActivityLog,
  LeadDuplicateFlag,
  LeadNote,
  LeadQuery,
  LeadStatus,
  Notification,
  PortalSettings,
  PortalState,
  Project,
  Revision,
  Role,
  User
} from "../domain/types";
import type { PortalRepository } from "../store/types";

const today = () => new Date().toISOString();
const normalize = (value: string | undefined) => (value ?? "").trim().toLowerCase();
const normalizePhone = (value: string | undefined) => (value ?? "").replace(/\D/g, "");
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

export class PortalService {
  constructor(private repository: PortalRepository) {}

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const state = await this.repository.load();
    const user = state.users.find((entry) => normalize(entry.email) === normalize(email));

    if (!user) return { ok: false, message: "Invalid email or password." };
    if (user.status === "suspended") return { ok: false, message: "This account is suspended. Contact an administrator." };
    if (user.status === "deactivated") return { ok: false, message: "This account is deactivated. Contact an administrator." };

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return { ok: false, message: "Invalid email or password." };

    return { ok: true, user };
  }

  async getUserById(userId: string) {
    return (await this.repository.load()).users.find((user) => user.id === userId);
  }

  async findUserByEmail(email: string) {
    const user = (await this.repository.load()).users.find((entry) => normalize(entry.email) === normalize(email));
    if (!user) throw new Error(`User not found for email ${email}`);
    return user;
  }

  toPublicUser(user: User) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async listUsers(requestingUser: User) {
    this.assertRole(requestingUser, ["admin"]);
    return (await this.repository.load()).users.map((user) => this.toPublicUser(user));
  }

  async createUser(
    requestingUser: User,
    input: {
      name: string;
      email: string;
      phone?: string;
      role: Role;
      status?: User["status"];
      password: string;
    }
  ) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    if (state.users.some((user) => normalize(user.email) === normalize(input.email))) {
      throw new Error("A user with this email already exists.");
    }

    const timestamp = today();
    const user: User = {
      id: this.makeId(state, "user"),
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      status: input.status ?? "active",
      passwordHash: bcrypt.hashSync(input.password, 10),
      mustChangePassword: true,
      passwordResetAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    state.users.push(user);
    this.recordAudit(state, {
      entityType: "user",
      entityId: user.id,
      actorUserId: requestingUser.id,
      action: "user_created",
      newValue: JSON.stringify({ ...user, passwordHash: undefined })
    });
    await this.repository.save(state);
    return this.toPublicUser(user);
  }

  async updateUser(requestingUser: User, userId: string, input: Partial<Pick<User, "name" | "email" | "phone" | "role" | "status">>) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    const user = this.requireEntity(state.users.find((entry) => entry.id === userId), "User not found.");
    if (
      input.email &&
      state.users.some((entry) => entry.id !== userId && normalize(entry.email) === normalize(input.email))
    ) {
      throw new Error("A user with this email already exists.");
    }
    const previous = { ...user };
    Object.assign(user, input, { updatedAt: today() });
    this.recordAudit(state, {
      entityType: "user",
      entityId: user.id,
      actorUserId: requestingUser.id,
      action: "user_updated",
      oldValue: JSON.stringify(previous),
      newValue: JSON.stringify(user)
    });
    await this.repository.save(state);
    return this.toPublicUser(user);
  }

  async resetUserPassword(requestingUser: User, userId: string, newPassword: string) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    const user = this.requireEntity(state.users.find((entry) => entry.id === userId), "User not found.");
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.mustChangePassword = true;
    user.passwordResetAt = today();
    user.updatedAt = today();
    this.recordAudit(state, {
      entityType: "user",
      entityId: user.id,
      actorUserId: requestingUser.id,
      action: "password_reset"
    });
    this.pushNotification(state, {
      userId: user.id,
      title: "Password Reset",
      message: "An administrator updated your portal password.",
      type: "password_reset"
    });
    await this.repository.save(state);
  }

  async changePassword(requestingUser: User, currentPassword: string, newPassword: string) {
    const state = await this.repository.load();
    const user = this.requireEntity(state.users.find((entry) => entry.id === requestingUser.id), "User not found.");
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw new Error("Current password is incorrect.");

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.mustChangePassword = false;
    user.passwordResetAt = today();
    user.updatedAt = today();
    this.recordAudit(state, {
      entityType: "user",
      entityId: user.id,
      actorUserId: user.id,
      action: "password_changed"
    });
    await this.repository.save(state);
    return this.toPublicUser(user);
  }

  async listLeadsForUser(user: User, query: LeadQuery = {}) {
    const state = await this.repository.load();
    const accessible = state.leads.filter((lead) => this.canAccessLead(user, lead));

    return accessible.filter((lead) => {
      const search = normalize(query.search);
      const matchesSearch =
        !search ||
        [lead.businessName, lead.contactPersonName, lead.phoneNumber, lead.email, lead.id].some((entry) =>
          normalize(entry).includes(search)
        );
      const matchesSales = !query.salesPersonId || lead.assignedSalesPersonId === query.salesPersonId;
      const matchesStatus = !query.status || lead.status === query.status;
      const matchesCategory = !query.category || normalize(lead.businessCategory) === normalize(query.category);
      const matchesCity = !query.city || normalize(lead.city) === normalize(query.city);
      const matchesFollowUp =
        !query.followUpDue ||
        state.followUps.some((followUp) => followUp.leadId === lead.id && followUp.nextFollowUpDate === query.followUpDue);

      return matchesSearch && matchesSales && matchesStatus && matchesCategory && matchesCity && matchesFollowUp;
    });
  }

  async getLeadForUser(user: User, leadId: string) {
    const state = await this.repository.load();
    const lead = this.requireEntity(state.leads.find((entry) => entry.id === leadId), "Lead not found.");
    if (!this.canAccessLead(user, lead)) throw new Error("You are not authorized to view this lead.");

    const project = state.projects.find((entry) => entry.leadId === leadId);
    const revisions = project ? state.revisions.filter((entry) => entry.projectId === project.id) : [];

    return {
      lead,
      notes: state.leadNotes.filter((entry) => entry.leadId === leadId),
      followUps: state.followUps.filter((entry) => entry.leadId === leadId),
      activityLog: state.leadActivities.filter((entry) => entry.leadId === leadId),
      duplicateFlags: state.duplicateFlags.filter((entry) => entry.leadId === leadId),
      commission: state.commissions.find((entry) => entry.leadId === leadId),
      project,
      revisions
    };
  }

  async createLead(actorUserId: string, input: CreateLeadInput) {
    const state = await this.repository.load();
    const actor = this.requireEntity(state.users.find((user) => user.id === actorUserId), "User not found.");
    this.assertRole(actor, ["admin", "sales_associate"]);
    const timestamp = today();

    const lead: Lead = {
      id: this.makeId(state, "lead"),
      businessName: input.businessName,
      contactPersonName: input.contactPersonName,
      phoneNumber: input.phoneNumber,
      whatsappNumber: input.whatsappNumber,
      email: input.email,
      businessCategory: input.businessCategory,
      city: input.city,
      locality: input.locality,
      source: input.source,
      packageInterest: input.packageInterest,
      firstContactDate: input.firstContactDate,
      description: input.description,
      status: "new",
      assignedSalesPersonId: input.assignedSalesPersonId ?? actor.id,
      createdByUserId: actor.id,
      sharedWithUserIds: input.sharedWithUserIds ?? [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    state.leads.push(lead);
    state.ownershipHistory.push({
      id: this.makeId(state, "ownership"),
      leadId: lead.id,
      actorUserId: actor.id,
      toUserId: lead.assignedSalesPersonId,
      createdAt: timestamp
    });
    const duplicateFlags = this.detectDuplicates(state, lead);
    state.duplicateFlags.push(...duplicateFlags);
    const activity = this.pushLeadActivity(state, {
      leadId: lead.id,
      actorUserId: actor.id,
      action: "lead_created",
      details: "Lead created from portal"
    });
    this.pushNotification(state, {
      userId: lead.assignedSalesPersonId,
      title: "Lead Assigned",
      message: `${lead.businessName} is now assigned to you.`,
      type: "lead_assigned"
    });
    this.recordAudit(state, {
      entityType: "lead",
      entityId: lead.id,
      actorUserId: actor.id,
      action: "lead_created",
      newValue: JSON.stringify(lead)
    });
    await this.repository.save(state);
    return { lead, duplicateFlags, activity };
  }

  async addLeadNote(requestingUser: User, leadId: string, input: Omit<LeadNote, "id" | "leadId" | "authorUserId" | "createdAt">) {
    const state = await this.repository.load();
    this.requireAccessibleLead(state, requestingUser, leadId);
    const note: LeadNote = {
      id: this.makeId(state, "note"),
      leadId,
      authorUserId: requestingUser.id,
      createdAt: today(),
      ...input
    };
    state.leadNotes.push(note);
    this.pushLeadActivity(state, {
      leadId,
      actorUserId: requestingUser.id,
      action: "note_added",
      details: input.discussionSummary
    });
    await this.repository.save(state);
    return note;
  }

  async addFollowUp(requestingUser: User, leadId: string, input: Omit<PortalState["followUps"][number], "id" | "leadId" | "authorUserId" | "createdAt">) {
    const state = await this.repository.load();
    const lead = this.requireAccessibleLead(state, requestingUser, leadId);
    const followUp = {
      id: this.makeId(state, "followup"),
      leadId,
      authorUserId: requestingUser.id,
      createdAt: today(),
      ...input
    };
    state.followUps.push(followUp);
    this.pushLeadActivity(state, {
      leadId,
      actorUserId: requestingUser.id,
      action: "follow_up_added",
      details: `${input.followUpType}: ${input.outcome}`
    });
    this.pushNotification(state, {
      userId: lead.assignedSalesPersonId,
      title: "Follow-up Updated",
      message: `Follow-up saved for ${lead.businessName}.`,
      type: "follow_up_due"
    });
    await this.repository.save(state);
    return followUp;
  }

  async updateLeadStatus(requestingUser: User, leadId: string, status: LeadStatus) {
    const state = await this.repository.load();
    const lead = this.requireAccessibleLead(state, requestingUser, leadId);
    const previousStatus = lead.status;
    lead.status = status;
    lead.updatedAt = today();
    const activity = this.pushLeadActivity(state, {
      leadId,
      actorUserId: requestingUser.id,
      action: "status_changed",
      oldValue: previousStatus,
      newValue: status
    });
    await this.repository.save(state);
    return activity;
  }

  async assignLead(requestingUser: User, leadId: string, toUserId: string, sharedWithUserIds: string[] = []) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    const lead = this.requireEntity(state.leads.find((entry) => entry.id === leadId), "Lead not found.");
    const assignee = this.requireEntity(state.users.find((entry) => entry.id === toUserId), "Assignee not found.");
    if (assignee.status !== "active") throw new Error("Assignee must be active.");
    if (!["admin", "sales_associate"].includes(assignee.role)) {
      throw new Error("Assignee must be an admin or sales associate.");
    }
    const previousOwner = lead.assignedSalesPersonId;
    lead.assignedSalesPersonId = toUserId;
    lead.sharedWithUserIds = sharedWithUserIds;
    lead.updatedAt = today();
    state.ownershipHistory.push({
      id: this.makeId(state, "ownership"),
      leadId,
      actorUserId: requestingUser.id,
      fromUserId: previousOwner,
      toUserId,
      createdAt: today()
    });
    const activity = this.pushLeadActivity(state, {
      leadId,
      actorUserId: requestingUser.id,
      action: "lead_reassigned",
      oldValue: previousOwner,
      newValue: toUserId
    });
    await this.repository.save(state);
    return activity;
  }

  async resolveDuplicateFlag(requestingUser: User, flagId: string, resolutionNote: string) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    const flag = this.requireEntity(state.duplicateFlags.find((entry) => entry.id === flagId), "Duplicate flag not found.");
    flag.status = "resolved";
    flag.resolutionNote = resolutionNote;
    flag.resolvedAt = today();
    flag.resolvedByUserId = requestingUser.id;
    await this.repository.save(state);
    return flag;
  }

  async closeLead(requestingUser: User, leadId: string, input: CloseLeadInput) {
    this.assertRole(requestingUser, ["admin", "sales_associate"]);
    const state = await this.repository.load();
    const lead = this.requireAccessibleLead(state, requestingUser, leadId);
    if (lead.closureId || lead.status === "closed_won" || lead.projectId) {
      throw new Error("This lead has already been closed.");
    }
    const closureDate = today();
    const closure = {
      id: this.makeId(state, "closure"),
      leadId,
      markedReadyByUserId: requestingUser.id,
      confirmedByUserId: requestingUser.role === "admin" ? requestingUser.id : "user-admin",
      packageName: input.packageName,
      closedValue: input.closedValue,
      closureDate,
      remarks: input.remarks
    };
    state.closures.push(closure);
    lead.closureId = closure.id;
    lead.status = "closed_won";
    lead.updatedAt = closureDate;

    const project: Project = {
      id: this.makeId(state, "project"),
      leadId,
      salesPersonUserId: lead.assignedSalesPersonId,
      operationsOwnerUserId:
        input.operationsOwnerUserId ??
        state.users.find((user) => user.role === "operations" && user.status === "active")?.id,
      status: "project_started",
      startedAt: closureDate,
      currentRevisionStage: "round-0"
    };
    state.projects.push(project);
    lead.projectId = project.id;

    const commissionAmount =
      input.commissionAmount ??
      state.commissionRules.find((rule) => rule.packageName === input.packageName)?.amount ??
      Math.round(input.closedValue * 0.1);

    const commission: CommissionRecord = {
      id: this.makeId(state, "commission"),
      leadId,
      salesPersonUserId: lead.assignedSalesPersonId,
      businessName: lead.businessName,
      commissionAmount,
      closureDate,
      status: "pending",
      remarks: input.remarks
    };
    state.commissions.push(commission);
    this.pushLeadActivity(state, {
      leadId,
      actorUserId: requestingUser.id,
      action: "lead_closed",
      oldValue: "payment_pending",
      newValue: "closed_won",
      details: input.packageName
    });
    await this.repository.save(state);
    return { lead, project, commission, closure };
  }

  async listCommissions(requestingUser: User) {
    const state = await this.repository.load();
    if (requestingUser.role === "admin") return state.commissions;
    if (requestingUser.role === "sales_associate") {
      return state.commissions.filter((entry) => entry.salesPersonUserId === requestingUser.id);
    }
    return [];
  }

  async updateCommissionStatus(
    requestingUser: User,
    commissionId: string,
    input: Pick<CommissionRecord, "status" | "remarks" | "payoutDate" | "rejectionReason" | "holdReason">
  ) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    const commission = this.requireEntity(state.commissions.find((entry) => entry.id === commissionId), "Commission not found.");
    commission.status = input.status;
    commission.remarks = input.remarks;
    commission.payoutDate = input.payoutDate;
    commission.rejectionReason = input.rejectionReason;
    commission.holdReason = input.holdReason;
    await this.repository.save(state);
    return commission;
  }

  async listProjects(requestingUser: User) {
    const state = await this.repository.load();
    if (requestingUser.role === "admin" || requestingUser.role === "operations") return state.projects;
    return state.projects.filter((project) => project.salesPersonUserId === requestingUser.id);
  }

  async getProjectByLeadId(leadId: string) {
    return (await this.repository.load()).projects.find((project) => project.leadId === leadId);
  }

  async updateProjectStatus(requestingUser: User, projectId: string, status: Project["status"], currentRevisionStage?: string) {
    this.assertRole(requestingUser, ["admin", "operations"]);
    const state = await this.repository.load();
    const project = this.requireEntity(state.projects.find((entry) => entry.id === projectId), "Project not found.");
    project.status = status;
    project.currentRevisionStage = currentRevisionStage ?? project.currentRevisionStage;
    if (status === "closed") project.completedAt = today();
    await this.repository.save(state);
    return project;
  }

  async listRevisions(requestingUser: User) {
    const state = await this.repository.load();
    if (requestingUser.role === "admin" || requestingUser.role === "operations") return state.revisions;
    const projectIds = state.projects.filter((project) => project.salesPersonUserId === requestingUser.id).map((project) => project.id);
    return state.revisions.filter((revision) => projectIds.includes(revision.projectId));
  }

  async addRevision(requestingUser: User, projectId: string, input: Pick<Revision, "revisionNotes" | "requestedDate" | "status">) {
    this.assertRole(requestingUser, ["admin", "operations"]);
    const state = await this.repository.load();
    const project = this.requireEntity(state.projects.find((entry) => entry.id === projectId), "Project not found.");
    const revision: Revision = {
      id: this.makeId(state, "revision"),
      projectId,
      roundNumber: state.revisions.filter((entry) => entry.projectId === projectId).length + 1,
      revisionNotes: input.revisionNotes,
      requestedDate: input.requestedDate,
      status: input.status
    };
    state.revisions.push(revision);
    project.status = input.status === "in_progress" ? "revision_in_progress" : "revision_pending";
    project.currentRevisionStage = `round-${revision.roundNumber}`;
    await this.repository.save(state);
    return revision;
  }

  async updateRevisionStatus(requestingUser: User, revisionId: string, status: Revision["status"], completedDate?: string) {
    this.assertRole(requestingUser, ["admin", "operations"]);
    const state = await this.repository.load();
    const revision = this.requireEntity(state.revisions.find((entry) => entry.id === revisionId), "Revision not found.");
    const project = this.requireEntity(state.projects.find((entry) => entry.id === revision.projectId), "Project not found.");
    revision.status = status;
    revision.completedDate = status === "completed" ? completedDate ?? today().slice(0, 10) : completedDate ?? revision.completedDate;
    if (status === "completed") {
      const hasPendingRevisions = state.revisions.some(
        (entry) => entry.projectId === revision.projectId && entry.id !== revision.id && entry.status !== "completed"
      );
      project.status = hasPendingRevisions ? "revision_pending" : "in_progress";
    } else {
      project.status = status === "in_progress" ? "revision_in_progress" : "revision_pending";
    }
    await this.repository.save(state);
    return revision;
  }

  async getDashboardSummary(requestingUser: User) {
    const state = await this.repository.load();
    const visibleLeads = await this.listLeadsForUser(requestingUser);
    const visibleLeadIds = new Set(visibleLeads.map((lead) => lead.id));
    const visibleFollowUps = state.followUps.filter((entry) => visibleLeadIds.has(entry.leadId));
    const todayDate = today().slice(0, 10);
    const visibleCommissions = await this.listCommissions(requestingUser);
    const totalCommissionPending = visibleCommissions
      .filter((entry) => ["pending", "under_review", "approved"].includes(entry.status))
      .reduce((sum, entry) => sum + entry.commissionAmount, 0);
    const totalCommissionPaid = visibleCommissions
      .filter((entry) => entry.status === "paid")
      .reduce((sum, entry) => sum + entry.commissionAmount, 0);

    if (requestingUser.role === "admin") {
      return {
        totalSalesPeople: state.users.filter((entry) => entry.role === "sales_associate").length,
        totalLeads: state.leads.length,
        inactiveLeads: state.leads.filter((entry) => entry.status === "dormant").length,
        duplicateLeads: state.duplicateFlags.filter((entry) => entry.status === "open").length,
        closedLeads: state.leads.filter((entry) => entry.status === "closed_won").length,
        commissionsPendingApproval: state.commissions.filter((entry) => entry.status === "pending").length,
        commissionsPaid: state.commissions.filter((entry) => entry.status === "paid").length,
        projectsInProgress: state.projects.filter((entry) => entry.status !== "closed").length,
        revisionsPending: state.revisions.filter((entry) => entry.status !== "completed").length,
        leadsByStatus: Object.fromEntries(
          state.settings.leadStatuses.map((status) => [status, state.leads.filter((lead) => lead.status === status).length])
        )
      };
    }

    return {
      totalLeads: visibleLeads.length,
      newLeads: visibleLeads.filter((entry) => entry.status === "new").length,
      activeFollowUps: visibleFollowUps.length,
      interestedLeads: visibleLeads.filter((entry) => entry.status === "interested").length,
      paymentPendingLeads: visibleLeads.filter((entry) => entry.status === "payment_pending").length,
      closedLeads: visibleLeads.filter((entry) => entry.status === "closed_won").length,
      lostLeads: visibleLeads.filter((entry) => entry.status === "lost").length,
      followUpsDueToday: visibleFollowUps.filter((entry) => entry.nextFollowUpDate === todayDate).length,
      totalCommissionPending,
      totalCommissionPaid
    };
  }

  async getSupportContent() {
    const state = await this.repository.load();
    return {
      servicePackages: state.servicePackages,
      salesInstructions: state.salesInstructions,
      objectionGuides: state.objectionGuides,
      closingGuides: state.closingGuides
    };
  }

  async updateSupportContent(
    requestingUser: User,
    content: Awaited<ReturnType<PortalService["getSupportContent"]>>
  ) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    state.servicePackages = content.servicePackages;
    state.salesInstructions = content.salesInstructions;
    state.objectionGuides = content.objectionGuides;
    state.closingGuides = content.closingGuides;
    await this.repository.save(state);
    return this.getSupportContent();
  }

  async getSettings(requestingUser: User) {
    this.assertRole(requestingUser, ["admin"]);
    return (await this.repository.load()).settings;
  }

  async updateSettings(requestingUser: User, settings: PortalSettings) {
    this.assertRole(requestingUser, ["admin"]);
    const state = await this.repository.load();
    state.settings = settings;
    await this.repository.save(state);
    return settings;
  }

  async listNotifications(requestingUser: User) {
    return (await this.repository.load()).notifications.filter((entry) => entry.userId === requestingUser.id);
  }

  async markNotificationRead(requestingUser: User, notificationId: string) {
    const state = await this.repository.load();
    const notification = this.requireEntity(
      state.notifications.find((entry) => entry.id === notificationId && entry.userId === requestingUser.id),
      "Notification not found."
    );
    notification.readAt = today();
    await this.repository.save(state);
    return notification;
  }

  async listAuditEvents(requestingUser: User) {
    this.assertRole(requestingUser, ["admin"]);
    return (await this.repository.load()).auditEvents;
  }

  async exportLeadsCsv(requestingUser: User) {
    return this.toCsv(
      ["Lead ID", "Business Name", "Contact", "Phone", "City", "Status"],
      (await this.listLeadsForUser(requestingUser)).map((lead) => [
        lead.id,
        lead.businessName,
        lead.contactPersonName,
        lead.phoneNumber,
        lead.city,
        lead.status
      ])
    );
  }

  async exportCommissionsCsv(requestingUser: User) {
    return this.toCsv(
      ["Commission ID", "Business Name", "Amount", "Status", "Closure Date"],
      (await this.listCommissions(requestingUser)).map((commission) => [
        commission.id,
        commission.businessName,
        String(commission.commissionAmount),
        commission.status,
        commission.closureDate
      ])
    );
  }

  async exportProjectsCsv(requestingUser: User) {
    return this.toCsv(
      ["Project ID", "Lead ID", "Status", "Started At", "Completed At"],
      (await this.listProjects(requestingUser)).map((project) => [
        project.id,
        project.leadId,
        project.status,
        project.startedAt,
        project.completedAt ?? ""
      ])
    );
  }

  private canAccessLead(user: User, lead: Lead) {
    if (user.role === "admin") return true;
    if (user.role === "sales_associate") {
      return lead.assignedSalesPersonId === user.id || lead.createdByUserId === user.id || lead.sharedWithUserIds.includes(user.id);
    }
    return lead.status === "closed_won" || Boolean(lead.projectId);
  }

  private requireAccessibleLead(state: PortalState, requestingUser: User, leadId: string) {
    const lead = this.requireEntity(state.leads.find((entry) => entry.id === leadId), "Lead not found.");
    if (!this.canAccessLead(requestingUser, lead)) throw new Error("You are not authorized to access this lead.");
    return lead;
  }

  private detectDuplicates(state: PortalState, lead: Lead) {
    const duplicates: LeadDuplicateFlag[] = [];
    const phone = normalizePhone(lead.phoneNumber);
    const email = normalize(lead.email);
    const businessCityKey = `${slugify(lead.businessName)}::${slugify(lead.city)}`;

    state.leads
      .filter((existing) => existing.id !== lead.id)
      .forEach((existing) => {
        if (normalizePhone(existing.phoneNumber) === phone) {
          duplicates.push(this.makeDuplicate(state, lead.id, existing.id, "phone"));
        }
        if (normalize(existing.email) === email) {
          duplicates.push(this.makeDuplicate(state, lead.id, existing.id, "email"));
        }
        const existingBusinessCityKey = `${slugify(existing.businessName)}::${slugify(existing.city)}`;
        if (existingBusinessCityKey === businessCityKey) {
          duplicates.push(this.makeDuplicate(state, lead.id, existing.id, "business_city"));
        }
      });
    return duplicates;
  }

  private makeDuplicate(state: PortalState, leadId: string, conflictingLeadId: string, matchType: LeadDuplicateFlag["matchType"]) {
    return {
      id: this.makeId(state, "duplicate"),
      leadId,
      conflictingLeadId,
      matchType,
      status: "open" as const,
      createdAt: today()
    };
  }

  private pushLeadActivity(state: PortalState, input: Omit<LeadActivityLog, "id" | "createdAt">) {
    const activity: LeadActivityLog = { id: this.makeId(state, "activity"), createdAt: today(), ...input };
    state.leadActivities.push(activity);
    return activity;
  }

  private pushNotification(state: PortalState, input: Omit<Notification, "id" | "createdAt">) {
    const notification: Notification = { id: this.makeId(state, "notification"), createdAt: today(), ...input };
    state.notifications.push(notification);
    return notification;
  }

  private recordAudit(state: PortalState, input: Omit<AuditEvent, "id" | "createdAt">) {
    const event: AuditEvent = { id: this.makeId(state, "audit"), createdAt: today(), ...input };
    state.auditEvents.push(event);
    return event;
  }

  private makeId(state: PortalState, prefix: string) {
    state.meta.nextId += 1;
    return `${prefix}-${state.meta.nextId}`;
  }

  private toCsv(headers: string[], rows: string[][]) {
    const escape = (value: string) => `"${value.replaceAll("\"", "\"\"")}"`;
    return [headers, ...rows].map((row) => row.map((value) => escape(value)).join(",")).join("\n");
  }

  private assertRole(user: User, allowedRoles: Role[]) {
    if (!allowedRoles.includes(user.role)) throw new Error("You are not authorized to perform this action.");
  }

  private requireEntity<T>(entity: T | undefined, message: string) {
    if (!entity) throw new Error(message);
    return entity;
  }
}
