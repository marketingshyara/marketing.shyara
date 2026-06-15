import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { BrutalButton } from "../../components/brutalist";
import {
  useLeadScraperImportMutation,
  useLeadScraperPlacesQuery,
  useLeadScraperSearchMutation,
  useLeadScraperUsageQuery
} from "../../hooks/useSalesQueries";
import { salesApi } from "../../api/salesApi";
import type {
  LeadScraperImportResponse,
  LeadScraperSearchResponse,
  ScraperPlaceResult
} from "../../types";
import { PlaceResultsList } from "./PlaceResultsList";
import { UsageMeter } from "./UsageMeter";
import { downloadPlacesCsv, sourceLabel } from "./leadScraperUtils";

const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 15] as const;
const SWEEP_CATEGORY_COUNT = 10;

function emptySet() {
  return new Set<string>();
}

export function LeadScraperPage() {
  const [tab, setTab] = useState<"scrape" | "past">("scrape");
  const usageQuery = useLeadScraperUsageQuery();
  const searchMutation = useLeadScraperSearchMutation();
  const importMutation = useLeadScraperImportMutation();

  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [radiusKm, setRadiusKm] = useState<string>("2");
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(true);
  const [searchResult, setSearchResult] = useState<LeadScraperSearchResponse | null>(null);
  const [scrapeSelected, setScrapeSelected] = useState<Set<string>>(emptySet);
  const [pastSelected, setPastSelected] = useState<Set<string>>(emptySet);
  const [importOutcome, setImportOutcome] = useState<LeadScraperImportResponse | null>(null);
  const [exportingPast, setExportingPast] = useState(false);

  const [pastSearch, setPastSearch] = useState("");
  const [pastNoWebsite, setPastNoWebsite] = useState(false);
  const [pastPage, setPastPage] = useState(1);
  const [pastAccumulated, setPastAccumulated] = useState<
    import("../../types").LeadScraperPastPlace[]
  >([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pastFetchSeq = useRef(0);

  const pastQuery = useLeadScraperPlacesQuery({
    page: pastPage,
    limit: 50,
    noWebsiteOnly: pastNoWebsite,
    search: pastSearch.trim() || undefined,
    enabled: tab === "past"
  });

  const resetPastList = useCallback(() => {
    setPastPage(1);
    setPastAccumulated([]);
    setPastSelected(emptySet());
    pastFetchSeq.current += 1;
  }, []);

  useEffect(() => {
    if (!pastQuery.data || pastQuery.isFetching) return;
    if (pastPage === 1) {
      setPastAccumulated(pastQuery.data.leads);
      return;
    }
    const seq = pastFetchSeq.current;
    setPastAccumulated((prev) => {
      const ids = new Set(prev.map((p) => p.placeId));
      const next = [...prev];
      for (const lead of pastQuery.data!.leads) {
        if (!ids.has(lead.placeId)) next.push(lead);
      }
      return seq === pastFetchSeq.current ? next : prev;
    });
  }, [pastQuery.data, pastQuery.isFetching, pastPage]);

  useEffect(() => {
    if (tab === "past") {
      setScrapeSelected(emptySet());
    } else {
      setPastSelected(emptySet());
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "past") return;
    const el = loadMoreRef.current;
    if (!el || !pastQuery.data) return;
    const hasMore = pastPage < pastQuery.data.totalPages;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !pastQuery.isFetching) {
          setPastPage((p) => p + 1);
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tab, pastQuery.data, pastQuery.isFetching, pastPage]);

  const filteredResults = useMemo(() => {
    if (!searchResult) return [];
    if (!noWebsiteOnly) return searchResult.results;
    return searchResult.results.filter((r) => !r.hasWebsite);
  }, [searchResult, noWebsiteOnly]);

  const toggleScrapeSelect = useCallback((placeId: string) => {
    setScrapeSelected((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }, []);

  const togglePastSelect = useCallback((placeId: string) => {
    setPastSelected((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }, []);

  const toggleScrapeAll = useCallback((checked: boolean, rows: { placeId: string }[]) => {
    if (!checked) {
      setScrapeSelected(emptySet());
      return;
    }
    setScrapeSelected(new Set(rows.map((r) => r.placeId)));
  }, []);

  const togglePastAll = useCallback(
    (checked: boolean, rows: import("../../types").LeadScraperPastPlace[]) => {
      if (!checked) {
        setPastSelected(emptySet());
        return;
      }
      const selectable = rows.filter((r) => !r.pipelineImported);
      setPastSelected(new Set(selectable.map((r) => r.placeId)));
    },
    []
  );

  const runSearch = useCallback(() => {
    const loc = location.trim();
    if (!loc) {
      toast.error("Enter a location");
      return;
    }
    setScrapeSelected(emptySet());
    setImportOutcome(null);
    searchMutation.mutate(
      {
        location: loc,
        keyword: keyword.trim() || null,
        radiusKm: Number(radiusKm)
      },
      {
        onSuccess: (data) => {
          setSearchResult(data);
          if (data.sweepPartial) {
            toast.message(
              `Sweep stopped early — ${data.categoriesCompleted ?? "?"}/${data.totalCategories ?? SWEEP_CATEGORY_COUNT} categories (quota limit).`
            );
          } else if (data.totalResults === 0) {
            const orgHidden = data.orgUnavailableCount ?? 0;
            if (orgHidden > 0) {
              toast.message(
                `No new places for you — ${orgHidden} result${orgHidden === 1 ? "" : "s"} already claimed by other reps or in pipeline.`
              );
            } else {
              toast.message("No new places found for you this search.");
            }
          } else if ((data.orgUnavailableCount ?? 0) > 0) {
            toast.message(
              `${data.orgUnavailableCount} place${data.orgUnavailableCount === 1 ? "" : "s"} hidden — already claimed by another rep or in pipeline.`
            );
          }
        }
      }
    );
  }, [location, keyword, radiusKm, searchMutation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
  };

  const handleImport = (placeIds: string[], fromTab: "scrape" | "past") => {
    if (placeIds.length === 0) {
      toast.error("Select at least one place");
      return;
    }
    importMutation.mutate(
      { placeIds },
      {
        onSuccess: (data) => {
          setImportOutcome(data);
          if (fromTab === "scrape") {
            setScrapeSelected(emptySet());
          } else {
            setPastSelected(emptySet());
            setPastPage(1);
            setPastAccumulated([]);
            pastFetchSeq.current += 1;
          }
          void pastQuery.refetch();
        }
      }
    );
  };

  const handlePastExport = async () => {
    setExportingPast(true);
    try {
      await salesApi.leadScraperExportPlaces(pastNoWebsite);
      toast.success("Download started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExportingPast(false);
    }
  };

  const usage = usageQuery.data;
  const isSweep = !keyword.trim();
  const userQuotaBlocked = usage != null && usage.user.remaining <= 0;
  const orgQuotaBlocked = usage != null && usage.global.remaining <= 0;
  const quotaBlocked = userQuotaBlocked || orgQuotaBlocked;
  const sweepLowQuota =
    usage != null &&
    !quotaBlocked &&
    (usage.user.remaining < SWEEP_CATEGORY_COUNT || usage.global.remaining < SWEEP_CATEGORY_COUNT);
  const searchDisabled = searchMutation.isPending || quotaBlocked;

  const quotaWarning =
    usage && !quotaBlocked && usage.user.remaining > 0 && usage.user.remaining <= 5;

  return (
    <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-4 pb-24 lg:pb-8">
      <PortalPageHeader
        title="Find leads"
        variant="operational"
        description="Search Google Places for local businesses, then add them to your New lead pipeline."
        toolbar={
          <div className="w-full lg:hidden">
            <UsageMeter usage={usage} compact />
          </div>
        }
      />

      {usageQuery.isError && (
        <QueryErrorAlert message="Could not load search quota." onRetry={() => void usageQuery.refetch()} />
      )}

      {quotaWarning && (
        <div
          role="status"
          className="flex items-start gap-2 border-2 border-[#FF3333] bg-[#FF3333]/10 p-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3333]" aria-hidden />
          <p>
            {usage!.user.remaining} search{usage!.user.remaining === 1 ? "" : "es"} left this
            month. Contact admin if you need more.
          </p>
        </div>
      )}

      {quotaBlocked && (
        <div
          role="alert"
          className="flex items-start gap-2 border-2 border-[#FF3333] bg-[#FF3333]/10 p-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3333]" aria-hidden />
          <p>
            {userQuotaBlocked
              ? `Monthly search limit reached (${usage!.user.used}/${usage!.user.limit}). Resets on ${usage!.resetsOn}. Contact admin for more searches.`
              : "Searches are temporarily unavailable. Contact admin — they can restore access or adjust your quota."}
          </p>
        </div>
      )}

      {importOutcome && (importOutcome.failed.length > 0 || importOutcome.skipped.length > 0) && (
        <div
          role="status"
          className="space-y-2 border-2 border-[#0A0A0A] bg-white p-3 text-sm shadow-[2px_2px_0_0_#0A0A0A]"
        >
          <p className="font-medium">Import details</p>
          {importOutcome.skipped.length > 0 && (
            <ul className="list-inside list-disc text-[#0A0A0A]/80">
              {importOutcome.skipped.slice(0, 5).map((s) => (
                <li key={s.placeId}>Skipped: {s.reason}</li>
              ))}
              {importOutcome.skipped.length > 5 && (
                <li>…and {importOutcome.skipped.length - 5} more skipped</li>
              )}
            </ul>
          )}
          {importOutcome.failed.length > 0 && (
            <ul className="list-inside list-disc text-[#FF3333]">
              {importOutcome.failed.slice(0, 5).map((f) => (
                <li key={f.placeId}>Failed: {f.reason}</li>
              ))}
              {importOutcome.failed.length > 5 && (
                <li>…and {importOutcome.failed.length - 5} more failed</li>
              )}
            </ul>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11"
            onClick={() => setImportOutcome(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="hidden w-56 shrink-0 lg:block">
          <UsageMeter usage={usage} />
        </aside>

        <div className="min-w-0 flex-1">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "scrape" | "past")}>
            <TabsList className="sticky top-14 z-10 grid h-auto w-full grid-cols-2 gap-1 bg-[#FAFAFA] p-1 sm:w-auto sm:inline-flex">
              <TabsTrigger value="scrape" className="min-h-11 gap-2">
                <Search className="h-4 w-4" aria-hidden />
                Scrape
              </TabsTrigger>
              <TabsTrigger value="past" className="min-h-11 gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                Past results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scrape" className="mt-4 space-y-4">
              <form
                onSubmit={handleSearch}
                className="grid gap-4 rounded-lg border-2 border-[#0A0A0A] bg-white p-4 shadow-[2px_2px_0_0_#0A0A0A] sm:grid-cols-2"
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="scraper-location">Location</Label>
                  <Input
                    id="scraper-location"
                    className="min-h-11"
                    placeholder="e.g. Koramangala, Bengaluru"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scraper-keyword">Keyword (optional)</Label>
                  <Input
                    id="scraper-keyword"
                    className="min-h-11"
                    placeholder="Leave empty for all-types sweep"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  {!keyword.trim() && (
                    <p className="text-xs text-[#FF3333]">
                      Empty keyword runs {SWEEP_CATEGORY_COUNT} category searches — uses more quota.
                      {isSweep && sweepLowQuota
                        ? ` You have fewer than ${SWEEP_CATEGORY_COUNT} searches left; sweep may stop early.`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scraper-radius">Radius (km)</Label>
                  <Select value={radiusKm} onValueChange={setRadiusKm}>
                    <SelectTrigger id="scraper-radius" className="min-h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RADIUS_OPTIONS.map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {r} km
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-h-11 items-center gap-2 sm:col-span-2">
                  <Checkbox
                    id="filter-no-website"
                    checked={noWebsiteOnly}
                    onCheckedChange={(c) => {
                      setNoWebsiteOnly(c === true);
                      setScrapeSelected(emptySet());
                    }}
                  />
                  <Label htmlFor="filter-no-website" className="cursor-pointer">
                    Show no-website only in results
                  </Label>
                </div>
                <div className="sm:col-span-2">
                  <BrutalButton
                    type="submit"
                    className="min-h-11 w-full sm:w-auto"
                    disabled={searchDisabled}
                  >
                    {searchMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Searching…
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" aria-hidden />
                        Search
                      </>
                    )}
                  </BrutalButton>
                </div>
              </form>

              {searchMutation.isError && (
                <QueryErrorAlert
                  message={
                    searchMutation.error instanceof Error
                      ? searchMutation.error.message
                      : "Search failed"
                  }
                  onRetry={runSearch}
                />
              )}

              {searchResult && (
                <section className="space-y-3" aria-live="polite">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-heading text-lg font-black uppercase">
                        {filteredResults.length} result{filteredResults.length === 1 ? "" : "s"}
                      </h2>
                      <p className="text-sm text-[#0A0A0A]/60">
                        {searchResult.location} · {searchResult.keyword}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{sourceLabel(searchResult.source)}</Badge>
                      {searchResult.sweepPartial && (
                        <Badge variant="secondary">Partial sweep</Badge>
                      )}
                      {searchResult.duplicateCount != null && searchResult.duplicateCount > 0 && (
                        <Badge variant="secondary">
                          {searchResult.duplicateCount} already seen
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-full sm:w-auto"
                      disabled={scrapeSelected.size === 0 || importMutation.isPending}
                      onClick={() => handleImport([...scrapeSelected], "scrape")}
                    >
                      Add to pipeline ({scrapeSelected.size})
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11 w-full sm:w-auto"
                      disabled={filteredResults.length === 0}
                      onClick={() =>
                        downloadPlacesCsv(filteredResults as ScraperPlaceResult[])
                      }
                    >
                      <Download className="mr-2 h-4 w-4" aria-hidden />
                      Export CSV
                    </Button>
                  </div>

                  {filteredResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No results match your filters. Try widening radius or turning off no-website
                      filter.
                    </p>
                  ) : (
                    <PlaceResultsList
                      rows={filteredResults}
                      selected={scrapeSelected}
                      onToggle={toggleScrapeSelect}
                      onToggleAll={(c) => toggleScrapeAll(c, filteredResults)}
                    />
                  )}
                </section>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="past-search">Filter past results</Label>
                  <Input
                    id="past-search"
                    className="min-h-11"
                    placeholder="Name, address, category…"
                    value={pastSearch}
                    onChange={(e) => {
                      setPastSearch(e.target.value);
                      resetPastList();
                    }}
                  />
                </div>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox
                    checked={pastNoWebsite}
                    onCheckedChange={(c) => {
                      setPastNoWebsite(c === true);
                      resetPastList();
                    }}
                  />
                  No website only
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={exportingPast}
                  onClick={() => void handlePastExport()}
                >
                  {exportingPast ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Download className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  Export CSV
                </Button>
              </div>

              {(pastQuery.isLoading || (pastQuery.isFetching && pastAccumulated.length === 0)) &&
                pastPage === 1 && <Skeleton className="h-48 w-full" />}

              {pastQuery.isError && (
                <QueryErrorAlert
                  message="Could not load past results."
                  onRetry={() => void pastQuery.refetch()}
                />
              )}

              {pastAccumulated.length > 0 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {pastQuery.data?.total ?? pastAccumulated.length} places you have discovered
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      className="min-h-11 w-full sm:w-auto"
                      disabled={pastSelected.size === 0 || importMutation.isPending}
                      onClick={() => handleImport([...pastSelected], "past")}
                    >
                      Add to pipeline ({pastSelected.size})
                    </Button>
                  </div>
                  <PlaceResultsList
                    rows={pastAccumulated}
                    selected={pastSelected}
                    onToggle={togglePastSelect}
                    onToggleAll={(c) => togglePastAll(c, pastAccumulated)}
                    showImported
                  />
                </>
              )}

              {!pastQuery.isLoading &&
                !pastQuery.isFetching &&
                pastAccumulated.length === 0 &&
                !pastQuery.isError && (
                <p className="text-sm text-muted-foreground">
                  {pastNoWebsite
                    ? "No past results without a website. Try turning off the filter."
                    : "No past results yet. Run a search on the Scrape tab."}
                </p>
              )}

              <div ref={loadMoreRef} className="flex justify-center py-4">
                {pastQuery.isFetching && pastPage > 1 && (
                  <Loader2 className="h-6 w-6 animate-spin text-[#FF3333]" aria-label="Loading more" />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
