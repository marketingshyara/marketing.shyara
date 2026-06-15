import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Building2,
  CheckCircle2,
  FolderGit2,
  Globe,
  MessageCircle,
  Palette,
  Wallet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PendingActionItem, PendingActionType } from "../../types";

function actionTypeLabel(t: PendingActionType): string {
  const map: Record<PendingActionType, string> = {
    PAYMENT: "Payment",
    WHATSAPP: "WhatsApp",
    DEMO_FINALIZED: "Demo approval",
    ACCOUNTS: "Accounts",
    BUILD_DEMO: "Build demo",
    REPO_TRANSFER: "Repo transfer",
    DEPLOYMENT: "Deployment",
    COMMISSION: "Commission",
    MILESTONE_PAYOUT: "Milestone payout"
  };
  return map[t];
}

const TYPE_ICONS: Record<PendingActionType, LucideIcon> = {
  PAYMENT: Wallet,
  WHATSAPP: MessageCircle,
  DEMO_FINALIZED: CheckCircle2,
  ACCOUNTS: Building2,
  BUILD_DEMO: Palette,
  REPO_TRANSFER: FolderGit2,
  DEPLOYMENT: Globe,
  COMMISSION: Banknote,
  MILESTONE_PAYOUT: Banknote
};

type Props = {
  item: PendingActionItem;
  repLabel: string;
  onReviewPayment: () => void;
};

export function PendingActionRow({ item, repLabel, onReviewPayment }: Props) {
  const Icon = TYPE_ICONS[item.type];
  const typeLabel = actionTypeLabel(item.type);
  const showSummary =
    item.summary &&
    !item.summary.toLowerCase().startsWith(typeLabel.toLowerCase());

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate font-medium">{item.clientName}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="shrink-0 font-normal">
                {typeLabel}
              </Badge>
              <span className="truncate">{repLabel}</span>
            </div>
            {showSummary ? (
              <p className="truncate text-xs text-muted-foreground" title={item.summary}>
                {item.summary}
              </p>
            ) : null}
          </div>
        </div>
        {item.type === "PAYMENT" ? (
          <Button className="min-h-11 shrink-0" onClick={onReviewPayment}>
            Verify
          </Button>
        ) : (
          <Button className="min-h-11 shrink-0" asChild>
            <Link
              to={
                item.repId
                  ? `/portal/team/${item.repId}/projects/${item.leadId}?stage=${item.stageKey}`
                  : "/portal/team"
              }
            >
              Open
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
