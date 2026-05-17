import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  forcedChangePasswordSchema,
  voluntaryChangePasswordSchema
} from "../validation/schemas";
import { useChangePasswordMutation, useSessionQuery } from "../hooks/useSalesQueries";
import { PasswordField } from "../components/PasswordField";
import { Button } from "@/components/ui/button";
import { ApiError } from "../api/client";
import { getSafePortalReturnPath } from "../lib/sanitizeRedirect";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type ForcedForm = z.infer<typeof forcedChangePasswordSchema>;
type VoluntaryForm = z.infer<typeof voluntaryChangePasswordSchema>;

function ChangePasswordForm({
  forced,
  intendedDestination
}: {
  forced: boolean;
  intendedDestination: string;
}) {
  const navigate = useNavigate();
  const change = useChangePasswordMutation();

  const form = useForm<ForcedForm | VoluntaryForm>({
    resolver: zodResolver(forced ? forcedChangePasswordSchema : voluntaryChangePasswordSchema),
    defaultValues: forced
      ? { newPassword: "", confirmPassword: "" }
      : { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  const onSubmit = (values: ForcedForm | VoluntaryForm) => {
    const body =
      "currentPassword" in values && values.currentPassword
        ? { newPassword: values.newPassword, currentPassword: values.currentPassword }
        : { newPassword: values.newPassword };

    change.mutate(body, {
      onSuccess: () => {
        toast.success("Password updated. Welcome to the portal.");
        navigate(intendedDestination, { replace: true });
      },
      onError: (e) => {
        if (e instanceof ApiError && e.code === "INVALID_PASSWORD" && !forced) {
          form.setError("currentPassword", { message: "Current password is incorrect." });
        }
      }
    });
  };

  const focusFirstError = () => {
    const keys = Object.keys(form.formState.errors);
    if (keys.length === 0) return;
    const idMap: Record<string, string> = {
      currentPassword: "change-current-password",
      newPassword: "change-new-password",
      confirmPassword: "change-confirm-password"
    };
    document.getElementById(idMap[keys[0]!])?.focus();
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(ev) => {
        void form.handleSubmit(onSubmit, () => focusFirstError())(ev);
      }}
    >
      {!forced && (
        <PasswordField
          id="change-current-password"
          label="Current password"
          autoComplete="current-password"
          autoFocus
          registration={form.register("currentPassword")}
          error={(form.formState.errors as { currentPassword?: { message?: string } }).currentPassword}
        />
      )}

      <PasswordField
        id="change-new-password"
        label="New password"
        autoComplete="new-password"
        autoFocus={forced}
        registration={form.register("newPassword")}
        error={form.formState.errors.newPassword}
        hint="Use at least 8 characters. A longer password is usually safer."
      />

      <PasswordField
        id="change-confirm-password"
        label="Confirm new password"
        autoComplete="new-password"
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword}
      />

      <Button type="submit" className="min-h-11 w-full" disabled={change.isPending}>
        {change.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Save Password"
        )}
      </Button>

      {!forced && (
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full"
          onClick={() => navigate(intendedDestination, { replace: true })}
        >
          Cancel
        </Button>
      )}
    </form>
  );
}

export function PortalChangePasswordPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data, isLoading } = useSessionQuery();

  const intendedDestination = getSafePortalReturnPath(
    "/portal/leads",
    searchParams.get("returnTo"),
    (location.state as { from?: string } | null)?.from
  );

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-2" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!data?.user) {
    return <Navigate to="/portal/login" replace />;
  }

  const forced = data.user.mustChangePassword;

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-2">
      <div
        className={cn(
          "relative hidden flex-col justify-between overflow-hidden border-border p-8 text-primary-foreground md:flex",
          "bg-gradient-to-br from-primary/90 via-primary/75 to-background"
        )}
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14),transparent_50%)] motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="relative z-10 space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-primary-foreground/80">Shyara</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground">
            {forced ? "Secure your account" : "Update your password"}
          </h1>
          <p className="max-w-sm text-sm text-primary-foreground/85">
            {forced
              ? "Choose a personal password you have not shared with anyone. You will use it for every future sign-in."
              : "Pick a strong password you do not use elsewhere."}
          </p>
        </div>
        <ul className="relative z-10 max-w-sm space-y-2 text-xs text-primary-foreground/80">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Passwords are hashed before storage.</span>
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Your session stays in an httpOnly cookie.</span>
          </li>
        </ul>
      </div>

      <main className="flex min-h-dvh flex-col [touch-action:manipulation]">
        <header className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 px-3 py-2 md:px-4">
          <div className="mr-auto flex items-center gap-2 md:hidden">
            <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-semibold">Change password</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col justify-center px-3 py-8 md:px-10">
          <div
            className={cn(
              "mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-card md:p-8",
              "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-reduce:animate-none"
            )}
          >
            <div className="mb-6 space-y-1">
              <h2 className="text-balance text-2xl font-semibold tracking-tight">
                {forced ? "Set a new password" : "Change password"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {forced
                  ? "Set a new password to continue into the portal."
                  : "Enter your current password, then choose a new one."}
              </p>
            </div>

            <ul className="mb-6 space-y-1.5 text-xs text-muted-foreground md:hidden">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Passwords are hashed before storage.</span>
              </li>
              <li className="flex gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>httpOnly session cookie.</span>
              </li>
            </ul>

            <ChangePasswordForm
              key={forced ? "forced" : "voluntary"}
              forced={forced}
              intendedDestination={intendedDestination}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
