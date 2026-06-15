import { ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { LeadScraperPastPlace, ScraperPlaceResult } from "../../types";

type PlaceRow = ScraperPlaceResult | LeadScraperPastPlace;

function isPastPlace(row: PlaceRow): row is LeadScraperPastPlace {
  return "pipelineImported" in row;
}

function isSelectable(row: PlaceRow): boolean {
  if (isPastPlace(row) && row.pipelineImported) return false;
  return true;
}

function mapsHref(row: PlaceRow): string {
  return row.mapsUrl ?? "#";
}

export function PlaceResultsList({
  rows,
  selected,
  onToggle,
  onToggleAll,
  showImported = false
}: {
  rows: PlaceRow[];
  selected: Set<string>;
  onToggle: (placeId: string) => void;
  onToggleAll: (checked: boolean) => void;
  showImported?: boolean;
}) {
  const selectableRows = rows.filter(isSelectable);
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((r) => selected.has(r.placeId));

  return (
    <>
      <div className="space-y-3 md:hidden">
        {selectableRows.length > 0 && (
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <Checkbox checked={allSelected} onCheckedChange={(c) => onToggleAll(c === true)} />
            Select all on page
          </label>
        )}
        {rows.map((row) => {
          const disabled = !isSelectable(row);
          return (
            <article
              key={row.placeId}
              className={cn(
                "rounded-lg border-2 border-[#0A0A0A] bg-white p-4 shadow-[2px_2px_0_0_#0A0A0A]",
                selected.has(row.placeId) && "ring-2 ring-[#FF3333]",
                disabled && "opacity-60"
              )}
            >
              <div className="flex gap-3">
                <Checkbox
                  className="mt-1"
                  checked={selected.has(row.placeId)}
                  disabled={disabled}
                  onCheckedChange={() => onToggle(row.placeId)}
                  aria-label={`Select ${row.name}`}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-black uppercase leading-tight">
                      {row.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {row.hasWebsite ? (
                        <Badge variant="secondary">Has website</Badge>
                      ) : (
                        <Badge className="bg-[#FF3333] text-white hover:bg-[#FF3333]">No website</Badge>
                      )}
                      {showImported && isPastPlace(row) && row.pipelineImported && (
                        <Badge variant="outline">In pipeline</Badge>
                      )}
                    </div>
                  </div>
                  {row.category && (
                    <p className="text-xs uppercase tracking-wide text-[#0A0A0A]/60">{row.category}</p>
                  )}
                  {(row.phone || row.mapsUrl) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {row.phone && (
                        <a
                          href={`tel:${row.phone}`}
                          className="text-sm font-medium text-[#FF3333]"
                        >
                          {row.phone}
                        </a>
                      )}
                      {row.mapsUrl && (
                        <a
                          href={mapsHref(row)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#0A0A0A] underline underline-offset-2"
                        >
                          Open in Maps
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden min-w-0 md:block">
        <div className="-mx-1 overflow-x-auto rounded-md border-2 border-[#0A0A0A] px-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    disabled={selectableRows.length === 0}
                    onCheckedChange={(c) => onToggleAll(c === true)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="text-right">Maps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const disabled = !isSelectable(row);
                return (
                  <TableRow key={row.placeId} className={cn(disabled && "opacity-60")}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.placeId)}
                        disabled={disabled}
                        onCheckedChange={() => onToggle(row.placeId)}
                        aria-label={`Select ${row.name}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[200px] font-medium">
                      <span className="line-clamp-2">{row.name}</span>
                      {showImported && isPastPlace(row) && row.pipelineImported && (
                        <Badge variant="outline" className="mt-1">
                          In pipeline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{row.category ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{row.phone ?? "—"}</TableCell>
                    <TableCell>
                      {row.hasWebsite ? (
                        <Badge variant="secondary">Yes</Badge>
                      ) : (
                        <Badge className="bg-[#FF3333] text-white hover:bg-[#FF3333]">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.mapsUrl ? (
                        <a
                          href={mapsHref(row)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center justify-end gap-1 text-sm font-medium text-[#FF3333]"
                        >
                          Maps
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
