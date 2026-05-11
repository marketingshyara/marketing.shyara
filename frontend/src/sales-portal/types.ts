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
}

export interface Commission {
  id: string;
  leadId: string;
  repUserId: string;
  amountCents: number;
  isPaid: boolean;
  paidAt: string | null;
  paidByAdminId: string | null;
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
  payments?: LeadPayment[];
  commission?: Commission | null;
  project?: Project | null;
}

export interface Project {
  id: string;
  leadId: string;
  title: string;
  metadata: Record<string, unknown> | null;
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

export interface PortalSettingsValues {
  commissionRateBps: number;
  commissionBasis: "VERIFIED_FINAL_PAYMENT" | "FINAL_QUOTE";
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
