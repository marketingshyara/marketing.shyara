import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api/client";
import { qk } from "./queryKeys";

/**
 * Module-scoped guard so we only schedule one redirect per page lifetime even if many in-flight
 * queries fail with 401 concurrently. `window.location.assign` triggers a full reload which
 * resets the module state, so we never need to clear this flag - the assignment itself is the reset.
 * If the surrounding shell ever stops doing a hard navigation here, reset this flag in the
 * post-redirect bootstrap or queued 401s after the first reload won't be honoured.
 */
let authRedirectScheduled = false;
let passwordChangeRedirectScheduled = false;

function scheduleUnauthorizedRedirect(client: QueryClient) {
  if (authRedirectScheduled) return;
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/portal/login")) return;
  authRedirectScheduled = true;
  client.setQueryData(qk.session, { user: null });
  window.location.assign("/portal/login?reason=session_expired");
}

function schedulePasswordChangeRedirect(client: QueryClient) {
  if (passwordChangeRedirectScheduled) return;
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/portal/change-password")) return;
  passwordChangeRedirectScheduled = true;
  client.invalidateQueries({ queryKey: qk.session }).catch(() => {});
  window.location.assign("/portal/change-password");
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
