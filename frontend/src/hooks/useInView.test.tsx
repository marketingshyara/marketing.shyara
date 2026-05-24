import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useRef } from "react";
import { useInView } from "./useInView";

function TestHost() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} data-testid="box">
      {inView ? "visible" : "hidden"}
    </div>
  );
}

describe("useInView", () => {
  let callback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    callback = null;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        root: Element | null = null;
        rootMargin = "";
        thresholds: ReadonlyArray<number> = [];
        constructor(cb: IntersectionObserverCallback) {
          callback = cb;
        }
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        takeRecords = () => [] as IntersectionObserverEntry[];
      } as unknown as typeof IntersectionObserver
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts false then true when intersecting", () => {
    render(<TestHost />);
    expect(screen.getByTestId("box")).toHaveTextContent("hidden");

    act(() => {
      callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByTestId("box")).toHaveTextContent("visible");
  });

  it("returns false when observer reports not intersecting", () => {
    render(<TestHost />);

    act(() => {
      callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    act(() => {
      callback?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(screen.getByTestId("box")).toHaveTextContent("hidden");
  });

  it("stays false when enabled is false", () => {
    function DisabledHost() {
      const ref = useRef<HTMLDivElement>(null);
      const inView = useInView(ref, { enabled: false });
      return <div ref={ref}>{inView ? "visible" : "hidden"}</div>;
    }
    render(<DisabledHost />);
    act(() => {
      callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(screen.getByText("hidden")).toBeInTheDocument();
  });
});
