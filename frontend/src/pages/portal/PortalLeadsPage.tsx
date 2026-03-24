import { usePortalSession } from "@/components/portal/PortalGuards";
import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading,
  PortalStatusBadge
} from "@/components/portal/portal-ui";
import {
  formatPortalDate,
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalInputClass,
  portalSelectClass,
  portalTextareaClass
} from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const leadStatusOptions = [
  "new",
  "contacted",
  "under_follow_up",
  "interested",
  "payment_pending",
  "closed_won",
  "lost",
  "dormant"
];

export default function PortalLeadsPage() {
  const queryClient = useQueryClient();
  const session = usePortalSession();
  const users = useQuery({
    queryKey: ["portal-users"],
    queryFn: portalApi.users,
    enabled: session.data?.user?.role === "admin"
  });

  const salesUsers = useMemo(
    () => (users.data ?? []).filter((user) => user.role === "sales_associate" || user.role === "admin"),
    [users.data]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    contactPersonName: "",
    phoneNumber: "",
    whatsappNumber: "",
    email: "",
    businessCategory: "",
    city: "",
    locality: "",
    source: "",
    packageInterest: "",
    firstContactDate: new Date().toISOString().slice(0, 10),
    description: "",
    assignedSalesPersonId: "",
    sharedWithUserIds: [] as string[]
  });

  const leads = useQuery({
    queryKey: ["portal-leads", search, statusFilter, cityFilter],
    queryFn: () =>
      portalApi.leads({
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(cityFilter ? { city: cityFilter } : {})
      })
  });

  const createLead = useMutation({
    mutationFn: portalApi.createLead,
    onSuccess: async () => {
      setForm({
        businessName: "",
        contactPersonName: "",
        phoneNumber: "",
        whatsappNumber: "",
        email: "",
        businessCategory: "",
        city: "",
        locality: "",
        source: "",
        packageInterest: "",
        firstContactDate: new Date().toISOString().slice(0, 10),
        description: "",
        assignedSalesPersonId: "",
        sharedWithUserIds: []
      });
      await queryClient.invalidateQueries({ queryKey: ["portal-leads"] });
    }
  });

  const handleCreateLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createLead.mutate({
      ...form,
      assignedSalesPersonId: form.assignedSalesPersonId || undefined,
      sharedWithUserIds: form.sharedWithUserIds
    });
  };

  const formFields: Array<{
    key: keyof typeof form;
    label: string;
    type?: string;
    fullWidth?: boolean;
  }> = [
    { key: "businessName", label: "Business name" },
    { key: "contactPersonName", label: "Contact person" },
    { key: "phoneNumber", label: "Phone number" },
    { key: "whatsappNumber", label: "WhatsApp number" },
    { key: "email", label: "Email", type: "email" },
    { key: "businessCategory", label: "Category" },
    { key: "city", label: "City" },
    { key: "locality", label: "Locality" },
    { key: "source", label: "Lead source" },
    { key: "packageInterest", label: "Package interest" },
    { key: "firstContactDate", label: "First contact date", type: "date" },
    { key: "description", label: "Lead notes", fullWidth: true }
  ];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Lead Pipeline"
        title="Capture, search, and route every lead cleanly"
        description="The lead board now mirrors the main website's cleaner card system while staying dense enough for daily sales operations."
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <PortalPanel>
          <PortalSectionHeading
            title="Lead Directory"
            description="Filter by business name, owner, phone, email, city, or status."
          />

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Search
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Business, contact, phone, email"
                className={portalInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={portalSelectClass}
              >
                <option value="">All statuses</option>
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatPortalLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                City
              </span>
              <input
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                placeholder="Filter by city"
                className={portalInputClass}
              />
            </label>
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.isError ? (
                  <tr>
                    <td colSpan={5} className="font-medium text-rose-700">
                      {(leads.error as Error).message}
                    </td>
                  </tr>
                ) : !leads.data?.length ? (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground">
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  leads.data.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <Link
                          className="font-semibold text-foreground transition hover:text-accent"
                          to={`/sales-portal/leads/${lead.id}`}
                        >
                          {lead.businessName}
                        </Link>
                        <p className="mt-2 text-caption text-muted-foreground">
                          First contact: {formatPortalDate(lead.firstContactDate)}
                        </p>
                      </td>
                      <td>
                        <div className="font-medium text-foreground">{lead.contactPersonName}</div>
                        <div className="mt-1 text-caption text-muted-foreground">{lead.phoneNumber}</div>
                        {lead.email ? <div className="text-caption text-muted-foreground">{lead.email}</div> : null}
                      </td>
                      <td>{lead.businessCategory}</td>
                      <td>{lead.city}</td>
                      <td>
                        <PortalStatusBadge status={lead.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="portal-card-list mt-6 lg:hidden">
            {leads.isLoading ? <p className="text-sm text-muted-foreground">Loading leads...</p> : null}
            {leads.isError ? <p className="text-sm font-medium text-rose-700">{(leads.error as Error).message}</p> : null}
            {!leads.isLoading && !leads.isError && !leads.data?.length ? (
              <p className="text-sm text-muted-foreground">No leads match the current filters.</p>
            ) : null}
            {leads.data?.map((lead) => (
              <div key={lead.id} className="portal-list-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      className="font-semibold text-foreground transition hover:text-accent"
                      to={`/sales-portal/leads/${lead.id}`}
                    >
                      {lead.businessName}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{lead.contactPersonName}</p>
                  </div>
                  <PortalStatusBadge status={lead.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm text-foreground">{lead.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">City</p>
                    <p className="mt-1 text-sm text-foreground">{lead.city}</p>
                  </div>
                  <div>
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Category</p>
                    <p className="mt-1 text-sm text-foreground">{lead.businessCategory}</p>
                  </div>
                  <div>
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">First contact</p>
                    <p className="mt-1 text-sm text-foreground">{formatPortalDate(lead.firstContactDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading
            title="Add New Lead"
            description="Capture complete context at first entry so assignment, follow-up, and closing stay reliable."
          />

          <form className="mt-5 space-y-5" onSubmit={handleCreateLead}>
            <div className="grid gap-4 md:grid-cols-2">
              {formFields.map((field) => (
                <label key={field.key} className={cn("block", field.fullWidth ? "md:col-span-2" : "")}>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {field.label}
                  </span>
                  {field.key === "description" ? (
                    <textarea
                      value={form[field.key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: event.target.value
                        }))
                      }
                      className={portalTextareaClass}
                    />
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      value={form[field.key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: event.target.value
                        }))
                      }
                      className={portalInputClass}
                    />
                  )}
                </label>
              ))}

              {session.data?.user?.role === "admin" ? (
                <>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Assigned sales owner
                    </span>
                    <select
                      value={form.assignedSalesPersonId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          assignedSalesPersonId: event.target.value
                        }))
                      }
                      className={portalSelectClass}
                    >
                      <option value="">Auto-assign to creator</option>
                      {salesUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Shared with
                    </span>
                    <select
                      multiple
                      value={form.sharedWithUserIds}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sharedWithUserIds: Array.from(event.target.selectedOptions).map((option) => option.value)
                        }))
                      }
                      className={cn(portalSelectClass, "min-h-32")}
                    >
                      {salesUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-caption text-muted-foreground">
                      Hold Ctrl or Command to select multiple users.
                    </p>
                  </label>
                </>
              ) : null}
            </div>

            {createLead.data?.duplicateFlags?.length ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                Duplicate warning: {createLead.data.duplicateFlags.length} possible conflict(s) were flagged for admin review.
              </p>
            ) : null}

            <div className="flex justify-end">
              <button type="submit" className={portalButtonPrimaryClass}>
                Create lead
              </button>
            </div>
          </form>
        </PortalPanel>
      </section>
    </div>
  );
}
