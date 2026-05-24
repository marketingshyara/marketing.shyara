/** Limits concurrent sample iframe navigations so the main thread stays responsive. */
let maxConcurrent = 3;

let active = 0;
const waiters: Array<() => void> = [];

/** Adjust concurrency (e.g. 1 on mobile dialog-only loads). */
export function setMaxConcurrentIframePreviews(n: number): void {
  maxConcurrent = Math.max(1, Math.floor(n));
  tryGrant();
}

function tryGrant() {
  while (active < maxConcurrent && waiters.length > 0) {
    const grant = waiters.shift()!;
    active += 1;
    grant();
  }
}

export function acquireIframePreviewSlot(): Promise<void> {
  return new Promise((resolve) => {
    waiters.push(resolve);
    tryGrant();
  });
}

export function releaseIframePreviewSlot(): void {
  active = Math.max(0, active - 1);
  tryGrant();
}

export function getIframePreviewSlotMetrics(): { active: number; queued: number } {
  return { active, queued: waiters.length };
}

/** Vitest-only: clears queue state between tests. */
export function __resetIframePreviewSlotForTests(): void {
  active = 0;
  waiters.length = 0;
  maxConcurrent = 3;
}
