import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  forcedChangePasswordSchema,
  voluntaryChangePasswordSchema
} from "../validation/schemas";
import { errToast, useChangePasswordMutation, useSessionQuery } from "../hooks/useSalesQueries";
import { PasswordField } from "../components/PasswordField";
import { ApiError } from "../api/client";
import { resolvePortalDestination } from "../lib/portalPaths";
import { passwordCopy } from "../lib/passwordCopy";
import { toast } from "sonner";
import { BrutalButton, BrutalCard, BrutalEyebrow } from "../components/brutalist";
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
        toast.success(
          forced ? passwordCopy.forcedSuccessToast : passwordCopy.voluntarySuccessToast
        );
        navigate(intendedDestination, { replace: true });
      },
      onError: (e) => {
        if (e instanceof ApiError && e.code === "INVALID_PASSWORD" && !forced) {
          form.setError("currentPassword", {
            message: passwordCopy.currentPasswordIncorrect
          });
          return;
        }
        errToast(e);
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
      {forced ? (
        <div
          className="border-2 border-[#0A0A0A] border-l-[4px] border-l-[#FF3333] bg-[#FAFAFA] px-3 py-2.5 text-sm text-[#0A0A0A]"
          role="status"
        >
          {passwordCopy.forcedBanner}
        </div>
      ) : null}

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

      <BrutalButton type="submit" className="w-full touch-manipulation" disabled={change.isPending}>
        {change.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            {passwordCopy.savePasswordPending}
          </>
        ) : forced ? (
          passwordCopy.forcedSubmit
        ) : (
          passwordCopy.voluntarySubmit
        )}
      </BrutalButton>

      {!forced && (
        <BrutalButton
          type="button"
          variant="ghost"
          className="w-full touch-manipulation"
          onClick={() => navigate(intendedDestination, { replace: true })}
        >
          Cancel
        </BrutalButton>
      )}
    </form>
  );
}

export function PortalChangePasswordPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data, isLoading } = useSessionQuery();

  const intendedDestination = data?.user
    ? resolvePortalDestination(
        data.user.role,
        searchParams.get("returnTo"),
        (location.state as { from?: string } | null)?.from
      )
    : "/portal/pipeline";

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
    <div className="min-h-dvh bg-[#FAFAFA] md:grid md:grid-cols-2">
      <div
        className="portal-grid-bg relative hidden flex-col justify-between border-r-2 border-[#0A0A0A] bg-white p-8 md:flex"
        aria-hidden
      >
        <div className="space-y-4">
          <p className="font-logo text-2xl">
            SHYARA<span className="text-[#FF3333]">.</span>
          </p>
          <BrutalEyebrow>{forced ? "Required" : "Security"}</BrutalEyebrow>
          <h1 className="font-heading text-balance text-3xl font-black uppercase leading-tight tracking-tight text-[#0A0A0A]">
            {forced ? passwordCopy.forcedHeroTitle : passwordCopy.voluntaryHeroTitle}
          </h1>
          <p className="max-w-sm text-sm text-[#0A0A0A]/70">
            {forced ? passwordCopy.forcedHeroBody : passwordCopy.voluntaryHeroBody}
          </p>
        </div>
        <ul className="max-w-sm space-y-2 text-xs font-bold uppercase tracking-wide text-[#0A0A0A]/70">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3333]" aria-hidden />
            <span>Passwords are hashed before storage.</span>
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3333]" aria-hidden />
            <span>Your session stays in an httpOnly cookie.</span>
          </li>
        </ul>
      </div>

      <main className="flex min-h-dvh flex-col [touch-action:manipulation]">
        <header className="flex items-center border-b-2 border-[#0A0A0A] bg-white px-4 py-3 md:hidden">
          <KeyRound className="mr-2 h-4 w-4 text-[#FF3333]" aria-hidden />
          <span className="text-sm font-bold uppercase tracking-wide">
            {forced ? passwordCopy.setYourPassword : passwordCopy.changePassword}
          </span>
        </header>

        <div className="flex flex-1 flex-col justify-center px-4 py-8 md:px-10">
          <BrutalCard className="mx-auto w-full max-w-md">
            <div className="mb-6 space-y-2">
              <BrutalEyebrow>{forced ? passwordCopy.setYourPassword : passwordCopy.changePassword}</BrutalEyebrow>
              <h2 className="font-heading text-balance text-2xl font-black uppercase tracking-tight">
                {forced ? passwordCopy.forcedFormTitle : passwordCopy.voluntaryFormTitle}
              </h2>
              <p className="text-sm text-[#0A0A0A]/60">
                {forced ? passwordCopy.forcedFormSubtitle : passwordCopy.voluntaryFormSubtitle}
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
          </BrutalCard>
        </div>
      </main>
    </div>
  );
}
