import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, it, vi, beforeEach, expect } from "vitest";
import ContactPage from "@/pages/ContactPage";
import { contactWhatsAppMessages } from "@/lib/whatsapp";

describe("ContactPage", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("renders contact channels and FAQ", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByTestId("contact-headline")).toHaveTextContent(/your business/i);
    expect(screen.getByTestId("contact-channel-whatsapp")).toBeInTheDocument();
    expect(screen.getByTestId("contact-email-link")).toHaveAttribute(
      "href",
      "mailto:sales@shyara.co.in"
    );
    expect(screen.queryByTestId("contact-channel-phone")).not.toBeInTheDocument();
    expect(screen.getByText(/What should our website include/i)).toBeInTheDocument();
    expect(screen.getByText(/How much does a website cost/i)).toBeInTheDocument();
  });

  it("opens WhatsApp with the contact page message", async () => {
    const user = userEvent.setup();

    render(
      <HelmetProvider>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </HelmetProvider>
    );

    await user.click(screen.getByTestId("contact-whatsapp-btn"));

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(contactWhatsAppMessages.main)),
      "_blank",
      "noopener,noreferrer"
    );
  });
});
