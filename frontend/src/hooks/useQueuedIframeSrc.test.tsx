import { describe, it, expect, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useQueuedIframeSrc } from "./useQueuedIframeSrc";
import { __resetIframePreviewSlotForTests } from "@/lib/iframePreviewSlot";

function Harness({ url, should }: { url: string | null; should: boolean }) {
  const { src, onIframeLoad } = useQueuedIframeSrc(url, should);
  return (
    <div>
      <span data-testid="src">{src ?? ""}</span>
      {src ? (
        <iframe data-testid="ifr" src={src} title="t" onLoad={onIframeLoad} />
      ) : null}
    </div>
  );
}

describe("useQueuedIframeSrc", () => {
  afterEach(() => {
    __resetIframePreviewSlotForTests();
  });

  it("sets src after shouldLoad becomes true", async () => {
    const { rerender } = render(<Harness url="https://example.com/a" should={false} />);
    expect(screen.getByTestId("src")).toHaveTextContent("");

    rerender(<Harness url="https://example.com/a" should={true} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("src")).toHaveTextContent("https://example.com/a");
  });

  it("releases slot on iframe load", async () => {
    const { rerender } = render(<Harness url="https://example.com/b" should={true} />);
    await act(async () => {
      await Promise.resolve();
    });

    const iframe = screen.getByTestId("ifr") as HTMLIFrameElement;
    act(() => {
      iframe.dispatchEvent(new Event("load"));
    });

    rerender(<Harness url="https://example.com/b" should={false} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("src")).toHaveTextContent("");
  });
});
