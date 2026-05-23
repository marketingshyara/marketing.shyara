import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortalCopyableText } from "./PortalCopyableText";
import { copyToClipboard } from "../../lib/copyToClipboard";

vi.mock("../../lib/copyToClipboard", () => ({
  copyToClipboard: vi.fn()
}));

describe("PortalCopyableText", () => {
  it("renders plain text without a link", () => {
    render(<PortalCopyableText value="acme-corp" copyLabel="GitHub username" />);
    expect(screen.getByText("acme-corp")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("copies value when copy is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PortalCopyableText value="client@example.com" copyLabel="GitHub account email" />
    );
    await user.click(screen.getByRole("button", { name: "Copy GitHub account email" }));
    expect(copyToClipboard).toHaveBeenCalledWith("client@example.com", "GitHub account email");
  });

  it("shows empty label when value is missing", () => {
    render(<PortalCopyableText value={null} copyLabel="GitHub username" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
