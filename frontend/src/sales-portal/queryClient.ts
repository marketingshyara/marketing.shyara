import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api/client";
import { qk } from "./queryKeys";

let authRedirectScheduled = false;

function scheduleUnauthorizedRedirect(client: QueryClient) {
  if (authRedirectScheduled) return;
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/portal/login")) return;
  authRedirectScheduled = true;
  client.setQueryData(qk.session, { user: null });
  window.location.assign("/portal/login?reason=session_expired");
}

export function createPortalQueryClient() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!(error instanceof ApiError) || error.status !== 401) return;
        const meta = query.meta as { skipAuthRedirect?: boolean } | undefined;
        if (meta?.skipAuthRedirect) return;
        scheduleUnauthorizedRedirect(queryClient);
      }
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!(error instanceof ApiError) || error.status !== 401) return;
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
