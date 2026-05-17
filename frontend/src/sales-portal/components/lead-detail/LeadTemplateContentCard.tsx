import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { usePatchLeadMutation, useWebsiteTemplatesQuery } from "../../hooks/useSalesQueries";
import { formatTemplateOption } from "../../lib/templateLabel";
import type { Lead } from "../../types";
import { QueryErrorAlert } from "../QueryErrorAlert";

type Props = {
  lead: Lead;
  terminal: boolean;
};

function hasVerifiedAdvance(lead: Lead): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED"
    ) ?? false
  );
}

export function LeadTemplateContentCard({ lead, terminal }: Props) {
  const tplQr = useWebsiteTemplatesQuery(true);
  const patch = usePatchLeadMutation(lead.id);
  const items = tplQr.data?.items ?? [];
  const canMarkContent =
    !terminal && hasVerifiedAdvance(lead) && Boolean(lead.websiteTemplateId) && !lead.contentReceivedAt;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template &amp; content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tplQr.isError && (
          <QueryErrorAlert message="Could not load templates." onRetry={() => void tplQr.refetch()} />
        )}
        <div className="space-y-2">
          <Label htmlFor={`tpl-${lead.id}`}>Website template</Label>
          <Select
            value={lead.websiteTemplateId ?? "__none__"}
            onValueChange={(v) => {
              if (terminal) return;
              patch.mutate({
                websiteTemplateId: v === "__none__" ? null : v
              });
            }}
            disabled={terminal || tplQr.isLoading || patch.isPending}
          >
            <SelectTrigger id={`tpl-${lead.id}`} className="min-h-11">
              <SelectValue placeholder={tplQr.isLoading ? "Loading…" : "Choose a template"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not set</SelectItem>
              {items.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {formatTemplateOption(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {lead.contentReceivedAt ? (
          <p className="text-sm text-muted-foreground">
            Content marked received on {new Date(lead.contentReceivedAt).toLocaleString()}.
          </p>
        ) : (
          <Button
            type="button"
            className="min-h-11"
            disabled={!canMarkContent || patch.isPending}
            onClick={() => patch.mutate({ markContentReceived: true })}
          >
            Mark content received
          </Button>
        )}
        {!hasVerifiedAdvance(lead) && !terminal && (
          <p className="text-xs text-muted-foreground">
            Content can be marked after the advance payment is verified and a template is selected.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
