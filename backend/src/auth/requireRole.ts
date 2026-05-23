import type { FastifyRequest } from "fastify";
import { UserRole } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";

export function requireAdmin(request: FastifyRequest): void {
  if (request.currentUser?.role !== UserRole.ADMIN) {
    throw new HttpError(403, "FORBIDDEN", "Admin access required.");
  }
}

export function requireRepOrAdmin(request: FastifyRequest): void {
  const role = request.currentUser?.role;
  if (role !== UserRole.ADMIN && role !== UserRole.SALES_REP) {
    throw new HttpError(403, "FORBIDDEN", "Sales or admin access required.");
  }
}

export function requireSalesRep(request: FastifyRequest): void {
  if (request.currentUser?.role !== UserRole.SALES_REP) {
    throw new HttpError(
      403,
      "NOT_SALES_REP",
      "This action is only for sales rep accounts."
    );
  }
}
