import type { ScraperPlaceResult } from "../../types";

function csvEscape(val: string | null | undefined): string {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadPlacesCsv(
  rows: ScraperPlaceResult[],
  filenamePrefix = "lead_finder_results"
): void {
  const headers = [
    "Name",
    "Category",
    "Address",
    "Phone",
    "Has Website",
    "Website",
    "Google Maps"
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        csvEscape(row.name),
        csvEscape(row.category),
        csvEscape(row.address),
        csvEscape(row.phone),
        row.hasWebsite ? "Yes" : "No",
        csvEscape(row.websiteUrl),
        csvEscape(row.mapsUrl)
      ].join(",")
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Google Search URL so reps can double-check website presence beyond Places data. */
export function buildGoogleSearchVerifyUrl(
  name: string,
  address?: string | null
): string {
  const trimmedName = name.trim();
  const trimmedAddress = address?.trim() ?? "";
  const query = trimmedAddress ? `${trimmedName} ${trimmedAddress}` : trimmedName;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function sourceLabel(source: string): string {
  switch (source) {
    case "cache":
      return "Cached";
    case "api":
      return "Fresh search";
    case "api_sweep":
      return "All-types sweep";
    case "cache_sweep":
      return "Cached sweep";
    default:
      return source;
  }
}
