import { Footer } from "@/components/Footer";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

test("shows quick links in the footer", () => {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

  expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  expect(screen.getByRole("link", { name: "Sales portal" })).toHaveAttribute("href", "/portal/login");
});
