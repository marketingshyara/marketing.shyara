export type Role = "admin" | "sales_associate" | "operations";

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: "active" | "suspended" | "deactivated";
  mustChangePassword: boolean;
  passwordResetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalSessionResponse {
  authenticated: boolean;
  user?: PortalUser;
}

export interface LeadRecord {
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
  status: string;
  assignedSalesPersonId: string;
  createdByUserId: string;
  sharedWithUserIds: string[];
  closureId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  openDuplicateCount?: number;
  nextFollowUpDate?: string;
  followUpCount?: number;
}

export interface LeadDetailResponse {
  lead: LeadRecord;
  notes: Array<{
    id: string;
    discussionSummary: string;
    objections?: string;
    nextSteps?: string;
    promisedFollowUp?: string;
    internalReminder?: string;
    createdAt: string;
    authorUserId: string;
  }>;
  followUps: Array<{
    id: string;
    dateTime: string;
    followUpType: string;
    note: string;
    nextFollowUpDate?: string;
    outcome: string;
    createdAt: string;
    authorUserId: string;
  }>;
  activityLog: Array<{
    id: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    details?: string;
    createdAt: string;
    actorUserId: string;
  }>;
  duplicateFlags: Array<{
    id: string;
    conflictingLeadId: string;
    matchType: string;
    status: string;
    resolutionNote?: string;
    createdAt: string;
  }>;
  commission?: {
    id: string;
    commissionAmount: number;
    status: string;
    closureDate: string;
    remarks?: string;
  };
  project?: {
    id: string;
    leadId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    currentRevisionStage?: string;
  };
  revisions: Array<{
    id: string;
    projectId: string;
    roundNumber: number;
    revisionNotes: string;
    requestedDate: string;
    completedDate?: string;
    status: string;
  }>;
}

export interface SupportContent {
  servicePackages: Array<{
    id: string;
    packageName: string;
    shortPitch: string;
    inclusions: string[];
    exclusions: string[];
    pricing?: number;
  }>;
  salesInstructions: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  objectionGuides: Array<{
    id: string;
    title: string;
    response: string;
  }>;
  closingGuides: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

export interface PortalSettingsResponse {
  leadStatuses: string[];
  commissionStatuses: string[];
  projectStatuses: string[];
  revisionStatuses: string[];
  inactivityReminderDays: number;
  notifications: {
    inAppEnabled: boolean;
    emailEnabled: boolean;
  };
}

export type DashboardSummary = Record<string, number | Record<string, number>>;

export interface PortalCommission {
  id: string;
  businessName: string;
  commissionAmount: number;
  status: string;
  closureDate: string;
  payoutDate?: string;
  remarks?: string;
  rejectionReason?: string;
  holdReason?: string;
}

export interface PortalProject {
  id: string;
  leadId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  currentRevisionStage?: string;
}

export interface PortalRevision {
  id: string;
  projectId: string;
  roundNumber: number;
  revisionNotes: string;
  requestedDate: string;
  completedDate?: string;
  status: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  readAt?: string;
  createdAt: string;
}

export interface PortalAuditEvent {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
  details?: string;
}
