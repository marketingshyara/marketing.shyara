import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, it, vi, beforeEach } from "vitest";
import Home from "@/pages/Home";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    from: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
    })),
    matchMedia: vi.fn(() => ({ add: vi.fn(), revert: vi.fn() })),
    context: vi.fn((fn) => {
      fn();
      return { revert: vi.fn() };
    }),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    register: vi.fn(),
    config: vi.fn(),
    update: vi.fn(),
    refresh: vi.fn(),
    create: vi.fn(),
    batch: vi.fn(),
    getAll: vi.fn(() => []),
  },
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn((fn) => fn()),
}));

vi.mock("lenis", () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    raf: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock("lottie-react", () => ({
  default: () => null,
}));

describe("Home page", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
      }
    );
  });

  it("renders the hero headline", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/We create\s*websites\./i);
    expect(screen.getByRole("heading", { level: 2, name: /Four outcomes/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /SEO → AEO → GEO/i })).toBeInTheDocument();
  });
});
