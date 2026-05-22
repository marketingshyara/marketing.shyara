import { LeadStatus, PaymentKind, PaymentVerificationStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  healLeadToCommissionPaidIfNeeded,
  promoteLeadToDeployedIfEligible
} from "../src/services/commissionPayout.js";

describe("promoteLeadToDeployedIfEligible", () => {
  it("no-ops without deploymentVerifiedAt", async () => {
    const tx = {
      lead: { findUnique: vi.fn(), updateMany: vi.fn() }
    };
    await promoteLeadToDeployedIfEligible(tx as never, "lead-1", {
      deploymentVerifiedAt: null
    });
    expect(tx.lead.findUnique).not.toHaveBeenCalled();
  });

  it("promotes FINAL_PAID to DEPLOYED when due payment is verified", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = {
      lead: {
        findUnique: vi.fn().mockResolvedValue({
          id: "lead-1",
          status: LeadStatus.FINAL_PAID,
          payments: [
            {
              kind: PaymentKind.FINAL,
              verificationStatus: PaymentVerificationStatus.VERIFIED
            }
          ]
        }),
        updateMany
      }
    };
    await promoteLeadToDeployedIfEligible(tx as never, "lead-1", {
      deploymentVerifiedAt: new Date()
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "lead-1", status: LeadStatus.FINAL_PAID },
      data: { status: LeadStatus.DEPLOYED }
    });
  });

  it("does not promote when status is not FINAL_PAID", async () => {
    const updateMany = vi.fn();
    const tx = {
      lead: {
        findUnique: vi.fn().mockResolvedValue({
          id: "lead-1",
          status: LeadStatus.DEPLOYED,
          payments: [
            {
              kind: PaymentKind.FINAL,
              verificationStatus: PaymentVerificationStatus.VERIFIED
            }
          ]
        }),
        updateMany
      }
    };
    await promoteLeadToDeployedIfEligible(tx as never, "lead-1", {
      deploymentVerifiedAt: new Date()
    });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("heals lead to COMMISSION_PAID when commission is already paid", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = {
      lead: {
        findUnique: vi.fn().mockResolvedValue({
          id: "lead-1",
          status: LeadStatus.DEPLOYED,
          commission: { isPaid: true }
        }),
        updateMany
      }
    };
    const healed = await healLeadToCommissionPaidIfNeeded(tx as never, "lead-1");
    expect(healed).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "lead-1",
        status: { not: LeadStatus.COMMISSION_PAID },
        commission: { is: { isPaid: true } }
      },
      data: { status: LeadStatus.COMMISSION_PAID }
    });
  });

  it("does not promote without verified final payment", async () => {
    const updateMany = vi.fn();
    const tx = {
      lead: {
        findUnique: vi.fn().mockResolvedValue({
          id: "lead-1",
          status: LeadStatus.FINAL_PAID,
          payments: []
        }),
        updateMany
      }
    };
    await promoteLeadToDeployedIfEligible(tx as never, "lead-1", {
      deploymentVerifiedAt: new Date()
    });
    expect(updateMany).not.toHaveBeenCalled();
  });
});
