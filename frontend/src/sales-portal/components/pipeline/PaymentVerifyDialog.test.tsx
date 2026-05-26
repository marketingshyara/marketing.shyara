import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { PaymentVerifyDialog } from "./PaymentVerifyDialog";

import type { LeadPayment } from "../../types";

import { PAYMENT_SHARE_METHOD_LABELS } from "../../lib/paymentShareMethods";



const lead = {

  clientName: "Acme",

  agreedTotalCents: 799_900,

  advanceAmountCents: 399_950,

  finalQuoteCents: 399_950,

  payments: [] as LeadPayment[]

};



const basePayment: LeadPayment = {

  id: "pay-1",

  leadId: "lead-1",

  kind: "FINAL",

  amountCents: 399_950,

  verificationStatus: "PENDING",

  externalReference: null,

  repNote: "upi_id",

  adminNote: null,

  markedByUserId: "rep-1",

  markedAt: "2026-01-01T00:00:00.000Z",

  verifiedByUserId: null,

  verifiedAt: null

};



describe("PaymentVerifyDialog", () => {

  it("shows full deal breakdown and payment method label", () => {

    render(

      <PaymentVerifyDialog

        payment={basePayment}

        open

        onOpenChange={vi.fn()}

        onVerify={vi.fn()}

        isPending={false}

        lead={lead}

        templateLabel="RES/001 — Demo"

      />

    );



    expect(screen.getByText("Agreed total")).toBeInTheDocument();

    expect(screen.getByText("Advance")).toBeInTheDocument();

    expect(screen.getByText("Due amount")).toBeInTheDocument();

    expect(screen.getByText("Submitted at")).toBeInTheDocument();

    expect(screen.getByText(PAYMENT_SHARE_METHOD_LABELS.upi_id)).toBeInTheDocument();

    expect(screen.getByText(/Due payment · ₹3,999.50/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Payment reference \(required to approve\)/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/Razorpay reference/i)).not.toBeInTheDocument();

  });

  it("shows template sample preview link when websiteTemplate is provided", () => {
    render(
      <PaymentVerifyDialog
        payment={basePayment}
        open
        onOpenChange={vi.fn()}
        onVerify={vi.fn()}
        isPending={false}
        lead={lead}
        templateLabel="RES/001 — Demo"
        websiteTemplate={{
          displayCode: "RES/001",
          name: "Restaurant Demo",
          sampleSlug: "restaurant-001"
        }}
      />
    );

    const preview = screen.getByRole("link", { name: /Open template sample/i });
    expect(preview).toHaveAttribute("href", expect.stringContaining("/samples/websites/restaurant-001/"));
  });



  it("shows legacy free-text rep note when key is unknown", () => {

    render(

      <PaymentVerifyDialog

        payment={{ ...basePayment, repNote: "Paid via cash at office" }}

        open

        onOpenChange={vi.fn()}

        onVerify={vi.fn()}

        isPending={false}

        lead={lead}

      />

    );



    expect(screen.getByText("Paid via cash at office")).toBeInTheDocument();

  });

  it("shows payment fallback rows while lead detail loads", () => {
    render(
      <PaymentVerifyDialog
        payment={basePayment}
        open
        onOpenChange={vi.fn()}
        onVerify={vi.fn()}
        isPending={false}
        lead={null}
        leadLoading
      />
    );

    expect(screen.getByText("Due amount")).toBeInTheDocument();
    expect(screen.getByText(/Loading deal breakdown/i)).toBeInTheDocument();
  });

});

