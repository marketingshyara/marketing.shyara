import { Navigate, useLocation } from "react-router-dom";

/** Preserves query string when redirecting old /samples/websites URLs */
export function SamplesLegacyRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/work${search}`} replace />;
}
