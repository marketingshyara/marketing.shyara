import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useRef } from "react";
import { useInViewOnce } from "./useInViewOnce";

function TestHost() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(ref);
  return (
    <div ref={ref} data-testid="box">
      {inView ? "visible" : "hidden"}
    </div>
  );
}

describe("useInViewOnce", () => {
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

  it("starts false then becomes true when observer reports intersecting", () => {
    render(<TestHost />);
    expect(screen.getByTestId("box")).toHaveTextContent("hidden");
    expect(callback).toBeTruthy();

    act(() => {
      callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(screen.getByTestId("box")).toHaveTextContent("visible");
  });
});
