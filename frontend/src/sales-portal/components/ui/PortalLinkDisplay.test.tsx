import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortalLinkDisplay } from "./PortalLinkDisplay";
import { copyToClipboard } from "../../lib/copyToClipboard";

vi.mock("../../lib/copyToClipboard", () => ({
  copyToClipboard: vi.fn()
}));

describe("PortalLinkDisplay", () => {
  it("renders empty label when url is missing", () => {
    render(<PortalLinkDisplay url={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders clickable link that opens in a new tab", () => {
    render(
      <PortalLinkDisplay
        url="https://chat.whatsapp.com/abc"
        copyLabel="Group link"
      />
    );
    const link = screen.getByRole("link", { name: /chat\.whatsapp\.com\/abc/i });
    expect(link).toHaveAttribute("href", "https://chat.whatsapp.com/abc");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("copies raw url without opening when copy is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PortalLinkDisplay
        url="https://demo.test/preview"
        copyLabel="Preview URL"
      />
    );
    await user.click(screen.getByRole("button", { name: "Copy Preview URL" }));
    expect(copyToClipboard).toHaveBeenCalledWith("https://demo.test/preview", "Preview URL");
  });

  it("normalizes urls missing a scheme for the href", () => {
    render(<PortalLinkDisplay url="example.com/demo" copyLabel="Demo link" />);
    const link = screen.getByRole("link", { name: /example\.com\/demo/i });
    expect(link).toHaveAttribute("href", "https://example.com/demo");
  });
});
