/** Limits concurrent sample iframe navigations so the main thread stays responsive. */
const MAX_CONCURRENT = 3;

let active = 0;
const waiters: Array<() => void> = [];

function tryGrant() {
  while (active < MAX_CONCURRENT && waiters.length > 0) {
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
}
