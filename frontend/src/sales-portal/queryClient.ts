import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiJson, ApiError } from "./api/client";
import { normalizePortalReturnCandidate } from "./lib/sanitizeRedirect";
import { qk } from "./queryKeys";
import type { SessionUser } from "./types";

/**
 * Module-scoped guard so we only schedule one redirect per page lifetime even if many in-flight
 * queries fail with 401 concurrently. `window.location.assign` triggers a full reload which
 * resets the module state, so we never need to clear this flag - the assignment itself is the reset.
 */
let authRedirectScheduled = false;
let passwordChangeRedirectScheduled = false;
let unauthorizedProbeTimer: ReturnType<typeof setTimeout> | null = null;

const UNAUTHORIZED_PROBE_MS = 300;

function currentPortalPathWithSearch(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function redirectToLogin() {
  const path = window.location.pathname;
  const full = currentPortalPathWithSearch();
  const safe = normalizePortalReturnCandidate(full);
  const base = "/portal/login?reason=session_expired";
  if (safe && !path.startsWith("/portal/login")) {
    window.location.assign(`${base}&returnTo=${encodeURIComponent(safe)}`);
  } else {
    window.location.assign(base);
  }
}

async function confirmSessionThenRedirect(client: QueryClient): Promise<void> {
  if (authRedirectScheduled) return;
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/portal/login")) return;

  try {
    const data = await apiJson<{ user: SessionUser | null }>("GET", "/auth/session");
    if (data.user) {
      await client.invalidateQueries();
      toast.error("Couldn't refresh data. Try again.");
      return;
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      /* confirmed logged out */
    } else {
      toast.error("Connection problem. Try again.");
      return;
    }
  }

  authRedirectScheduled = true;
  client.setQueryData(qk.session, { user: null });
  redirectToLogin();
}

function scheduleUnauthorizedRedirect(client: QueryClient) {
  if (authRedirectScheduled) return;
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/portal/login")) return;

  if (unauthorizedProbeTimer != null) {
    clearTimeout(unauthorizedProbeTimer);
  }
  unauthorizedProbeTimer = setTimeout(() => {
    unauthorizedProbeTimer = null;
    void confirmSessionThenRedirect(client);
  }, UNAUTHORIZED_PROBE_MS);
}

function schedulePasswordChangeRedirect(client: QueryClient) {
  if (passwordChangeRedirectScheduled) return;
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/portal/change-password")) return;
  passwordChangeRedirectScheduled = true;
  client.invalidateQueries({ queryKey: qk.session }).catch(() => {});
  const full = currentPortalPathWithSearch();
  const safe = normalizePortalReturnCandidate(full);
  if (
    safe &&
    !path.startsWith("/portal/login") &&
    !path.startsWith("/portal/change-password")
  ) {
    window.location.assign(`/portal/change-password?returnTo=${encodeURIComponent(safe)}`);
  } else {
    window.location.assign("/portal/change-password");
  }
}

export function createPortalQueryClient() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!(error instanceof ApiError)) return;
        if (error.status === 403 && error.code === "PASSWORD_CHANGE_REQUIRED") {
          schedulePasswordChangeRedirect(queryClient);
          return;
        }
        if (error.status !== 401) return;
        const meta = query.meta as { skipAuthRedirect?: boolean } | undefined;
        if (meta?.skipAuthRedirect) return;
        scheduleUnauthorizedRedirect(queryClient);
      }
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!(error instanceof ApiError)) return;
        if (error.status === 403 && error.code === "PASSWORD_CHANGE_REQUIRED") {
          schedulePasswordChangeRedirect(queryClient);
          return;
        }
        if (error.status !== 401) return;
        const meta = mutation.options.meta as { skipAuthRedirect?: boolean } | undefined;
        if (meta?.skipAuthRedirect) return;
        scheduleUnauthorizedRedirect(queryClient);
      }
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            return false;
          }
          return failureCount < 2;
        }
      },
      mutations: {
        retry: false
      }
    }
  });
  return queryClient;
}

/** @internal Exported for unit tests */
export function resetAuthRedirectStateForTest(): void {
  authRedirectScheduled = false;
  passwordChangeRedirectScheduled = false;
  if (unauthorizedProbeTimer != null) {
    clearTimeout(unauthorizedProbeTimer);
    unauthorizedProbeTimer = null;
  }
}

/** @internal Exported for unit tests */
export async function confirmSessionThenRedirectForTest(
  client: QueryClient
): Promise<void> {
  return confirmSessionThenRedirect(client);
}
