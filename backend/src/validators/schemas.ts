import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  ProspectCategory,
  UserRole
} from "@prisma/client";
import { z } from "zod";
import {
  defaultPaymentShareMethods,
  mergePaymentShareMethods,
  paymentShareMethodConfigSchema,
  paymentShareMethodKeySchema,
  type PaymentShareMethodConfig
} from "../data/paymentShareMethods.js";
import { optionalHttpUrlSchema, requiredHttpUrlSchema } from "../lib/httpUrl.js";
import { githubRepoUrlSchema } from "../lib/githubRepoUrl.js";
import { resolveScraperRadiusKm } from "../services/leadScraper/types.js";
import {
  indianMobilePhoneSchema,
  optionalIndianMobilePhoneSchema
} from "../lib/indianMobilePhone.js";

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberDevice: z.boolean().optional()
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).max(128)
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const usersListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["active", "past"]).optional().default("active")
});

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

export const createUserBodySchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase().trim()),
  password: z.preprocess(
    emptyToUndefined,
    z.string().min(8).max(128).optional()
  ),
  displayName: z.preprocess(
    emptyToUndefined,
    z.string().min(1).max(120).optional()
  ),
  role: z.nativeEnum(UserRole),
  mustChangePassword: z.boolean().optional()
});

export const patchUserBodySchema = z.object({
  isActive: z.boolean().optional(),
  role: z.nativeEnum(UserRole).optional(),
  displayName: z.union([z.string().min(1).max(120), z.null()]).optional()
});

export const resetPasswordBodySchema = z.object({
  temporaryPassword: z
    .string()
    .optional()
    .refine((s) => s === undefined || s.length === 0 || (s.length >= 8 && s.length <= 128), {
      message: "Temporary password must be 8–128 characters or empty to generate."
    })
});

export const pipelineStageKeySchema = z.enum([
  "whatsapp",
  "preview_ready",
  "demo_finalized",
  "accounts_ready",
  "repo_transfer",
  "deployment",
  "client_details"
]);

export const leadsListQuerySchema = paginationQuerySchema
  .extend({
    /** `leads` = unconverted prospects; `not_interested` = NOT_INTERESTED alias; `clients` / `completed` = converted */
    view: z.enum(["leads", "not_interested", "clients", "completed"]).optional(),
    /** Filter prospects by disposition when `view` is `leads` or `not_interested`. */
    prospectCategory: z.nativeEnum(ProspectCategory).optional(),
    /** Admin-only: filter pipeline by assigned sales rep. */
    assignedToUserId: z.string().cuid().optional(),
    /** Ignored when `view` is `clients` or `completed` (view applies status filters). */
    status: z.nativeEnum(LeadStatus).optional(),
    /**
     * Server-side minimum length defends the functional `lower(...)` indexes from degenerate
     * 1-char ILIKE queries that would scan the whole table.
     */
    search: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().min(2).max(200).optional()
    ),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "Query parameter 'from' must be on or before 'to'."
  })
  .refine(
    (q) => !q.status || !q.view || q.view === "leads",
    { message: "Use view=clients or view=completed instead of status for converted lists." }
  )
  .refine((q) => q.view !== "not_interested" || !q.status, {
    message: "status filter is not supported with view=not_interested."
  })
  .refine(
    (q) =>
      !q.prospectCategory ||
      !q.view ||
      q.view === "leads" ||
      q.view === "not_interested",
    { message: "prospectCategory is only supported with view=leads or view=not_interested." }
  );

export const setProspectCategoryBodySchema = z
  .object({
    category: z.nativeEnum(ProspectCategory),
    note: z.string().trim().max(500).optional().nullable(),
    callbackAt: z.coerce.date().optional(),
    sampleShared: z.boolean().optional()
  })
  .superRefine((body, ctx) => {
    if (body.category === ProspectCategory.INTERESTED && body.sampleShared === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Website sample shared status is required.",
        path: ["sampleShared"]
      });
    }
  });

export type SetProspectCategoryBody = z.infer<typeof setProspectCategoryBodySchema>;

export const prospectCategoryEventsQuerySchema = paginationQuerySchema;

/** @deprecated Use setProspectCategoryBodySchema with category NOT_INTERESTED */
export const markNotInterestedBodySchema = z.object({
  note: z.string().trim().max(500).optional().nullable()
});

export const teamRepLeadsQuerySchema = paginationQuerySchema
  .extend({
    search: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().min(2).max(200).optional()
    ),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "Query parameter 'from' must be on or before 'to'."
  });

/** Omit key = no change; null/"" = clear; string = validate (must not map missing keys to null). */
const optionalLeadEmail = z.preprocess(
  (v) => {
    if (v === undefined) return undefined;
    if (v === "" || v === null) return null;
    return v;
  },
  z.union([z.string().email(), z.null()]).optional()
);

/** GitHub username (https://docs.github.com/en/get-started/getting-started-with-github/keyboard-shortcuts) */
export const githubUsernameSchema = z
  .string()
  .trim()
  .min(1, "Enter the client's GitHub username.")
  .max(39, "GitHub username is too long.")
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
    "Enter a valid GitHub username (letters, numbers, hyphens)."
  );

