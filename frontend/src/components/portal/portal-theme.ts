export const portalInputClass = "portal-input";
export const portalSelectClass = "portal-select";
export const portalTextareaClass = "portal-textarea";
export const portalButtonPrimaryClass = "portal-button-primary";
export const portalButtonSecondaryClass = "portal-button-secondary";
export const portalButtonGhostClass = "portal-button-ghost";

const statusToneMap: Record<string, string> = {
  new: "portal-badge-info",
  contacted: "portal-badge-warning",
  under_follow_up: "portal-badge-warning",
  interested: "portal-badge-info",
  callback_later: "portal-badge-warning",
  payment_pending: "portal-badge-warning",
  closed_won: "portal-badge-success",
  lost: "portal-badge-danger",
  dormant: "portal-badge-muted",
  not_interested: "portal-badge-danger",
  active: "portal-badge-success",
  suspended: "portal-badge-warning",
  deactivated: "portal-badge-danger",
  pending: "portal-badge-warning",
  under_review: "portal-badge-warning",
  approved: "portal-badge-success",
  paid: "portal-badge-success",
  rejected: "portal-badge-danger",
  on_hold: "portal-badge-warning",
  project_started: "portal-badge-info",
  content_pending: "portal-badge-warning",
  in_progress: "portal-badge-info",
  preview_shared: "portal-badge-info",
  revision_pending: "portal-badge-warning",
  revision_in_progress: "portal-badge-info",
  final_delivery_done: "portal-badge-success",
  closed: "portal-badge-success",
  completed: "portal-badge-success",
  read: "portal-badge-success",
  open: "portal-badge-danger"
};

export function formatPortalLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function formatPortalCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Rs. -";
  }

  const numericValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numericValue)) {
    return `Rs. ${value}`;
  }

  return `Rs. ${new Intl.NumberFormat("en-IN").format(numericValue)}`;
}

export function formatPortalDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

export function formatPortalDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function getPortalStatusClass(status: string | null | undefined) {
  return statusToneMap[status ?? ""] ?? "portal-badge-muted";
}
