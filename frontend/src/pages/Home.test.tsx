import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, it, vi, beforeEach } from "vitest";
import Home from "@/pages/Home";

describe("Home page", () => {
  beforeEach(() => {
    sessionStorage.clear();

    Object.defineProperty(document, "fonts", {
      value: {
        load: vi.fn().mockResolvedValue([]),
        ready: Promise.resolve(),
      },
      configurable: true,
    });

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      }
    );

    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      }
    );
  });

  it("renders the Emergent hero headline", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByTestId("hero-headline")).toHaveTextContent(/We Build Websites/i);
    expect(screen.getByTestId("hero-headline")).toHaveTextContent(/Work/i);
    expect(screen.getByTestId("hero-badge")).toHaveTextContent(/Web Development Studio/i);
  });
});
