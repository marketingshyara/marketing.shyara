export type UserRole = "ADMIN" | "SALES_REP";

export type LeadStatus =
  | "NEW"
  | "ADVANCE_PAID"
  | "BUILDING"
  | "PREVIEW_SENT"
  | "FINAL_PAID"
  | "DEPLOYED"
  | "COMMISSION_PAID";

export type PaymentKind = "ADVANCE" | "FINAL";

export type PaymentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type ActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "PAYMENT_MARKED"
  | "PAYMENT_VERIFIED"
  | "COMMISSION_PAID"
  | "PASSWORD_CHANGED"
  | "EXPORT"
  | "SETTINGS_UPDATE";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProjectListItem {
  id: string;
  clientName: string;
  status: LeadStatus;
  agreedTotalCents: number | null;
  convertedAt: string | null;
  updatedAt: string;
  assignedToUserId: string;
  rep: {
    id: string;
    email: string;
    displayName: string | null;
    archivedAt: string | null;
  } | null;
  currentStageKey: string;
  currentStageTitle: string;
  pendingAdmin: boolean;
}

export interface LeadPayment {
  id: string;
  leadId: string;
  kind: PaymentKind;
  amountCents: number;
  repNote: string | null;
  markedByUserId: string;
  markedAt: string;
  verificationStatus: PaymentVerificationStatus;
  verifiedByUserId: string | null;
  verifiedAt: string | null;
  adminNote: string | null;
  /** Present once a payment is verified with a provider reference. */
  externalReference?: string | null;
}

export interface Commission {
  id: string;
  leadId: string;
  repUserId: string;
  amountCents: number;
  bonusCents: number;
  isPaid: boolean;
  paidAt: string | null;
  paidByAdminId: string | null;
  createdAt: string;
}

export interface CommissionListLead {
  id: string;
  clientName: string;
  status: LeadStatus;
  agreedTotalCents: number | null;
  project: { deploymentVerifiedAt: string | null } | null;
}

export interface CommissionListItem extends Commission {
  lead: CommissionListLead;
  rep: Pick<SessionUser, "id" | "displayName">;
  expectedAmountCents: number | null;
  integrityIssues: string[];
}

export interface CommissionsListSummary {
  total: number;
  siteLive: number;
  calculated: number;
  paid: number;
}

export interface CommissionsListResponse extends Paginated<CommissionListItem> {
  summary: CommissionsListSummary;
}

export interface WebsiteTemplate {
  id: string;
  slug: string;
  name: string;
  displayCode: string;
  categoryId: string;
  sampleSlug: string;
  samplePath: string | null;
  sortOrder: number;
}

export interface Lead {
  id: string;
  createdByUserId: string;
  assignedToUserId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  notes: string | null;
  status: LeadStatus;
  advanceAmountCents: number | null;
  finalQuoteCents: number | null;
  agreedTotalCents: number | null;
  websiteTemplateId: string | null;
  contentReceivedAt: string | null;
  convertedAt: string | null;
  clientDetailsSubmittedAt: string | null;
  clientDetailsVerifiedAt: string | null;
  whatsappGroupLink: string | null;
  whatsappVerifiedAt: string | null;
  demoFinalizedAt: string | null;
  demoFinalizedVerifiedAt: string | null;
  accountsReadyAt: string | null;
  accountsReadyVerifiedAt: string | null;
  clientGithubId: string | null;
  clientGithubEmail: string | null;
  transferredGithubRepoUrl: string | null;
  repoTransferVerifiedAt: string | null;
  stageDeclineNotes?: Record<
    string,
    { adminNote: string | null; declinedAt: string }
  > | null;
  createdAt: string;
  updatedAt: string;
  payments?: LeadPayment[];
  commission?: Commission | null;
  project?: Project | null;
  websiteTemplate?: WebsiteTemplate | null;
  /** Present on GET /api/leads list items */
  pipelineSummary?: LeadPipelineSummary;
}

/** Pending payment row from GET /api/payments/pending (admin queue). */
export interface LeadPaymentWithRelations extends LeadPayment {
  lead: Pick<Lead, "id" | "clientName" | "assignedToUserId">;
  markedBy: Pick<SessionUser, "id" | "displayName" | "email">;
}

export interface Project {
  id: string;
  leadId: string;
  title: string;
  metadata: Record<string, unknown> | null;
  previewUrl: string | null;
  deployedUrl: string | null;
  deploymentSubmittedAt: string | null;
  deploymentVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: Pick<Lead, "id" | "clientName" | "status" | "createdByUserId" | "assignedToUserId">;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  ip: string | null;
  userAgent: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
  user?: { id: string; displayName: string | null; email: string } | null;
}

