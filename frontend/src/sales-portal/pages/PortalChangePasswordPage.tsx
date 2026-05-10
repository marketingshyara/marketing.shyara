import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { changePasswordSchema } from "../validation/schemas";
import { useChangePasswordMutation, useSessionQuery } from "../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function PortalChangePasswordPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useSessionQuery();
  const change = useChangePasswordMutation();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.user) {
    return <Navigate to="/portal/login" replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-3 py-8">
      <Card className="w-full max-w-md border shadow-card">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            {data.user.mustChangePassword
              ? "Your administrator requires you to set a new password before continuing."
              : "Update your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              change.mutate(values, {
                onSuccess: () => navigate("/portal/leads", { replace: true })
              })
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="cur">Current password</Label>
              <Input
                id="cur"
                type="password"
                autoComplete="current-password"
                className="min-h-11"
                {...form.register("currentPassword")}
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nw">New password (8–128 characters)</Label>
              <Input
                id="nw"
                type="password"
                autoComplete="new-password"
                className="min-h-11"
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="min-h-11 w-full" disabled={change.isPending}>
              {change.isPending ? "Saving…" : "Save password"}
            </Button>
            {!data.user.mustChangePassword && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full"
                onClick={() => navigate("/portal/leads", { replace: true })}
              >
                Cancel
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
