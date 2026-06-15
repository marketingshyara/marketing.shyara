import type { FastifyInstance } from "fastify";
import { requireUser } from "../auth/requireUser.js";
import { assertSalesRepActor } from "../services/leadMutations.js";
import { getUserUsage } from "../services/leadScraper/leadScraperQuota.js";
import { importScraperPlacesToPipeline } from "../services/leadScraper/leadScraperImportService.js";
import {
  exportPastPlacesCsv,
  listPastPlacesForUser
} from "../services/leadScraper/leadScraperPlacesStore.js";
import {
  checkCacheStatus,
  runLeadScraperSearch
} from "../services/leadScraper/leadScraperSearchService.js";
import { resolveScraperRadiusKm, scraperCacheLocationKey } from "../services/leadScraper/types.js";
import {
  leadScraperCacheStatusQuerySchema,
  leadScraperImportBodySchema,
  leadScraperPlacesExportQuerySchema,
  leadScraperPlacesQuerySchema,
  leadScraperSearchBodySchema
} from "../validators/schemas.js";

function userDisplay(user: {
  id: string;
  displayName: string | null;
  email: string;
  role: string;
}) {
  return {
    displayName: user.displayName,
    email: user.email,
    role: user.role
  };
}

export async function registerLeadScraperRoutes(app: FastifyInstance): Promise<void> {
  const config = app.appConfig.leadScraper;

  app.get(
    "/api/lead-scraper/usage",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const usage = await getUserUsage(app.prisma, config, user.id, userDisplay(user));
      return reply.send(usage);
    }
  );

  app.get(
    "/api/lead-scraper/cache/status",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const query = leadScraperCacheStatusQuerySchema.parse(request.query);
      const radiusKm = resolveScraperRadiusKm(query.radiusKm);
      const cacheKey = scraperCacheLocationKey(query.location, radiusKm);
      const status = await checkCacheStatus(
        app.prisma,
        config,
        cacheKey,
        query.keyword ?? null
      );
      return reply.send(status);
    }
  );

  app.post(
    "/api/lead-scraper/search",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const body = leadScraperSearchBodySchema.parse(request.body);
      const radiusKm = resolveScraperRadiusKm(body.radiusKm);

      try {
        const result = await runLeadScraperSearch(
          app.prisma,
          config,
          user.id,
          userDisplay(user),
          {
            location: body.location,
            keyword: body.keyword,
            radiusKm
          }
        );
        return reply.send(result);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("API_KEY") || err.message.includes("not configured")) {
            return reply.status(503).send({
              error: {
                code: "API_NOT_CONFIGURED",
                message: err.message
              }
            });
          }
          if (err.message.includes("geocode") || err.message.includes("Geocoding")) {
            return reply.status(400).send({
              error: {
                code: "GEOCODING_FAILED",
                message: err.message
              }
            });
          }
        }
        throw err;
      }
    }
  );

  app.get(
    "/api/lead-scraper/places",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const query = leadScraperPlacesQuerySchema.parse(request.query);
      const result = await listPastPlacesForUser(app.prisma, {
        userId: user.id,
        noWebsiteOnly: query.noWebsiteOnly,
        search: query.search,
        page: query.page,
        limit: query.limit
      });
      return reply.send(result);
    }
  );

  app.get(
    "/api/lead-scraper/places/export",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const query = leadScraperPlacesExportQuerySchema.parse(request.query);
      const csv = await exportPastPlacesCsv(app.prisma, user.id, query.noWebsiteOnly);
      const filename = `leads_${query.noWebsiteOnly ? "no_website_" : ""}${new Date().toISOString().split("T")[0]}.csv`;
      return reply
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", `attachment; filename="${filename}"`)
        .send(csv);
    }
  );

  app.post(
    "/api/lead-scraper/import",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const body = leadScraperImportBodySchema.parse(request.body);
      const result = await importScraperPlacesToPipeline(
        app.prisma,
        user,
        body.placeIds,
        request
      );
      return reply.send(result);
    }
  );
}
