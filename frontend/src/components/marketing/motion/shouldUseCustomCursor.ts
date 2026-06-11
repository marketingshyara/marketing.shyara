/** True when a mouse or trackpad is the primary input (not touch-first phones/tablets). */
export function shouldUseCustomCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  if (!window.matchMedia("(hover: hover)").matches) return false;
  return true;
}
