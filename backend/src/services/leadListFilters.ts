import { LeadStatus, ProspectCategory } from "@prisma/client";

export type LeadListView = "leads" | "not_interested" | "clients" | "completed";

export type LeadListFilterQuery = {
  view?: LeadListView;
  prospectCategory?: ProspectCategory;
  status?: LeadStatus;
  search?: string;
  from?: Date;
  to?: Date;
};

type BuildLeadListFiltersOptions = {
  /** Rep pipeline list hides not-interested when `view` is omitted. Admin rep timeline shows all. */
  applyLegacyDefaultWhenNoView?: boolean;
};

export function buildLeadListFilters(
  query: LeadListFilterQuery,
  options: BuildLeadListFiltersOptions = {}
): Record<string, unknown> {
  const viewStatusFilter =
    query.view === "clients"
      ? { status: { not: LeadStatus.COMMISSION_PAID } }
      : query.view === "completed"
        ? { status: LeadStatus.COMMISSION_PAID }
        : query.status
          ? { status: query.status }
          : {};

  const effectiveCategory =
    query.view === "not_interested"
      ? ProspectCategory.NOT_INTERESTED
      : query.prospectCategory;

  return {
    ...(query.view === "leads" || query.view === "not_interested"
      ? {
          convertedAt: null,
          ...(effectiveCategory
            ? { prospectCategory: effectiveCategory }
            : query.view === "leads"
              ? { prospectCategory: { not: ProspectCategory.NOT_INTERESTED } }
              : {})
        }
      : {}),
    ...(query.view === undefined && options.applyLegacyDefaultWhenNoView
      ? { prospectCategory: { not: ProspectCategory.NOT_INTERESTED } }
      : {}),
    ...(query.view === "clients" || query.view === "completed"
      ? { convertedAt: { not: null } }
      : {}),
    ...viewStatusFilter,
    ...(query.search
      ? {
          OR: [
            { clientName: { contains: query.search, mode: "insensitive" as const } },
            { clientEmail: { contains: query.search, mode: "insensitive" as const } },
            { clientPhone: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {})
          }
        }
      : {})
  };
}
