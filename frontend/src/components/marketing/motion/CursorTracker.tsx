import { useEffect, useRef, useCallback, useState } from "react";
import { shouldUseCustomCursor } from "./shouldUseCustomCursor";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, label, [data-cursor-hover]';

type Rgb = { r: number; g: number; b: number; a: number };

function parseColor(str: string): Rgb | null {
  if (!str || str === "transparent" || str === "rgba(0, 0, 0, 0)") return null;
  const m = str.match(
    /rgba?\(\s*(\d+)(?:\s*,|\s+)\s*(\d+)(?:\s*,|\s+)\s*(\d+)(?:(?:\s*,|\s*\/\s*)\s*([\d.]+))?\s*\)/
  );
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

function getLuminance({ r, g, b }: Rgb): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getEffectiveBg(el: Element): Rgb {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const c = parseColor(getComputedStyle(node).backgroundColor);
    if (c && c.a > 0.15) return c;
    node = node.parentElement;
  }
  return { r: 250, g: 250, b: 250, a: 1 };
}

/**
 * Neo-brutalist cursor follower for the marketing site only.
 * Renders nothing on touch-first devices, reduced-motion, or non-mouse pointers.
 */
export function CursorTracker() {
  const [enabled] = useState(() => shouldUseCustomCursor());
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);
  const isVisible = useRef(false);
  const isHovering = useRef(false);
  const usingMouse = useRef(false);

  const hideCursor = useCallback(() => {
    if (dotRef.current) dotRef.current.style.opacity = "0";
    if (ringRef.current) ringRef.current.style.opacity = "0";
    isVisible.current = false;
  }, []);

  const showCursor = useCallback(() => {
    if (dotRef.current) dotRef.current.style.opacity = "1";
    if (ringRef.current) ringRef.current.style.opacity = "1";
    isVisible.current = true;
  }, []);

  const resetHoverStyles = useCallback(() => {
    isHovering.current = false;
    if (dotRef.current) {
      dotRef.current.classList.remove("cursor-hover");
      dotRef.current.style.background = "#FF3333";
      dotRef.current.style.mixBlendMode = "difference";
    }
    if (ringRef.current) {
      ringRef.current.classList.remove("cursor-hover");
      ringRef.current.style.borderColor = "#0A0A0A";
      ringRef.current.style.backgroundColor = "transparent";
      ringRef.current.style.boxShadow = "none";
    }
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        usingMouse.current = false;
        hideCursor();
        resetHoverStyles();
        return;
      }

      usingMouse.current = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!isVisible.current) showCursor();
    },
    [hideCursor, resetHoverStyles, showCursor]
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        usingMouse.current = false;
        hideCursor();
        resetHoverStyles();
      }
    },
    [hideCursor, resetHoverStyles]
  );

  const onMouseLeave = useCallback(() => {
    hideCursor();
    resetHoverStyles();
  }, [hideCursor, resetHoverStyles]);

  const onMouseOver = useCallback((e: MouseEvent) => {
    if (!usingMouse.current) return;

    const target = e.target;
    if (!(target instanceof Element)) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (interactive && !isHovering.current) {
      isHovering.current = true;
      dotRef.current?.classList.add("cursor-hover");
      ringRef.current?.classList.add("cursor-hover");

      requestAnimationFrame(() => {
        const bg = getEffectiveBg(target);
        const lum = getLuminance(bg);
        const isDark = lum < 0.4;
        const isRed = bg.r > 180 && bg.g < 100 && bg.b < 100;

        if (dotRef.current) {
          dotRef.current.style.background = isRed || isDark ? "#FFFFFF" : "#0A0A0A";
          dotRef.current.style.mixBlendMode = "normal";
        }
        if (ringRef.current) {
          ringRef.current.style.borderColor = isRed ? "#0A0A0A" : isDark ? "#FFFFFF" : "#FF3333";
          ringRef.current.style.backgroundColor = isRed
            ? "rgba(10,10,10,0.10)"
            : isDark
              ? "rgba(255,255,255,0.10)"
              : "rgba(255,51,51,0.08)";
          ringRef.current.style.boxShadow = isRed
            ? "3px 3px 0px 0px #0a0a0a"
            : isDark
              ? "3px 3px 0px 0px rgba(255,255,255,0.25)"
              : "3px 3px 0px 0px #0a0a0a";
        }
      });
    } else if (!interactive && isHovering.current) {
      resetHoverStyles();
    }
  }, [resetHoverStyles]);

  const tick = useCallback(() => {
    if (!usingMouse.current) {
      rafId.current = requestAnimationFrame(tick);
      return;
    }

    const DOT_SPEED = 0.35;
    const RING_SPEED = 0.15;

    dotPos.current.x += (mouse.current.x - dotPos.current.x) * DOT_SPEED;
    dotPos.current.y += (mouse.current.y - dotPos.current.y) * DOT_SPEED;
    ringPos.current.x += (mouse.current.x - ringPos.current.x) * RING_SPEED;
    ringPos.current.y += (mouse.current.y - ringPos.current.y) * RING_SPEED;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
    }

    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = document.querySelector<HTMLElement>(".marketing-site");
    root?.classList.add("marketing-custom-cursor");

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseover", onMouseOver);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      root?.classList.remove("marketing-custom-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onMouseOver);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, onPointerMove, onPointerDown, onMouseLeave, onMouseOver, tick]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          background: "#FF3333",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: 0,
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          border: "2px solid #0A0A0A",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: 0,
          willChange: "transform",
        }}
      />
    </>
  );
}
