import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import session from "@fastify/session";
import Fastify from "fastify";
import { ZodError } from "zod";
import type { AppConfig } from "./config.js";
import { HttpError } from "./errors/httpError.js";
import { prisma } from "./lib/prisma.js";
import { registerActivityLogRoutes } from "./routes/activityLogs.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerCommissionRoutes } from "./routes/commissions.js";
import { registerExportRoutes } from "./routes/export.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerLeadRoutes } from "./routes/leads.js";
import { registerPaymentRoutes } from "./routes/payments.js";
import { registerProjectRoutes } from "./routes/projects.js";
import { registerSettingsRoutes } from "./routes/settings.js";
import { registerUserRoutes } from "./routes/users.js";

export type BuildAppOptions = {
  config: AppConfig;
  prismaClient?: typeof prisma;
};

export async function buildApp(options: BuildAppOptions) {
  const { config } = options;
  const db = options.prismaClient ?? prisma;

  const app = Fastify({
    logger: true,
    trustProxy: config.trustProxy
  });

  app.decorate("prisma", db);
  app.decorate("appConfig", options.config);

  await app.register(helmet, { global: true });

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  });

  await app.register(cookie);
  await app.register(session, {
    secret: config.sessionSecret,
    cookieName: config.cookieName,
    cookie: {
      httpOnly: true,
      secure: config.secureCookie,
      sameSite: config.cookieSameSite,
      path: "/",
      maxAge: options.config.sessionMaxAgeSeconds * 1000
    }
  });

  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send(error.toBody());
    }
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: error.flatten()
        }
      });
    }
    if (error instanceof Error && error.message === "Not allowed by CORS") {
      return reply.status(403).send({
        error: { code: "CORS", message: "Origin not allowed." }
      });
    }
    request.log.error(error);
    return reply.status(500).send({
      error: { code: "INTERNAL", message: "Internal server error." }
    });
  });

  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerSettingsRoutes(app);
  await registerUserRoutes(app);
  await registerLeadRoutes(app);
  await registerPaymentRoutes(app);
  await registerCommissionRoutes(app);
  await registerProjectRoutes(app);
  await registerActivityLogRoutes(app);
  await registerExportRoutes(app);

  return app;
}
