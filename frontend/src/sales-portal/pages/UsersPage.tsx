import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateUserMutation,
  usePatchUserMutation,
  useResetPasswordMutation,
  useUsersQuery
} from "../hooks/useSalesQueries";
import { createUserSchema, patchUserSchema, resetPasswordSchema } from "../validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
export function UsersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading, isError, refetch } = useUsersQuery(page, pageSize, true);
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
  const [newUserTempPassword, setNewUserTempPassword] = useState<string | null>(null);
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

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Users</h1>
          <p className="text-sm text-muted-foreground">Manage portal accounts.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="min-h-11 w-full sm:w-auto">Add user</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New user</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={createForm.handleSubmit((v) =>
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
                      createForm.reset();
                      if (data.temporaryPassword) {
                        setNewUserTempPassword(data.temporaryPassword);
                      } else {
                        toast.success("User created");
                      }
                    }
                  }
                )
              )}
            >
              <div className="space-y-2">
                <Label>Email</Label>
                <Input className="min-h-11" {...createForm.register("email")} />
              </div>
              <div className="space-y-2">
                <Label>Password (optional — generated if empty)</Label>
                <Input type="password" className="min-h-11" {...createForm.register("password")} />
              </div>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input className="min-h-11" {...createForm.register("displayName")} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={createForm.watch("role")}
                  onValueChange={(r) =>
                    createForm.setValue("role", r as "ADMIN" | "SALES_REP")
                  }
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES_REP">Sales rep</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={createForm.watch("mustChangePassword")}
                  onCheckedChange={(c) => createForm.setValue("mustChangePassword", c)}
                />
                <Label>Must change password</Label>
              </div>
              <Button type="submit" className="min-h-11 w-full" disabled={createUser.isPending}>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isError && (
        <QueryErrorAlert
          message="Could not load users."
          onRetry={() => void refetch()}
        />
      )}

      {isLoading && <Skeleton className="h-64 w-full" />}

      <div className="space-y-3 md:hidden">
        {data?.items.map((u) => (
          <div
            key={u.id}
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
          >
            <p className="break-words font-medium">{u.email}</p>
            <div className="mt-2">
              <Badge variant="outline">{u.role}</Badge>
            </div>
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div>Active: {u.isActive ? "Yes" : "No"}</div>
              <div>Must change password: {u.mustChangePassword ? "Yes" : "No"}</div>
            </dl>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="outline"
                className="min-h-11 w-full"
                onClick={() => {
                  setEditing(u);
                  setEditOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="min-h-11 w-full"
                onClick={() => {
                  setResetUserId(u.id);
                  setResetOpen(true);
                  resetForm.reset();
                }}
              >
                Reset password
              </Button>
            </div>
          </div>
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
              <TableHead>Must change pw</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{u.role}</Badge>
                </TableCell>
                <TableCell>{u.isActive ? "Yes" : "No"}</TableCell>
                <TableCell>{u.mustChangePassword ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
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
                    Reset password
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

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
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={editForm.handleSubmit((v) =>
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
                )
              )}
            >
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input className="min-h-11" {...editForm.register("displayName")} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editForm.watch("role")}
                  onValueChange={(r) =>
                    editForm.setValue("role", r as "ADMIN" | "SALES_REP")
                  }
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES_REP">Sales rep</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.watch("isActive")}
                  onCheckedChange={(c) => editForm.setValue("isActive", c)}
                />
                <Label>Active</Label>
              </div>
              <Button type="submit" className="min-h-11 w-full" disabled={patchUser.isPending}>
                Save
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set temporary password</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={resetForm.handleSubmit((v) =>
              resetPw.mutate(
                { id: resetUserId!, body: v },
                {
                  onSuccess: () => {
                    setResetOpen(false);
                    setResetUserId(null);
                  }
                }
              )
            )}
          >
            <div className="space-y-2">
              <Label>New temporary password (8–128 chars)</Label>
              <Input type="password" className="min-h-11" {...resetForm.register("temporaryPassword")} />
            </div>
            <Button type="submit" className="min-h-11 w-full" disabled={resetPw.isPending || !resetUserId}>
              Reset
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newUserTempPassword !== null}
        onOpenChange={(open) => {
          if (!open) setNewUserTempPassword(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Share this password with the user once. They must change it when they sign in.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input readOnly className="min-h-11 font-mono text-sm" value={newUserTempPassword ?? ""} />
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 shrink-0"
              onClick={() => {
                if (newUserTempPassword) {
                  void navigator.clipboard.writeText(newUserTempPassword);
                  toast.success("Copied to clipboard");
                }
              }}
            >
              Copy
            </Button>
          </div>
          <Button type="button" className="min-h-11 w-full" onClick={() => setNewUserTempPassword(null)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
