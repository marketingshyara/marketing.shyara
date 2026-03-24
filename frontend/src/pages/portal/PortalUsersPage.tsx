import { portalApi } from "@/lib/portal-api";
import type { PortalUser } from "@/types/portal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";

function buildEditState(user: PortalUser) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    status: user.status
  };
}

export default function PortalUsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["portal-users"], queryFn: portalApi.users });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "sales_associate",
    status: "active",
    password: ""
  });
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [editingUsers, setEditingUsers] = useState<Record<string, ReturnType<typeof buildEditState>>>({});

  const hydratedEdits = useMemo(() => {
    const next = { ...editingUsers };
    for (const user of users.data ?? []) {
      next[user.id] ??= buildEditState(user);
    }
    return next;
  }, [editingUsers, users.data]);

  const createUser = useMutation({
    mutationFn: portalApi.createUser,
    onSuccess: async () => {
      setForm({ name: "", email: "", phone: "", role: "sales_associate", status: "active", password: "" });
      await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    }
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: Record<string, unknown> }) => portalApi.updateUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    }
  });

  const resetPassword = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) => portalApi.resetPassword(userId, newPassword),
    onSuccess: async (_, variables) => {
      setResetPasswords((current) => ({ ...current, [variables.userId]: "" }));
      await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    createUser.mutate(form);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form className="rounded-[28px] border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold">Create Portal Account</h2>
        <p className="mt-2 text-sm text-slate-400">New users start with a temporary password and must rotate it after login.</p>
        <div className="mt-4 space-y-3">
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{key}</span>
              {key === "role" || key === "status" ? (
                <select
                  value={value}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                >
                  {key === "role" ? (
                    <>
                      <option value="sales_associate">sales associate</option>
                      <option value="operations">operations</option>
                      <option value="admin">admin</option>
                    </>
                  ) : (
                    <>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="deactivated">deactivated</option>
                    </>
                  )}
                </select>
              ) : (
                <input
                  type={key === "password" ? "password" : "text"}
                  value={value}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                />
              )}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={createUser.isPending}
          className="mt-6 rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 disabled:opacity-70"
        >
          {createUser.isPending ? "Creating..." : "Create user"}
        </button>
      </form>
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Portal Users</h2>
        <div className="mt-4 space-y-4">
          {users.data?.map((user) => {
            const draft = hydratedEdits[user.id];
            return (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={draft.name}
                    onChange={(event) =>
                      setEditingUsers((current) => ({
                        ...current,
                        [user.id]: { ...draft, name: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  />
                  <input
                    value={draft.email}
                    onChange={(event) =>
                      setEditingUsers((current) => ({
                        ...current,
                        [user.id]: { ...draft, email: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  />
                  <input
                    value={draft.phone}
                    onChange={(event) =>
                      setEditingUsers((current) => ({
                        ...current,
                        [user.id]: { ...draft, phone: event.target.value }
                      }))
                    }
                    placeholder="Phone"
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={draft.role}
                      onChange={(event) =>
                        setEditingUsers((current) => ({
                          ...current,
                          [user.id]: { ...draft, role: event.target.value as PortalUser["role"] }
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    >
                      <option value="sales_associate">sales associate</option>
                      <option value="operations">operations</option>
                      <option value="admin">admin</option>
                    </select>
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        setEditingUsers((current) => ({
                          ...current,
                          [user.id]: { ...draft, status: event.target.value as PortalUser["status"] }
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    >
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="deactivated">deactivated</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">
                    Password change required: {user.mustChangePassword ? "yes" : "no"}
                  </span>
                  <span>Updated {new Date(user.updatedAt).toLocaleString()}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => updateUser.mutate({ userId: user.id, payload: draft })}
                    disabled={updateUser.isPending}
                    className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-70"
                  >
                    Save profile
                  </button>
                  <input
                    type="password"
                    value={resetPasswords[user.id] ?? ""}
                    onChange={(event) => setResetPasswords((current) => ({ ...current, [user.id]: event.target.value }))}
                    placeholder="Temporary password"
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={resetPassword.isPending || !(resetPasswords[user.id] ?? "").trim()}
                    onClick={() => resetPassword.mutate({ userId: user.id, newPassword: resetPasswords[user.id] })}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-60"
                  >
                    Reset password
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
