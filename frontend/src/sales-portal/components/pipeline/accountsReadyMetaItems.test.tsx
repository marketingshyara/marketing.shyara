import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  accountsReadyMetaItems,
  accountsReadyMissingGithubHint
} from "./accountsReadyMetaItems";
import type { Lead } from "../../types";

const baseLead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-1",
  clientName: "Acme",
  clientEmail: null,
  clientPhone: null,
  notes: null,
  status: "BUILDING",
  advanceAmountCents: null,
  finalQuoteCents: null,
  agreedTotalCents: null,
  websiteTemplateId: null,
  contentReceivedAt: null,
  convertedAt: "2026-01-01T00:00:00.000Z",
  whatsappGroupLink: null,
  whatsappVerifiedAt: null,
  demoFinalizedAt: null,
  demoFinalizedVerifiedAt: null,
  accountsReadyAt: null,
  accountsReadyVerifiedAt: null,
  clientGithubId: null,
  clientGithubEmail: null,
  repoTransferVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

describe("accountsReadyMetaItems", () => {
  it("shows only rep marked before submission", () => {
    const items = accountsReadyMetaItems(baseLead);
    expect(items).toHaveLength(1);
    expect(items[0]?.label).toBe("Rep marked");
  });

  it("includes github rows after rep submission", () => {
    render(
      <>
        {accountsReadyMetaItems({
          ...baseLead,
          accountsReadyAt: "2026-01-02T00:00:00.000Z",
          clientGithubId: "acme-corp",
          clientGithubEmail: "client@example.com"
        }).map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <div>{item.value}</div>
          </div>
        ))}
      </>
    );
    expect(screen.getByText("GitHub username")).toBeInTheDocument();
    expect(screen.getByText("acme-corp")).toBeInTheDocument();
    expect(screen.getByText("client@example.com")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("detects missing github on submitted lead", () => {
    expect(
      accountsReadyMissingGithubHint({
        ...baseLead,
        accountsReadyAt: "2026-01-02T00:00:00.000Z"
      })
    ).toBe(true);
  });
});
