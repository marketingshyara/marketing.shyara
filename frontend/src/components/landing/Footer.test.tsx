import { Footer } from "@/components/landing/Footer";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

test("shows quick links and sales portal in the footer", () => {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

  expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
  expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  expect(screen.getByRole("link", { name: "Sales portal" })).toHaveAttribute("href", "/portal/login");
  expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
});
