import { Navigate } from "react-router-dom";
import { useSessionQuery } from "../hooks/useSalesQueries";

type Props = {
  repTo: string;
  adminTo: string;
};

/** Legacy bookmarks: send reps and admins to the correct home, not admin-only routes. */
export function RoleAwareRedirect({ repTo, adminTo }: Props) {
  const { data, isLoading } = useSessionQuery();
  if (isLoading && !data?.user) {
    return null;
  }
  const role = data?.user?.role ?? "SALES_REP";
  const target = role === "ADMIN" ? adminTo : repTo;
  return <Navigate to={target} replace />;
}