export interface ManualTransition {
  from: LeadStatus;
  to: LeadStatus;
  adminOnly: boolean;
  enabled: boolean;
}

export interface RepTutorialLink {
  title: string;
  url: string;
}

export interface RepPainPoint {
  categoryId: string;
  title: string;
  bullets: string[];
}

export type PaymentShareMethodKey =
  | "upi_id"
  | "razorpay_qr"
  | "sbi_qr"
  | "razorpay_payment_link"
  | "razorpay_payment_page";

export interface PaymentShareMethodConfig {
  key: PaymentShareMethodKey;
  shareValue: string;
  qrImageUrl?: string | null;
  instructions?: string | null;
}

export interface TeamRepSummary {
  id: string;
  email: string;
  displayName: string | null;
  archivedAt?: string | null;
  isActive?: boolean;
  totalLeads: number;
  activeClients: number;
  ongoingProjects: number;
  completedProjects: number;
  pendingPayments: number;
  needsAdminAction: number;
  /** Legacy alias */
  activeLeads?: number;
  pendingVerifications?: number;
}

export interface TeamRepProject {
  id: string;
  clientName: string;
  status: LeadStatus;
  agreedTotalCents: number | null;
  convertedAt: string | null;
  currentStageKey: PipelineStageKey;
  currentStageTitle: string;
  pendingAdmin: boolean;
  pipelineStages: PipelineStageView[];
}

export interface RepPortalSettings {
  minAgreedTotalCents: number;
  advancePaymentShareBps: number;
  commissionRateBps: number;
  commissionRounding: "floor" | "round" | "bankers";
  /** Extra payout rate (% of agreed total) after rep hits paid-sale threshold. */
  performanceBonusBps: number;
  performanceBonusAfterCompletedSales: number;
  templatesCatalogUrl: string;
  tutorialLinks: RepTutorialLink[];
  painPointsByCategory: RepPainPoint[];
  paymentShareMethods: PaymentShareMethodConfig[];
}

export interface PortalSettingsValues extends RepPortalSettings {
  commissionBasis: "VERIFIED_FINAL_PAYMENT" | "FINAL_QUOTE" | "AGREED_TOTAL";
  commissionRounding: "floor" | "round" | "bankers";
  manualTransitions: ManualTransition[];
  advancePaymentRequiredLeadStatus: LeadStatus;
  finalPaymentRequiredLeadStatus: LeadStatus;
  advanceVerifyRequiredLeadStatus: LeadStatus;
  finalVerifyRequiredLeadStatus: LeadStatus;
  terminalNoMutationStatuses: LeadStatus[];
  enforcePaymentQuoteToleranceBps: number | null;
  exportMaxRows: number;
}

export type PipelineStageKey =
  | "lead_capture"
  | "convert_deal"
  | "advance_verify"
  | "whatsapp_group"
  | "build_demo"
  | "demo_finalized"
  | "accounts_ready"
  | "final_payment"
  | "final_verify"
  | "repo_transfer"
  | "deployment_submit"
  | "deployment_verify"
  | "commission";

export type LeadPipelineSummary = {
  currentStageKey: PipelineStageKey;
  currentStageTitle: string;
  pendingAdmin: boolean;
};

export type StageUiState = "locked" | "actionable" | "pending_admin" | "verified";

export interface PipelineStageView {
  key: PipelineStageKey;
  title: string;
  repActor: boolean;
  adminActor: boolean;
  state: StageUiState;
  hint?: string;
  blockedReason?: string;
  /** Present when step was declined and needs resubmit; null = no written note. */
  declineNote?: string | null;
}

export type PipelineStageVerifyKey =
  | "whatsapp"
  | "preview_ready"
  | "demo_finalized"
  | "accounts_ready"
  | "repo_transfer"
  | "deployment"
  | "client_details";

export type PortalNotificationKind = "REP_SUBMITTED" | "ADMIN_VERIFIED" | "ADMIN_DECLINED";

export interface PortalNotification {
  id: string;
  leadId: string;
  repId?: string | null;
  kind: PortalNotificationKind;
  stageKey: string | null;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export type PendingActionType =
  | "PAYMENT"
  | "CLIENT_DETAILS"
  | "WHATSAPP"
  | "DEMO_FINALIZED"
  | "ACCOUNTS"
  | "BUILD_DEMO"
  | "REPO_TRANSFER"
  | "DEPLOYMENT"
  | "COMMISSION";

export interface PendingActionItem {
  type: PendingActionType;
  leadId: string;
  repId: string | null;
  clientName: string;
  stageKey: string;
  submittedAt: string;
  summary: string;
  paymentId?: string;
  paymentKind?: PaymentKind;
}

export interface LeadDetailResponse {
  lead: Lead;
  pipelineStages: PipelineStageView[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
