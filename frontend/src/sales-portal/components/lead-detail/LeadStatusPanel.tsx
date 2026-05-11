import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useTransitionLeadMutation } from "../../hooks/useSalesQueries";
import { getAllowedTransitions } from "../../lib/leadUi";
import type { Lead, PortalSettingsValues, UserRole } from "../../types";
import { leadStatusLabel } from "../../lib/copy";

type Props = {
  lead: Lead;
  settings: PortalSettingsValues;
  role: UserRole;
  terminal: boolean;
};

/**
 * Status-transition panel. Hidden when the lead is terminal or there are no allowed edges from
 * the current status. Each transition is a single button - we treat the transition list as the
 * source of truth, so disabled edges never appear here.
 */
export function LeadStatusPanel({ lead, settings, role, terminal }: Props) {
  const transition = useTransitionLeadMutation(lead.id);
  const transitions = getAllowedTransitions(settings, lead, role);
  const [targetStatus, setTargetStatus] = useState<Lead["status"] | null>(null);

  if (terminal || transitions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Move Lead to Next Stage</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <Button
            key={`${t.from}-${t.to}`}
            variant="secondary"
            className="min-h-11"
            disabled={transition.isPending}
            onClick={() => setTargetStatus(t.to)}
          >
            Move to {leadStatusLabel(t.to)}
          </Button>
        ))}
      </CardContent>
      <AlertDialog open={targetStatus != null} onOpenChange={(open) => !open && setTargetStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stage Change</AlertDialogTitle>
            <AlertDialogDescription>
              This updates the lead stage to{" "}
              <span className="font-medium">{targetStatus ? leadStatusLabel(targetStatus) : ""}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={transition.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={transition.isPending || !targetStatus}
              onClick={() => {
                if (!targetStatus) return;
                transition.mutate({ toStatus: targetStatus });
                setTargetStatus(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
