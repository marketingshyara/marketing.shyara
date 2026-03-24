import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading,
  PortalStatusBadge
} from "@/components/portal/portal-ui";
import {
  formatPortalDateTime,
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalButtonSecondaryClass,
  portalInputClass,
  portalSelectClass
} from "@/components/portal/portal-theme";
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
    mutationFn: ({ userId, payload }: { userId: string; payload: Record<string, unknown> }) =>
      portalApi.updateUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    }
  });

  const resetPassword = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      portalApi.resetPassword(userId, newPassword),
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
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="User Management"
        title="Manage portal access with cleaner account controls"
        description="Account creation, profile updates, role changes, and temporary password resets all use the same card and form language as the rest of the site."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading
            title="Create Portal Account"
            description="New users start with a temporary password and must rotate it after login."
          />
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {Object.entries(form).map(([key, value]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {formatPortalLabel(key)}
                </span>
                {key === "role" || key === "status" ? (
                  <select
                    value={value}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    className={portalSelectClass}
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
                    type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                    value={value}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    className={portalInputClass}
                  />
                )}
              </label>
            ))}
            <button
              type="submit"
              disabled={createUser.isPending}
              className={portalButtonPrimaryClass}
            >
              {createUser.isPending ? "Creating..." : "Create user"}
            </button>
          </form>
        </PortalPanel>

        <PortalPanel>
          <PortalSectionHeading
            title="Portal Users"
            description="Edit profile data, status, role, and password reset policy from one list."
          />
          <div className="portal-card-list mt-5">
            {users.data?.map((user) => {
              const draft = hydratedEdits[user.id];
              return (
                <div key={user.id} className="portal-list-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <PortalStatusBadge status={user.status} />
                      <span className="portal-badge portal-badge-info">{formatPortalLabel(user.role)}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setEditingUsers((current) => ({
                          ...current,
                          [user.id]: { ...draft, name: event.target.value }
                        }))
                      }
                      className={portalInputClass}
                    />
                    <input
                      value={draft.email}
                      onChange={(event) =>
                        setEditingUsers((current) => ({
                          ...current,
                          [user.id]: { ...draft, email: event.target.value }
                        }))
                      }
                      className={portalInputClass}
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
                      className={portalInputClass}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={draft.role}
                        onChange={(event) =>
                          setEditingUsers((current) => ({
                            ...current,
                            [user.id]: { ...draft, role: event.target.value as PortalUser["role"] }
                          }))
                        }
                        className={portalSelectClass}
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
                        className={portalSelectClass}
                      >
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                        <option value="deactivated">deactivated</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
                    <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                      Password change required: {user.mustChangePassword ? "yes" : "no"}
                    </span>
                    <span>Updated {formatPortalDateTime(user.updatedAt)}</span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
                    <button
                      type="button"
                      onClick={() => updateUser.mutate({ userId: user.id, payload: draft })}
                      disabled={updateUser.isPending}
                      className={portalButtonPrimaryClass}
                    >
                      Save profile
                    </button>
                    <input
                      type="password"
                      value={resetPasswords[user.id] ?? ""}
                      onChange={(event) =>
                        setResetPasswords((current) => ({ ...current, [user.id]: event.target.value }))
                      }
                      placeholder="Temporary password"
                      className={portalInputClass}
                    />
                    <button
                      type="button"
                      disabled={resetPassword.isPending || !(resetPasswords[user.id] ?? "").trim()}
                      onClick={() =>
                        resetPassword.mutate({ userId: user.id, newPassword: resetPasswords[user.id] })
                      }
                      className={portalButtonSecondaryClass}
                    >
                      Reset password
                    </button>
                  </div>
                </div>
              );
            })}
            {!users.data?.length ? <p className="text-sm text-muted-foreground">No users created yet.</p> : null}
          </div>
        </PortalPanel>
      </section>
    </div>
  );
}
