export type Role = "admin" | "sales_associate" | "operations";
export type UserStatus = "active" | "suspended" | "deactivated";

export type LeadStatus =
  | "new"
  | "contacted"
  | "under_follow_up"
  | "interested"
  | "not_interested"
  | "callback_later"
  | "payment_pending"
  | "closed_won"
  | "lost"
  | "dormant";

export type FollowUpType = "call" | "whatsapp" | "email" | "meeting" | "callback" | "payment_discussion" | "other";
export type FollowUpOutcome =
  | "no_response"
  | "interested"
  | "not_interested"
  | "follow_up_needed"
  | "call_later"
  | "payment_pending";
export type CommissionStatus = "pending" | "under_review" | "approved" | "paid" | "rejected" | "on_hold";
export type ProjectStatus =
  | "project_started"
  | "content_pending"
  | "in_progress"
  | "preview_shared"
  | "revision_pending"
  | "revision_in_progress"
  | "final_delivery_done"
  | "closed";
export type RevisionStatus = "pending" | "in_progress" | "completed" | "on_hold";
export type DuplicateMatchType = "phone" | "email" | "business_city";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  passwordHash: string;
  mustChangePassword: boolean;
  passwordResetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  businessName: string;
  contactPersonName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  businessCategory: string;
  city: string;
  locality: string;
  source: string;
  packageInterest: string;
  firstContactDate: string;
  description: string;
  status: LeadStatus;
  assignedSalesPersonId: string;
  createdByUserId: string;
  sharedWithUserIds: string[];
  closureId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  authorUserId: string;
  discussionSummary: string;
  objections?: string;
  nextSteps?: string;
  promisedFollowUp?: string;
  internalReminder?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  authorUserId: string;
  dateTime: string;
  followUpType: FollowUpType;
  note: string;
  nextFollowUpDate?: string;
  outcome: FollowUpOutcome;
  createdAt: string;
}

export interface LeadActivityLog {
  id: string;
  leadId: string;
  action: string;
  actorUserId: string;
  createdAt: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export interface LeadDuplicateFlag {
  id: string;
  leadId: string;
  conflictingLeadId: string;
  matchType: DuplicateMatchType;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolutionNote?: string;
}

export interface LeadOwnershipHistory {
  id: string;
  leadId: string;
  actorUserId: string;
  fromUserId?: string;
  toUserId: string;
  createdAt: string;
}

export interface ServicePackage {
  id: string;
  packageName: string;
  shortPitch: string;
  inclusions: string[];
  exclusions: string[];
  pricing?: number;
}

export interface SalesInstruction {
  id: string;
  title: string;
  content: string;
}

export interface ObjectionGuide {
  id: string;
  title: string;
  response: string;
}

export interface ClosingGuide {
  id: string;
  title: string;
  content: string;
}

export interface LeadClosure {
  id: string;
  leadId: string;
  markedReadyByUserId: string;
  confirmedByUserId: string;
  packageName: string;
  closedValue: number;
  closureDate: string;
  remarks?: string;
}

export interface CommissionRule {
  id: string;
  name: string;
  packageName?: string;
  role?: Role;
  amount?: number;
  percentage?: number;
}

export interface CommissionRecord {
  id: string;
  leadId: string;
  salesPersonUserId: string;
  businessName: string;
  commissionAmount: number;
  closureDate: string;
  status: CommissionStatus;
  payoutDate?: string;
  remarks?: string;
  rejectionReason?: string;
  holdReason?: string;
}

export interface CommissionLog {
  id: string;
  commissionId: string;
  actorUserId: string;
  action: string;
  createdAt: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export interface Project {
  id: string;
  leadId: string;
  salesPersonUserId: string;
  operationsOwnerUserId?: string;
  status: ProjectStatus;
  startedAt: string;
  completedAt?: string;
  currentRevisionStage?: string;
}

export interface Revision {
  id: string;
  projectId: string;
  roundNumber: number;
  revisionNotes: string;
  requestedDate: string;
  completedDate?: string;
  status: RevisionStatus;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  readAt?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  entityType: string;
  entityId: string;
  actorUserId: string;
  action: string;
  createdAt: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}

export interface PortalSettings {
  leadStatuses: LeadStatus[];
  commissionStatuses: CommissionStatus[];
  projectStatuses: ProjectStatus[];
  revisionStatuses: RevisionStatus[];
  inactivityReminderDays: number;
  notifications: {
    inAppEnabled: boolean;
    emailEnabled: boolean;
  };
}

export interface PortalState {
  meta: {
    nextId: number;
    version: number;
  };
  users: User[];
  leads: Lead[];
  leadNotes: LeadNote[];
  followUps: FollowUp[];
  leadActivities: LeadActivityLog[];
  duplicateFlags: LeadDuplicateFlag[];
  ownershipHistory: LeadOwnershipHistory[];
  servicePackages: ServicePackage[];
  salesInstructions: SalesInstruction[];
  objectionGuides: ObjectionGuide[];
  closingGuides: ClosingGuide[];
  closures: LeadClosure[];
  commissionRules: CommissionRule[];
  commissions: CommissionRecord[];
  commissionLogs: CommissionLog[];
  projects: Project[];
  revisions: Revision[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  settings: PortalSettings;
}

export interface AuthResult {
  ok: boolean;
  message?: string;
  user?: User;
}

export interface CreateLeadInput {
  businessName: string;
  contactPersonName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  businessCategory: string;
  city: string;
  locality: string;
  source: string;
  packageInterest: string;
  firstContactDate: string;
  description: string;
  assignedSalesPersonId?: string;
  sharedWithUserIds?: string[];
}

export interface CloseLeadInput {
  packageName: string;
  closedValue: number;
  commissionAmount?: number;
  remarks?: string;
  operationsOwnerUserId?: string;
}

export interface LeadQuery {
  search?: string;
  salesPersonId?: string;
  status?: LeadStatus;
  category?: string;
  city?: string;
  followUpDue?: string;
}
