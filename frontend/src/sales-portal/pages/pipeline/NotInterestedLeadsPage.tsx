import { Navigate } from "react-router-dom";

/** @deprecated Prospects use category sub-tabs on the pipeline list. */
export function NotInterestedLeadsPage() {
  return (
    <Navigate to="/portal/pipeline?view=leads&prospectCategory=NOT_INTERESTED" replace />
  );
}
