import {
  leadStatusLabel,
  MODEL_B_MILESTONE_AMOUNT_CENTS_DEFAULT,
  MODEL_B_PER_DEAL_AFTER_CENTS_DEFAULT
} from "./copy";
import { stageShortTitle } from "./pipelineCopy";
import type {
  LeadStatus,
  MilestoneProgress,
  PipelineStageKey,
  PipelineStageView,
  PortalSettingsValues
} from "../types";

type PayoutAmounts = {
  milestoneAmountCents?: number;
  perDealAfterCents?: number;
};

export function isModelBRepSettings(
  settings: { commissionModel?: string } | null | undefined
): boolean {
  return settings?.commissionModel === "MODEL_B";
}

export function isModelBRepUser(
  user: { commissionModel?: string | null; role?: string } | null | undefined,
  settings: { commissionModel?: string } | null | undefined
): boolean {
  if (user?.role !== "SALES_REP") return false;
  return user.commissionModel === "MODEL_B" || isModelBRepSettings(settings);
}

export function repLeadStatusLabel(status: LeadStatus, isModelBRep: boolean): string {
  if (isModelBRep && status === "COMMISSION_PAID") return "Completed";
  return leadStatusLabel(status);
}

export function modelBRepPipelineStepLine(
  key: PipelineStageKey,
  title: string,
  isModelBRep: boolean
): string {
  if (!isModelBRep || key !== "commission") {
    return stageShortTitle(key, title);
  }
  if (title === "Commission paid" || /paid/i.test(title)) return "Completed";
  return title === "Commission" ? "Payout" : title;
}

export function isModelBFixedPayoutCents(
  amountCents: number,
  amounts: PayoutAmounts = {}
): boolean {
  const milestone =
    amounts.milestoneAmountCents ?? MODEL_B_MILESTONE_AMOUNT_CENTS_DEFAULT;
  const perDeal = amounts.perDealAfterCents ?? MODEL_B_PER_DEAL_AFTER_CENTS_DEFAULT;
  return amountCents === milestone || amountCents === perDeal;
}

/** Model B reps see payout amounts on pipeline only after 5 site-live deals and for fixed payouts. */
export function modelBRepShowsPipelinePayout(
  commission: { amountCents: number } | null | undefined,
  milestone: MilestoneProgress | null | undefined,
  settings: PayoutAmounts
): boolean {
  if (!commission) return false;
  if ((milestone?.deployedCount ?? 0) < (milestone?.milestoneTarget ?? 5)) return false;
  return isModelBFixedPayoutCents(commission.amountCents, settings);
}

export function modelBRepPipelineStages(stages: PipelineStageView[]): PipelineStageView[] {
  return stages.map((stage) => {
    if (stage.key !== "commission") return stage;
    const title =
      stage.state === "verified"
        ? "Completed"
        : stage.state === "pending_admin" || stage.state === "actionable"
          ? "Payout pending"
          : "Payout";
    const hint =
      stage.state === "verified" || stage.state === "locked"
        ? undefined
        : stage.hint
            ?.replace(/commission/gi, "payout")
            .replace(/Commission/g, "Payout")
            .replace(/\bPaid\b/g, "Completed");
    return { ...stage, title, hint };
  });
}

export function modelBRepPayoutStatusLabel(isPaid: boolean): string {
  return isPaid ? "Completed" : "Pending payout";
}

export function modelBRepPayoutPageTitle(): string {
  return "Payouts";
}

export function modelBRepPayoutFilterLabel(filter: "all" | "pending" | "paid"): string {
  if (filter === "paid") return "Completed";
  if (filter === "pending") return "Pending";
  return "All";
}

export function modelBRepPayoutAmountsFromSettings(
  settings: PortalSettingsValues | PayoutAmounts
): PayoutAmounts {
  return {
    milestoneAmountCents:
      "milestoneAmountCents" in settings
        ? settings.milestoneAmountCents
        : undefined,
    perDealAfterCents:
      "perDealAfterCents" in settings ? settings.perDealAfterCents : undefined
  };
}
