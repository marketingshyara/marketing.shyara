import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "SALES_REP"]);
export const leadStatusSchema = z.enum([
  "NEW",
  "ADVANCE_PAID",
  "BUILDING",
  "PREVIEW_SENT",
  "FINAL_PAID",
  "DEPLOYED",
  "COMMISSION_PAID"
]);
export const paymentKindSchema = z.enum(["ADVANCE", "FINAL"]);

export const loginSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(1),
  rememberDevice: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .optional()
    .refine((s) => !s || s.length === 0 || (s.length >= 8 && s.length <= 128), {
      message: "Password must be 8–128 characters or empty"
    }),
  displayName: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().min(1).max(120).optional()
  ),
  role: userRoleSchema,
  mustChangePassword: z.boolean().optional()
});

export const patchUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: userRoleSchema.optional(),
  displayName: z.union([z.string().min(1).max(120), z.literal(""), z.null()]).optional()
});

export const resetPasswordSchema = z.object({
  temporaryPassword: z.string().min(8).max(128)
});

export const createLeadSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.union([z.string().email(), z.literal("")]).optional(),
  clientPhone: z.string().max(40).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  agreedTotalCents: z.number().int().min(0).optional().nullable(),
  advanceAmountCents: z.number().int().min(0).optional().nullable(),
  finalQuoteCents: z.number().int().min(0).optional().nullable(),
  websiteTemplateId: z.string().min(1).max(64).optional().nullable(),
  assignedToUserId: z.string().min(1).optional().nullable()
});

export const patchLeadSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  clientEmail: z.union([z.string().email(), z.literal("")]).optional().nullable(),
  clientPhone: z.string().max(40).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  agreedTotalCents: z.number().int().min(0).optional().nullable(),
  advanceAmountCents: z.number().int().min(0).optional().nullable(),
  finalQuoteCents: z.number().int().min(0).optional().nullable(),
  websiteTemplateId: z.string().min(1).max(64).optional().nullable(),
  markContentReceived: z.boolean().optional(),
  assignedToUserId: z.string().min(1).optional().nullable()
});

export const transitionSchema = z.object({
  toStatus: leadStatusSchema
});

export const markPaymentSchema = z.object({
  kind: paymentKindSchema,
  amountCents: z.number().int().positive(),
  repNote: z.string().max(2000).optional().nullable()
});

export const verifyPaymentSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("VERIFIED"),
    externalReference: z.string().trim().min(1).max(256),
    adminNote: z.string().max(2000).optional().nullable()
  }),
  z.object({
    decision: z.literal("REJECTED"),
    adminNote: z.string().max(2000).optional().nullable()
  })
]);

export const manualTransitionSchema = z.object({
  from: leadStatusSchema,
  to: leadStatusSchema,
  adminOnly: z.boolean(),
  enabled: z.boolean()
});

export const portalSettingsSchema = z
  .object({
    commissionRateBps: z.number().int().min(0).max(10000),
    commissionBasis: z.enum(["VERIFIED_FINAL_PAYMENT", "FINAL_QUOTE", "AGREED_TOTAL"]),
    commissionRounding: z.enum(["floor", "round", "bankers"]),
    manualTransitions: z.array(manualTransitionSchema),
    advancePaymentRequiredLeadStatus: leadStatusSchema,
    finalPaymentRequiredLeadStatus: leadStatusSchema,
    advanceVerifyRequiredLeadStatus: leadStatusSchema,
    finalVerifyRequiredLeadStatus: leadStatusSchema,
    terminalNoMutationStatuses: z.array(leadStatusSchema),
    enforcePaymentQuoteToleranceBps: z.number().int().min(0).max(10000).nullable(),
    exportMaxRows: z.number().int().min(100).max(500000)
  })
  .strict();

export const patchCommissionSchema = z.object({
  amountCents: z.number().int().min(0)
});

export const createProjectSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1).max(200),
  metadata: z.record(z.unknown()).optional().nullable()
});

export const patchProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
  previewUrl: z.union([z.string().url().max(2000), z.null()]).optional(),
  deployedUrl: z.union([z.string().url().max(2000), z.null()]).optional(),
  markDeploymentSubmitted: z.boolean().optional()
});
