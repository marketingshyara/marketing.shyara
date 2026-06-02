import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateUserMutation,
  usePatchUserMutation,
  useResetPasswordMutation,
  useSessionQuery,
  useUsersQuery
} from "../hooks/useSalesQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemoveUserButton } from "../components/users/RemoveUserButton";
import { createUserSchema, patchUserSchema, resetPasswordSchema } from "../validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "../types";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { userRoleLabel } from "../lib/copy";
import { passwordCopy } from "../lib/passwordCopy";
import { TemporaryPasswordDialog } from "../components/auth/TemporaryPasswordDialog";
import { PortalPageHeader } from "../components/PortalPageHeader";

function formatRemovedOn(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function UsersPage() {
  const [userTab, setUserTab] = useState<"active" | "past">("active");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const sessionQr = useSessionQuery();
  const currentUserId = sessionQr.data?.user?.id;
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useUsersQuery(
    page,
    pageSize,
    true,
    userTab
  );
  const createUser = useCreateUserMutation();
  const patchUser = usePatchUserMutation();
  const resetPw = useResetPasswordMutation();

  const createForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      role: "SALES_REP" as const,
      mustChangePassword: false
    }
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const editForm = useForm({
    resolver: zodResolver(patchUserSchema),
    values: editing
      ? {
          displayName: editing.displayName ?? "",
          role: editing.role,
          isActive: editing.isActive
        }
      : undefined
  });

  const [resetOpen, setResetOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [issuedTempPassword, setIssuedTempPassword] = useState<string | null>(null);
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { temporaryPassword: "" }
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  useEffect(() => {
    if (data == null) return;
    const tp = Math.max(1, Math.ceil(data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [data, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [userTab]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PortalPageHeader
        title="Users"
        variant="config"
        description="Portal accounts and roles."
        toolbar={
          <div className="flex flex-col gap-2 sm:items-end">
            {!isLoading && (
              <DataStaleToolbar
                dataUpdatedAt={dataUpdatedAt}
                onRefresh={() => void refetch()}
                isFetching={isFetching}
              />
            )}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 w-full sm:w-auto">Add user</Button>
          </DialogTrigger>
          <DialogContent
            aria-describedby={undefined}
            className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>New user</DialogTitle>
              <DialogDescription className="sr-only">
                Create a sales rep or admin account.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={createForm.handleSubmit(
                (v) =>
                  createUser.mutate(
                    {
                      email: v.email,
                      ...(v.password?.trim() ? { password: v.password.trim() } : {}),
                      ...(v.displayName?.trim() ? { displayName: v.displayName.trim() } : {}),
                      role: v.role,
                      mustChangePassword: v.mustChangePassword
                    },
                    {
                      onSuccess: (data) => {
                        createForm.reset({
                          email: "",
                          password: "",
                          displayName: "",
                          role: "SALES_REP",
                          mustChangePassword: false
                        });
                        setCreateOpen(false);
                        const roleLabel = userRoleLabel(data.user.role);
                        if (data.temporaryPassword) {
                          setIssuedTempPassword(data.temporaryPassword);
                          toast.success(passwordCopy.createUserGeneratedToast(roleLabel));
                        } else {
                          toast.success(passwordCopy.createUserExplicitToast(roleLabel));
                        }
                      }
                    }
                  ),
                () => toast.error("Check the form — fix any highlighted fields and try again.")
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="create-user-email">Email</Label>
                <Input
                  id="create-user-email"
                  type="email"
                  autoComplete="email"
                  className="min-h-11"
                  aria-invalid={!!createForm.formState.errors.email}
                  {...createForm.register("email")}
                />
                {createForm.formState.errors.email ? (
                  <p className="text-sm text-destructive" role="alert">
                    {createForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-user-password">Password (optional — generated if empty)</Label>
                <Input
                  id="create-user-password"
                  type="password"
                  autoComplete="new-password"
                  className="min-h-11"
                  aria-invalid={!!createForm.formState.errors.password}
                  {...createForm.register("password")}
                />
                {createForm.formState.errors.password ? (
                  <p className="text-sm text-destructive" role="alert">
                    {createForm.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-user-display-name">Display name (optional)</Label>
                <Input
                  id="create-user-display-name"
                  className="min-h-11"
                  aria-invalid={!!createForm.formState.errors.displayName}
                  {...createForm.register("displayName")}
                />
                {createForm.formState.errors.displayName ? (
                  <p className="text-sm text-destructive" role="alert">
                    {createForm.formState.errors.displayName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-user-role">Role</Label>
                <Controller
                  name="role"
                  control={createForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="create-user-role" className="min-h-11 w-full">
                        <SelectValue placeholder="Choose role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALES_REP">Sales rep</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {createForm.watch("role") === "ADMIN" ? (
                  <p className="text-xs text-muted-foreground">
                    Admins can manage team, verify payments, and create other admin accounts. Leave
                    password empty to generate a one-time password they must change at first login.
                  </p>
                ) : null}
              </div>
              <div className="flex min-h-11 items-center gap-2">
                <Switch
                  id="create-user-must-change-password"
                  checked={createForm.watch("mustChangePassword")}
                  onCheckedChange={(c) => createForm.setValue("mustChangePassword", c)}
                />
                <Label htmlFor="create-user-must-change-password" className="leading-snug">
                  {passwordCopy.createUserMustChangeHint}
                </Label>
              </div>
              <Button type="submit" className="min-h-11 w-full touch-manipulation" disabled={createUser.isPending}>
                {createUser.isPending ? "Creating…" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
          </div>
        }
      />

      {isError && (
        <QueryErrorAlert
          message="Could not load users."
          onRetry={() => void refetch()}
        />
      )}

      {isLoading && <Skeleton className="h-64 w-full" />}

      <Tabs
        value={userTab}
        onValueChange={(v) => setUserTab(v as "active" | "past")}
        className="space-y-4"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:w-auto sm:inline-flex">
          <TabsTrigger value="active" className="min-h-11">
            Active users
          </TabsTrigger>
          <TabsTrigger value="past" className="min-h-11">
            Past users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-0 space-y-4">
          <div className="space-y-3 md:hidden">
            {data?.items.map((u) => (
              <ActiveUserCard
                key={u.id}
                user={u}
                currentUserId={currentUserId}
                onEdit={() => {
                  setEditing(u);
                  setEditOpen(true);
                }}
                onReset={() => {
                  setResetUserId(u.id);
                  setResetOpen(true);
                  resetForm.reset();
                }}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <div className="-mx-1 overflow-x-auto rounded-md border px-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>{passwordCopy.mustSetNewPasswordColumn}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{userRoleLabel(u.role)}</Badge>
                      </TableCell>
                      <TableCell>{u.isActive ? "Yes" : "No"}</TableCell>
                      <TableCell>{u.mustChangePassword ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-11"
                            onClick={() => {
                              setEditing(u);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-h-11"
                            onClick={() => {
                              setResetUserId(u.id);
                              setResetOpen(true);
                              resetForm.reset();
                            }}
                          >
                            {passwordCopy.issueTemporaryPassword}
                          </Button>
                          <RemoveUserButton
                            userId={u.id}
                            email={u.email}
                            disabled={u.id === currentUserId}
                            disabledReason="You cannot remove your own account"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0 space-y-4">
          {data?.items.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No removed users yet.</p>
          ) : null}
          <div className="space-y-3 md:hidden">
            {data?.items.map((u) => (
              <PastUserCard key={u.id} user={u} />
            ))}
          </div>
          <div className="hidden md:block">
            <div className="-mx-1 overflow-x-auto rounded-md border px-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Removed on</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.displayName ? (
                          <>
                            <span className="block">{u.displayName}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </>
                        ) : (
                          u.email
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{userRoleLabel(u.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        {u.archivedAt ? formatRemovedOn(u.archivedAt) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Removed · Cannot sign in</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {data && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Users pagination"
        >
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="min-h-11"
          >
            Previous
          </Button>
          <span className="w-full basis-full px-2 text-center text-sm text-muted-foreground sm:w-auto sm:basis-auto">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-11"
          >
            Next
          </Button>
        </nav>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription className="sr-only">Update role, name, or active status.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={editForm.handleSubmit((v) => {
                if (
                  editing.role === "SALES_REP" &&
                  v.role === "ADMIN" &&
                  !window.confirm(
                    "Changing this user to Administrator removes their sales rep pipeline access (add prospect, convert, payments). Continue?"
                  )
                ) {
                  return;
                }
                patchUser.mutate(
                  {
                    id: editing.id,
                    body: {
                      displayName: v.displayName.trim() === "" ? null : v.displayName.trim(),
                      role: v.role,
                      isActive: v.isActive
                    }
                  },
                  { onSuccess: () => setEditOpen(false) }
                );
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="edit-user-display-name">Display name</Label>
                <Input id="edit-user-display-name" className="min-h-11" {...editForm.register("displayName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-role">Role</Label>
                <Controller
                  name="role"
                  control={editForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-user-role" className="min-h-11 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALES_REP">Sales rep</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-user-active"
                  checked={editForm.watch("isActive")}
                  onCheckedChange={(c) => editForm.setValue("isActive", c)}
                />
                <Label htmlFor="edit-user-active">Active</Label>
              </div>
              <Button type="submit" className="min-h-11 w-full" disabled={patchUser.isPending}>
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent aria-describedby="issue-temp-password-desc" className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{passwordCopy.issueTemporaryPasswordTitle}</DialogTitle>
            <DialogDescription id="issue-temp-password-desc">
              {passwordCopy.issueTemporaryPasswordDescription}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={resetForm.handleSubmit((v) =>
              resetPw.mutate(
                {
                  id: resetUserId!,
                  body: v.temporaryPassword?.trim()
                    ? { temporaryPassword: v.temporaryPassword.trim() }
                    : {}
                },
                {
                  onSuccess: (data) => {
                    setResetOpen(false);
                    setResetUserId(null);
                    resetForm.reset({ temporaryPassword: "" });
                    if (data.temporaryPassword) {
                      setIssuedTempPassword(data.temporaryPassword);
                    }
                    toast.success(passwordCopy.issueTemporaryPasswordSuccessToast);
                  }
                }
              )
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="reset-user-password">
                {passwordCopy.issueTemporaryPasswordFieldLabel}
              </Label>
              <Input
                id="reset-user-password"
                type="password"
                autoComplete="new-password"
                className="min-h-11"
                {...resetForm.register("temporaryPassword")}
              />
              <p className="text-xs text-muted-foreground">
                {passwordCopy.issueTemporaryPasswordFieldHint}
              </p>
            </div>
            <Button
              type="submit"
              className="min-h-11 w-full touch-manipulation"
              disabled={resetPw.isPending || !resetUserId}
            >
              {resetPw.isPending ? "Issuing…" : passwordCopy.issueTemporaryPasswordSubmit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <TemporaryPasswordDialog
        password={issuedTempPassword}
        onOpenChange={(open) => {
          if (!open) setIssuedTempPassword(null);
        }}
      />
    </div>
  );
}

function ActiveUserCard({
  user,
  currentUserId,
  onEdit,
  onReset
}: {
  user: User;
  currentUserId?: string;
  onEdit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="break-words font-medium">{user.email}</p>
      <div className="mt-2">
        <Badge variant="outline">{userRoleLabel(user.role)}</Badge>
      </div>
      <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
        <div>Active: {user.isActive ? "Yes" : "No"}</div>
        <div>
          {passwordCopy.mustSetNewPasswordColumn}:{" "}
          {user.mustChangePassword
            ? passwordCopy.mustSetNewPasswordYes
            : passwordCopy.mustSetNewPasswordNo}
        </div>
      </dl>
      <div className="mt-3 flex flex-col gap-2">
        <Button variant="outline" className="min-h-11 w-full" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" className="min-h-11 w-full" onClick={onReset}>
          {passwordCopy.issueTemporaryPassword}
        </Button>
        <RemoveUserButton
          userId={user.id}
          email={user.email}
          disabled={user.id === currentUserId}
          disabledReason="You cannot remove your own account"
        />
      </div>
    </div>
  );
}

function PastUserCard({ user }: { user: User }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="break-words font-medium">{user.email}</p>
      {user.displayName ? (
        <p className="text-sm text-muted-foreground">{user.displayName}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline">{userRoleLabel(user.role)}</Badge>
        <Badge variant="secondary">Removed · Cannot sign in</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Removed on: {user.archivedAt ? formatRemovedOn(user.archivedAt) : "—"}
      </p>
    </div>
  );
}
