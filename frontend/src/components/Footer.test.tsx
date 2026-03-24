import { Footer } from "@/components/Footer";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

test("shows a sales portal link in the footer", () => {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

  expect(screen.getByRole("link", { name: "Sales Portal" })).toHaveAttribute("href", "/sales-portal/login");
});
