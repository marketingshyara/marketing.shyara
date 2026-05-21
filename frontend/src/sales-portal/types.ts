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
  createdAt: string;
  updatedAt: string;
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
  whatsappGroupLink: string | null;
  whatsappVerifiedAt: string | null;
  demoFinalizedAt: string | null;
  accountsReadyAt: string | null;
  accountsReadyVerifiedAt: string | null;
  repoTransferVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: LeadPayment[];
  commission?: Commission | null;
  project?: Project | null;
  websiteTemplate?: WebsiteTemplate | null;
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

export interface TeamRepSummary {
  id: string;
  email: string;
  displayName: string | null;
  totalLeads: number;
  activeClients: number;
  ongoingProjects: number;
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
  templatesCatalogUrl: string;
  tutorialLinks: RepTutorialLink[];
  painPointsByCategory: RepPainPoint[];
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
  performanceBonusAmountCents: number;
  performanceBonusAfterCompletedSales: number;
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

export type StageUiState = "locked" | "actionable" | "pending_admin" | "verified";

export interface PipelineStageView {
  key: PipelineStageKey;
  title: string;
  repActor: boolean;
  adminActor: boolean;
  state: StageUiState;
  hint?: string;
}

export type PipelineStageVerifyKey =
  | "whatsapp"
  | "preview_ready"
  | "accounts_ready"
  | "repo_transfer"
  | "deployment";

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
