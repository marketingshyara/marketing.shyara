import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentMethodField, PaymentMethodSharePanel } from "./PaymentMethodField";
import type { PaymentShareMethodConfig } from "../../types";

const methods: PaymentShareMethodConfig[] = [
  {
    key: "upi_id",
    shareValue: "pay@shyara",
    qrImageUrl: null,
    instructions: "Share on WhatsApp"
  },
  {
    key: "razorpay_payment_link",
    shareValue: "https://rzp.io/test",
    qrImageUrl: null,
    instructions: null
  }
];

describe("PaymentMethodSharePanel", () => {
  it("shows UPI copy row when configured", () => {
    render(<PaymentMethodSharePanel config={methods[0]} />);
    expect(screen.getByText("pay@shyara")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Copy/i })).toBeInTheDocument();
  });

  it("shows payment link with open and copy actions", () => {
    render(<PaymentMethodSharePanel config={methods[1]} />);
    expect(screen.getByRole("link", { name: /rzp\.io\/test/i })).toHaveAttribute(
      "href",
      "https://rzp.io/test"
    );
    expect(screen.getByRole("button", { name: "Copy Payment link" })).toBeInTheDocument();
  });

  it("warns when method is not configured", () => {
    render(
      <PaymentMethodSharePanel
        config={{ key: "sbi_qr", shareValue: "", qrImageUrl: null, instructions: null }}
      />
    );
    expect(screen.getByText(/Ask admin to configure/i)).toBeInTheDocument();
  });
});

describe("PaymentMethodField", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  it("shows share panel when value is set", () => {
    const onChange = vi.fn();
    render(
      <PaymentMethodField value="upi_id" onChange={onChange} methods={methods} id="pm-test" />
    );

    expect(screen.getByText("pay@shyara")).toBeInTheDocument();
    expect(screen.getByText(/Share on WhatsApp/i)).toBeInTheDocument();
  });
});
