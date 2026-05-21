import { ExternalLink } from "lucide-react";
import { usePortalSettingsQuery } from "../../hooks/useSalesQueries";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "../../components/PortalPageHeader";

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
    <div className="mx-auto max-w-2xl space-y-6">
      <PortalPageHeader
        title="Sales resources"
        description="Templates, tutorials, and talking points for your pitch."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Website templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <a href={settings.templatesCatalogUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Open sample gallery
            </a>
          </Button>
        </CardContent>
      </Card>

      {settings.tutorialLinks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tutorial videos</CardTitle>
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
          <CardHeader>
            <CardTitle className="text-lg">Customer pain points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.painPointsByCategory.map((group) => (
              <div key={group.categoryId}>
                <h3 className="font-medium">{group.title}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {group.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
