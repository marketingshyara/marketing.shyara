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

export type ProspectCategory =
  | "NEW_LEAD"
  | "CALLBACK_REQUESTED"
  | "NO_ANSWER"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "NOT_INTERESTED";

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
  scraperQuota?: ScraperQuotaSummary | null;
}

export interface ScraperQuotaSummary {
  monthlyQuota: number;
  searchesUsed: number;
  remaining: number;
}

export type ScraperPlaceResult = {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  businessStatus?: string;
  category: string;
  hasWebsite: boolean;
  websiteUrl: string | null;
  mapsUrl: string;
  lat?: number;
  lng?: number;
};

export type LeadScraperSearchResponse = {
  source: "api" | "cache" | "api_sweep" | "cache_sweep";
  location: string;
  keyword: string;
  rawResultCount: number;
  totalResults: number;
  duplicateCount?: number;
  orgUnavailableCount?: number;
  noWebsiteCount: number;
  searchedAt?: string;
  ageInDays?: number;
  sweepPartial?: boolean;
  categoriesCompleted?: number;
  totalCategories?: number;
  results: ScraperPlaceResult[];
};

export type LeadScraperUsageResponse = {
  user: {
    id: string;
    name: string;
    role: string;
    used: number;
    limit: number;
    remaining: number;
  };
  global: {
    used: number;
    limit: number;
    remaining: number;
    resetsOn: string;
    month: string;
  };
  resetsOn: string;
};

export type LeadScraperPastPlace = {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  category: string | null;
  hasWebsite: boolean;
  websiteUrl: string | null;
  mapsUrl: string | null;
  lat: number | null;
  lng: number | null;
  viewedAt: string;
  pipelineImported: boolean;
};

export type LeadScraperPlacesResponse = {
  leads: LeadScraperPastPlace[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type LeadScraperImportResponse = {
  imported: Array<{
    id: string;
    clientName: string;
    clientPhone: string | null;
    googlePlaceId: string | null;
    prospectCategory: ProspectCategory;
    status: LeadStatus;
  }>;
  skipped: Array<{ placeId: string; reason: string }>;
  failed: Array<{ placeId: string; reason: string }>;
};

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
  prospectCategory: ProspectCategory;
  callbackScheduledAt: string | null;
  interestedSampleShared: boolean | null;
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
  notInterestedLeads?: number;
  activeClients: number;
  ongoingProjects: number;
  completedProjects: number;
  pendingPayments: number;
  needsAdminAction: number;
  /** Legacy alias */
  activeLeads?: number;
  pendingVerifications?: number;
}

export type RepLeadDisposition = "prospect" | "not_interested" | "client" | "settled";

export interface LeadProspectCategoryEvent {
  id: string;
  leadId: string;
  category: ProspectCategory;
  note: string | null;
  callbackAt: string | null;
  sampleShared: boolean | null;
  createdAt: string;
  createdByUserId: string;
  createdBy: Pick<SessionUser, "id" | "displayName" | "email">;
}

export interface TeamRepLeadItem {
  id: string;
  clientName: string;
  status: LeadStatus;
  createdAt: string;
  convertedAt: string | null;
  prospectCategory: ProspectCategory;
  callbackScheduledAt: string | null;
  interestedSampleShared: boolean | null;
  disposition: RepLeadDisposition;
  pipelineSummary: LeadPipelineSummary | null;
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
