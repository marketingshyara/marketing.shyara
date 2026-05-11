import type { LeadStatus, PaymentKind, PaymentVerificationStatus, UserRole } from "../types";

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New Lead",
  ADVANCE_PAID: "Advance Received",
  BUILDING: "Work in Progress",
  PREVIEW_SENT: "Preview Shared",
  FINAL_PAID: "Final Payment Received",
  DEPLOYED: "Site Deployed",
  COMMISSION_PAID: "Commission Settled"
};

const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  SALES_REP: "Sales Representative"
};

const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  ADVANCE: "Advance",
  FINAL: "Final"
};

const PAYMENT_STATUS_LABELS: Record<PaymentVerificationStatus, string> = {
  PENDING: "Pending Approval",
  VERIFIED: "Approved",
  REJECTED: "Declined"
};

export function leadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABELS[status];
}

export function userRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role];
}

export function paymentKindLabel(kind: PaymentKind): string {
  return PAYMENT_KIND_LABELS[kind];
}

export function paymentVerificationLabel(status: PaymentVerificationStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}
