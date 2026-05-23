import { BookOpen, CreditCard, ExternalLink, FileText, Video } from "lucide-react";
import { usePortalSettingsQuery } from "../../hooks/useSalesQueries";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { PaymentMethodsResourceList } from "../../components/pipeline/PaymentMethodField";
import { mergePaymentShareMethods } from "../../lib/paymentShareMethods";

export function ResourcesPage() {
  const { data, isLoading, isError, refetch } = usePortalSettingsQuery();
  const settings = data?.settings;

  if (isError) {
    return (
      <QueryErrorAlert message="Could not load resources." onRetry={() => void refetch()} />
    );
  }

  if (isLoading || !settings) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PortalPageHeader title="Resources" variant="operational" />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
          <FileText className="h-8 w-8 text-muted-foreground" aria-hidden />
          <CardTitle className="text-lg">Website templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <a href={settings.templatesCatalogUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Open gallery
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
          <CreditCard className="h-8 w-8 text-muted-foreground" aria-hidden />
          <CardTitle className="text-lg">Payment methods</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Share these with clients when collecting advance or due payments.
          </p>
          <PaymentMethodsResourceList
            methods={mergePaymentShareMethods(settings.paymentShareMethods)}
          />
        </CardContent>
      </Card>

      {settings.tutorialLinks.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Video className="h-8 w-8 text-muted-foreground" aria-hidden />
            <CardTitle className="text-lg">Tutorials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settings.tutorialLinks.map((link) => (
              <Button key={link.url} variant="outline" className="min-h-11 w-full justify-start" asChild>
                <a href={link.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                  {link.title}
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {settings.painPointsByCategory.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden />
            <CardTitle className="text-lg">Pain points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settings.painPointsByCategory.map((group) => (
              <Collapsible key={group.categoryId}>
                <CollapsibleTrigger className="flex min-h-11 w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/50">
                  {group.title}
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-2 list-disc space-y-1 pl-8 pr-2 text-sm text-muted-foreground">
                    {group.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
