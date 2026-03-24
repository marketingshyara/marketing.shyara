import { usePortalSession } from "@/components/portal/PortalGuards";
import { portalApi } from "@/lib/portal-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, contact, phone, email"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            >
              <option value="">All statuses</option>
              {["new", "contacted", "under_follow_up", "interested", "payment_pending", "closed_won", "lost", "dormant"].map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Filter by city"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3">Business</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leads.isLoading ? (
                  <tr>
                    <td className="py-4 text-slate-400" colSpan={5}>
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.isError ? (
                  <tr>
                    <td className="py-4 text-rose-200" colSpan={5}>
                      {(leads.error as Error).message}
                    </td>
                  </tr>
                ) : !leads.data?.length ? (
                  <tr>
                    <td className="py-4 text-slate-400" colSpan={5}>
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  leads.data.map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-3">
                        <Link className="font-medium text-cyan-300 hover:text-cyan-200" to={`/sales-portal/leads/${lead.id}`}>
                          {lead.businessName}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div>{lead.contactPersonName}</div>
                        <div className="text-xs text-slate-500">{lead.phoneNumber}</div>
                      </td>
                      <td className="py-3">{lead.businessCategory}</td>
                      <td className="py-3">{lead.city}</td>
                      <td className="py-3">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
                          {lead.status.replaceAll("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <form className="rounded-[28px] border border-white/10 bg-white/5 p-6" onSubmit={handleCreateLead}>
          <h2 className="text-lg font-semibold">Add New Lead</h2>
          <p className="mt-2 text-sm text-slate-400">Capture the lead cleanly on first entry so follow-up, assignment, and closing are reliable.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(form)
              .filter(([key]) => !["assignedSalesPersonId", "sharedWithUserIds"].includes(key))
              .map(([key, value]) => (
                <label key={key} className={key === "description" ? "md:col-span-2" : ""}>
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</span>
                  {key === "description" ? (
                    <textarea
                      value={value}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    />
                  )}
                </label>
              ))}
            {session.data?.user?.role === "admin" ? (
              <>
                <label className="md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Assigned sales owner</span>
                  <select
                    value={form.assignedSalesPersonId}
                    onChange={(event) => setForm((current) => ({ ...current, assignedSalesPersonId: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  >
                    <option value="">Auto-assign to creator</option>
                    {salesUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Shared with</span>
                  <select
                    multiple
                    value={form.sharedWithUserIds}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sharedWithUserIds: Array.from(event.target.selectedOptions).map((option) => option.value)
                      }))
                    }
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  >
                    {salesUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
          </div>
          {createLead.data?.duplicateFlags?.length ? (
            <p className="mt-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Duplicate warning: {createLead.data.duplicateFlags.length} possible conflict(s) were flagged for admin review.
            </p>
          ) : null}
          <div className="mt-6 flex justify-end">
            <button type="submit" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
              Create lead
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
