/**
 * Clear lead-scraper past results and search cache. Pipeline leads (imported from scraper) are kept.
 *
 * Usage (from backend/):
 *   npx tsx src/scripts/clearLeadScraperPastResults.ts              # dry-run counts
 *   npx tsx src/scripts/clearLeadScraperPastResults.ts --confirm    # execute wipe
 *
 * Requires DATABASE_URL.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { clearUnimportedScraperPastResults } from "../services/leadScraper/leadScraperPlacesStore.js";

async function dryRunCounts() {
  const pipelineRows = await prisma.lead.findMany({
    where: { googlePlaceId: { not: null } },
    select: { googlePlaceId: true }
  });
  const pipelinePlaceIds = [
    ...new Set(
      pipelineRows
        .map((r) => r.googlePlaceId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  ];

  const notInPipeline =
    pipelinePlaceIds.length > 0 ? { placeId: { notIn: pipelinePlaceIds } } : {};

  const [views, searchCache, places] = await Promise.all([
    prisma.leadScraperPlaceView.count({ where: notInPipeline }),
    prisma.leadScraperSearchCache.count(),
    prisma.leadScraperPlace.count({ where: notInPipeline })
  ]);

  return {
    viewsToDelete: views,
    searchCacheToDelete: searchCache,
    placesToDelete: places,
    pipelinePlaceIdsPreserved: pipelinePlaceIds.length
  };
}

async function main() {
  const confirm = process.argv.includes("--confirm");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const preview = await dryRunCounts();
  console.log(JSON.stringify({ mode: confirm ? "execute" : "dry-run", preview }, null, 2));

  if (!confirm) {
    console.log("\nRe-run with --confirm to delete unimported past results and search cache.");
    return;
  }

  const result = await clearUnimportedScraperPastResults(prisma);
  console.log(JSON.stringify({ deleted: result }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