export const createLeadBodySchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: optionalLeadEmail,
  clientPhone: indianMobilePhoneSchema,
  notes: z.string().max(8000).optional().nullable(),
  agreedTotalCents: z.number().int().min(0).optional().nullable(),
  advanceAmountCents: z.number().int().min(0).optional().nullable(),
  finalQuoteCents: z.number().int().min(0).optional().nullable(),
  websiteTemplateId: z.string().min(1).max(64).optional().nullable(),
  assignedToUserId: z.string().min(1).optional().nullable()
});

export const patchLeadBodySchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  clientEmail: optionalLeadEmail,
  clientPhone: optionalIndianMobilePhoneSchema,
  notes: z.string().max(8000).optional().nullable(),
  agreedTotalCents: z.number().int().min(0).optional().nullable(),
  advanceAmountCents: z.number().int().min(0).optional().nullable(),
  finalQuoteCents: z.number().int().min(0).optional().nullable(),
  websiteTemplateId: z.string().min(1).max(64).optional().nullable(),
  whatsappGroupLink: optionalHttpUrlSchema,
  markDemoFinalized: z.boolean().optional(),
  markAccountsReady: z.boolean().optional(),
  clientGithubId: githubUsernameSchema.optional(),
  clientGithubEmail: z.string().trim().email().max(320).optional(),
  assignedToUserId: z.string().min(1).optional().nullable(),
  /** Admin: set project preview URL on linked project */
  previewUrl: optionalHttpUrlSchema
});

export const convertLeadBodySchema = z.object({
  websiteTemplateId: z.string().min(1).max(64),
  agreedTotalCents: z.number().int().positive(),
  /** Payment share method key (stored on LeadPayment.repNote). */
  repNote: paymentShareMethodKeySchema
});

export const rejectStageBodySchema = z.object({
  adminNote: z.string().max(2000).optional().nullable()
});

export const verifyRepoTransferBodySchema = z.object({
  transferredGithubRepoUrl: githubRepoUrlSchema
});

export const transitionBodySchema = z.object({
  toStatus: z.nativeEnum(LeadStatus)
});

export const markPaymentBodySchema = z.object({
  kind: z.nativeEnum(PaymentKind),
  amountCents: z.number().int().positive(),
  /** Payment share method key (stored on LeadPayment.repNote). */
  repNote: paymentShareMethodKeySchema
});

export const verifyPaymentBodySchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("VERIFIED"),
    /** Provider payment id (e.g. Razorpay); required when verifying. */
    externalReference: z.string().trim().min(1).max(256),
    adminNote: z.string().max(2000).optional().nullable()
  }),
  z.object({
    decision: z.literal("REJECTED"),
    adminNote: z.string().max(2000).optional().nullable()
  })
]);

export const pendingPaymentsQuerySchema = paginationQuerySchema
  .extend({
    kind: z.nativeEnum(PaymentKind).optional(),
    assignedToUserId: z.string().cuid().optional(),
    search: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().min(2).max(200).optional()
    ),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "Query parameter 'from' must be on or before 'to'."
  });

export const commissionsListQuerySchema = paginationQuerySchema.extend({
  isPaid: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true"))
});

export const activityLogsQuerySchema = paginationQuerySchema
  .extend({
    userId: z.string().min(1).optional(),
    entityType: z.string().min(1).max(64).optional(),
    entityId: z.string().min(1).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "Query parameter 'from' must be on or before 'to'."
  });

export const patchProjectBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
  previewUrl: optionalHttpUrlSchema,
  deployedUrl: optionalHttpUrlSchema,
  markDeploymentSubmitted: z.boolean().optional()
});

/** Rep-only: submit live URL for admin deployment verification. */
export const repSubmitDeploymentBodySchema = z.object({
  deployedUrl: requiredHttpUrlSchema,
  markDeploymentSubmitted: z.literal(true)
});

export const createProjectBodySchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1).max(200),
  metadata: z.record(z.unknown()).optional().nullable()
});

const defaultManualTransitions = [
  { from: LeadStatus.ADVANCE_PAID, to: LeadStatus.BUILDING, adminOnly: false, enabled: true },
  { from: LeadStatus.BUILDING, to: LeadStatus.PREVIEW_SENT, adminOnly: true, enabled: true },
  { from: LeadStatus.FINAL_PAID, to: LeadStatus.DEPLOYED, adminOnly: true, enabled: true }
] as const;

export const manualTransitionSchema = z.object({
  from: z.nativeEnum(LeadStatus),
  to: z.nativeEnum(LeadStatus),
  adminOnly: z.boolean(),
  enabled: z.boolean()
});

export const repTutorialLinkSchema = z.object({
  title: z.string().min(1).max(120),
  url: z.string().url().max(2000)
});

export const repPainPointSchema = z.object({
  categoryId: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  bullets: z.array(z.string().min(1).max(500)).min(1).max(20)
});

