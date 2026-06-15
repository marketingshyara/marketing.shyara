import { z } from "zod";
import { optionalHttpUrlSchema } from "../lib/httpUrl";
import {
  paymentShareMethodConfigSchema,
  paymentShareMethodKeySchema
} from "../lib/paymentShareMethods";
import {
  indianMobilePhoneSchema,
  optionalIndianMobilePhoneSchema
} from "../lib/indianMobilePhone";

export const userRoleSchema = z.enum(["ADMIN", "SALES_REP"]);
export const commissionModelSchema = z.enum(["MODEL_A", "MODEL_B"]);
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

const passwordMatchRefine = {
  message: "Passwords do not match.",
  path: ["confirmPassword"] as const
};

export const forcedChangePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Confirm your new password.")
  })
  .refine((d) => d.newPassword === d.confirmPassword, passwordMatchRefine);

export const voluntaryChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Use at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Confirm your new password.")
  })
  .refine((d) => d.newPassword === d.confirmPassword, passwordMatchRefine);

/** @deprecated Use forcedChangePasswordSchema or voluntaryChangePasswordSchema */
export const changePasswordSchema = voluntaryChangePasswordSchema;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
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
    mustChangePassword: z.boolean().optional(),
    commissionModel: commissionModelSchema.optional()
  })
  .superRefine((data, ctx) => {
    if (data.role === "SALES_REP" && !data.commissionModel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a commission model for sales reps.",
        path: ["commissionModel"]
      });
    }
  });

export const patchUserSchema = z
  .object({
    isActive: z.boolean().optional(),
    role: userRoleSchema.optional(),
    displayName: z.union([z.string().min(1).max(120), z.literal(""), z.null()]).optional(),
    commissionModel: commissionModelSchema.optional()
  })
  .superRefine((data, ctx) => {
    if (data.role === "SALES_REP" && !data.commissionModel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a commission model for sales reps.",
        path: ["commissionModel"]
      });
    }
  });

export const resetPasswordSchema = z.object({
  temporaryPassword: z
    .string()
    .optional()
    .refine((s) => !s || s.length === 0 || (s.length >= 8 && s.length <= 128), {
      message: "Password must be 8–128 characters or empty to generate"
    })
});

export const createLeadSchema = z.object({
  clientName: z.string().min(1, "Client name is required.").max(200),
  clientEmail: z.union([z.string().email("Enter a valid email."), z.literal("")]).optional(),
  clientPhone: indianMobilePhoneSchema,
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
  clientPhone: optionalIndianMobilePhoneSchema,
  notes: z.string().max(8000).optional().nullable(),
  agreedTotalCents: z.number().int().min(0).optional().nullable(),
  advanceAmountCents: z.number().int().min(0).optional().nullable(),
  finalQuoteCents: z.number().int().min(0).optional().nullable(),
  websiteTemplateId: z.string().min(1).max(64).optional().nullable(),
  whatsappGroupLink: optionalHttpUrlSchema,
  markDemoFinalized: z.boolean().optional(),
  markAccountsReady: z.boolean().optional(),
  clientGithubId: z
    .string()
    .trim()
    .min(1)
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/)
    .optional(),
  clientGithubEmail: z.string().trim().email().max(320).optional(),
  assignedToUserId: z.string().min(1).optional().nullable(),
  previewUrl: optionalHttpUrlSchema
});

export const transitionSchema = z.object({
  toStatus: leadStatusSchema
});

export const markPaymentSchema = z.object({
  kind: paymentKindSchema,
  amountCents: z.number().int().positive(),
  repNote: paymentShareMethodKeySchema
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
    exportMaxRows: z.number().int().min(100).max(500000),
    advancePaymentShareBps: z.number().int().min(0).max(10000),
    minAgreedTotalCents: z.number().int().min(0),
    performanceBonusBps: z.number().int().min(0).max(10000),
    performanceBonusAfterCompletedSales: z.number().int().min(0),
    templatesCatalogUrl: z.string().url().max(2000),
    tutorialLinks: z.array(repTutorialLinkSchema),
    painPointsByCategory: z.array(repPainPointSchema),
    paymentShareMethods: z.array(paymentShareMethodConfigSchema)
  })
  .strict();

export const createProjectSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1).max(200),
  metadata: z.record(z.unknown()).optional().nullable()
});

export const patchProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  metadata: z.record(z.unknown()).optional().nullable(),
  previewUrl: optionalHttpUrlSchema,
  deployedUrl: optionalHttpUrlSchema,
  markDeploymentSubmitted: z.boolean().optional()
});
