import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalStatusChip, badgeVariantToStatusKind } from "./PortalStatusChip";

describe("PortalStatusChip", () => {
  it("renders action label", () => {
    render(<PortalStatusChip kind="action" label="Your turn" />);
    expect(screen.getByRole("status")).toHaveTextContent("Your turn");
  });

  it("maps badge variants to status kinds", () => {
    expect(badgeVariantToStatusKind("destructive", "Needs approval")).toBe("action");
    expect(badgeVariantToStatusKind("secondary", "Waiting on admin")).toBe("waiting");
    expect(badgeVariantToStatusKind("outline", "Complete")).toBe("complete");
  });
});