export const portalSettingsSchema = z
  .object({
    commissionRateBps: z.number().int().min(0).max(10000).default(2000),
    commissionBasis: z
      .enum(["VERIFIED_FINAL_PAYMENT", "FINAL_QUOTE", "AGREED_TOTAL"])
      .default("AGREED_TOTAL"),
    manualTransitions: z.array(manualTransitionSchema).default([...defaultManualTransitions]),
    advancePaymentRequiredLeadStatus: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
    finalPaymentRequiredLeadStatus: z.nativeEnum(LeadStatus).default(LeadStatus.PREVIEW_SENT),
    advanceVerifyRequiredLeadStatus: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
    finalVerifyRequiredLeadStatus: z.nativeEnum(LeadStatus).default(LeadStatus.PREVIEW_SENT),
    terminalNoMutationStatuses: z
      .array(z.nativeEnum(LeadStatus))
      .default([LeadStatus.COMMISSION_PAID]),
    enforcePaymentQuoteToleranceBps: z.number().int().min(0).max(10000).nullable().default(null),
    exportMaxRows: z.number().int().min(100).max(500000).default(50_000),
    commissionRounding: z.enum(["floor", "round", "bankers"]).default("bankers"),
    advancePaymentShareBps: z.number().int().min(0).max(10000).default(5000),
    minAgreedTotalCents: z.number().int().min(0).default(799_900),
    performanceBonusBps: z.number().int().min(0).max(10000).default(500),
    performanceBonusAfterCompletedSales: z.number().int().min(0).default(10),
    templatesCatalogUrl: z.string().url().max(2000).default("https://marketing.shyara.co.in/samples/websites"),
    tutorialLinks: z.array(repTutorialLinkSchema).default([]),
    painPointsByCategory: z.array(repPainPointSchema).default([]),
    paymentShareMethods: z
      .preprocess(
        (v) =>
          mergePaymentShareMethods(
            Array.isArray(v) ? (v as PaymentShareMethodConfig[]) : undefined
          ),
        z.array(paymentShareMethodConfigSchema).length(5)
      )
      .default(defaultPaymentShareMethods())
  })
  .strict();

export { paymentShareMethodKeySchema, paymentShareMethodConfigSchema };
export type { PaymentShareMethodConfig } from "../data/paymentShareMethods.js";

export type PortalSettingsValues = z.infer<typeof portalSettingsSchema>;

/** Keys accepted from stored JSON; unknown keys are ignored so `.strict()` never sees them. */
const PORTAL_SETTINGS_INPUT_KEYS = [
  "commissionRateBps",
  "commissionBasis",
  "manualTransitions",
  "advancePaymentRequiredLeadStatus",
  "finalPaymentRequiredLeadStatus",
  "advanceVerifyRequiredLeadStatus",
  "finalVerifyRequiredLeadStatus",
  "terminalNoMutationStatuses",
  "enforcePaymentQuoteToleranceBps",
  "exportMaxRows",
  "commissionRounding",
  "advancePaymentShareBps",
  "minAgreedTotalCents",
  "performanceBonusBps",
  "performanceBonusAfterCompletedSales",
  "templatesCatalogUrl",
  "tutorialLinks",
  "painPointsByCategory",
  "paymentShareMethods"
] as const satisfies readonly (keyof PortalSettingsValues)[];

function pickKnownPortalSettings(
  raw: Record<string, unknown>
): Partial<Record<keyof PortalSettingsValues, unknown>> {
  const out: Partial<Record<keyof PortalSettingsValues, unknown>> = {};
  for (const k of PORTAL_SETTINGS_INPUT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, k)) {
      out[k] = raw[k];
    }
  }
  return out;
}

export function parsePortalSettings(raw: unknown): PortalSettingsValues {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return portalSettingsSchema.parse(pickKnownPortalSettings(base));
}

/** Strip unknown keys from admin PATCH body before `.strict()` partial parse. */
export function pickPortalSettingsPatchInput(
  raw: unknown
): Partial<Record<keyof PortalSettingsValues, unknown>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return pickKnownPortalSettings(raw as Record<string, unknown>);
}

export const patchPortalSettingsSchema = portalSettingsSchema.partial();

export const patchCommissionBodySchema = z.object({
  amountCents: z.number().int().min(0)
});

export const leadScraperPlacesExportQuerySchema = z.object({
  noWebsiteOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true")
});

export const leadScraperSearchBodySchema = z.object({
  location: z.string().min(1).max(500),
  keyword: z.string().max(200).optional().nullable(),
  radiusKm: z
    .number()
    .int()
    .optional()
    .transform((v) => resolveScraperRadiusKm(v))
});

export const leadScraperPlacesQuerySchema = z.object({
  noWebsiteOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const leadScraperCacheStatusQuerySchema = z.object({
  location: z.string().min(1).max(500),
  keyword: z.string().max(200).optional().nullable(),
  radiusKm: z.coerce.number().int().optional()
});

export const leadScraperImportBodySchema = z.object({
  placeIds: z.array(z.string().min(1).max(256)).min(1).max(100)
});

export const patchScraperQuotaBodySchema = z.object({
  amount: z.number().int().min(1).max(500)
});
