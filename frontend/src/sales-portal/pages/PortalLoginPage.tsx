import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { loginSchema } from "../validation/schemas";
import { useLoginMutation } from "../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiError } from "../api/client";
import { getSafePortalReturnPath } from "../lib/sanitizeRedirect";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

function formatLockoutWait(seconds: number): string {
  if (seconds >= 120) {
    const m = Math.round(seconds / 60);
    return `${m} minutes`;
  }
  if (seconds >= 60) {
    return "1 minute";
  }
  return `${seconds} seconds`;
}

export function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionToastShown = useRef(false);
  const strippedReturnTo = useRef(false);
  const intendedDestinationRef = useRef<string | null>(null);
  if (intendedDestinationRef.current === null) {
    intendedDestinationRef.current = getSafePortalReturnPath(
      "/portal/leads",
      searchParams.get("returnTo"),
      (location.state as { from?: string } | null)?.from
    );
  }
  const intendedDestination = intendedDestinationRef.current;

  const login = useLoginMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [highlightError, setHighlightError] = useState(false);

  const statusPageUrl = (import.meta.env.VITE_STATUS_PAGE_URL as string | undefined)?.trim();

  useEffect(() => {
    if (searchParams.get("reason") !== "session_expired" || sessionToastShown.current) return;
    sessionToastShown.current = true;
    toast.message("Your session expired. Sign in again.");
    const next = new URLSearchParams(searchParams);
    next.delete("reason");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!searchParams.get("returnTo") || strippedReturnTo.current) return;
    strippedReturnTo.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete("returnTo");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (lockoutSecondsLeft == null || lockoutSecondsLeft <= 0) return;
    const t = window.setInterval(() => {
      setLockoutSecondsLeft((s) => (s == null ? s : Math.max(0, s - 1)));
    }, 1000);
    return () => window.clearInterval(t);
  }, [lockoutSecondsLeft]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberDevice: false }
  });

  const rememberDevice = !!form.watch("rememberDevice");

  const triggerErrorHighlight = () => {
    setHighlightError(true);
    window.setTimeout(() => setHighlightError(false), 600);
  };

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
          <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground">Sales portal</h1>
          <p className="max-w-sm text-sm text-primary-foreground/85">
            Manage leads, commissions, and projects in one place.
          </p>
        </div>
        <ul className="relative z-10 max-w-sm space-y-2 text-xs text-primary-foreground/80">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Sign-in traffic uses HTTPS encryption.</span>
          </li>
          <li className="flex gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Your session is kept in an httpOnly cookie (not readable by page scripts).</span>
          </li>
        </ul>
      </div>

      <div className="flex min-h-dvh flex-col">
        <header className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 px-3 py-2 md:px-4">
          <div className="mr-auto flex items-center gap-2 md:hidden">
            <span className="text-sm font-semibold">Sales portal</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col justify-center px-3 py-8 md:px-10">
          <div
            className={cn(
              "mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-card transition-shadow md:p-8",
              highlightError && "ring-2 ring-destructive/50 motion-safe:animate-pulse"
            )}
          >
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground">Use your Shyara account credentials.</p>
            </div>

            <ul className="mb-6 space-y-1.5 text-xs text-muted-foreground md:hidden">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>HTTPS encryption in transit.</span>
              </li>
              <li className="flex gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span>httpOnly session cookie.</span>
              </li>
            </ul>

            <form
              className="space-y-4"
              noValidate
              onSubmit={(ev) => {
                if (step === "email") {
                  ev.preventDefault();
                  void (async () => {
                    const ok = await form.trigger("email");
                    if (ok) setStep("password");
                  })();
                  return;
                }
                void form.handleSubmit((values) => {
                  if (lockoutSecondsLeft != null && lockoutSecondsLeft > 0) return;
                  setSubmitError(null);
                  login.mutate(
                    {
                      email: values.email.trim(),
                      password: values.password,
                      rememberDevice: values.rememberDevice
                    },
                    {
                      onSuccess: (data) => {
                        setSubmitError(null);
                        setLockoutSecondsLeft(null);
                        if (data.user.mustChangePassword) {
                          navigate("/portal/change-password", {
                            replace: true,
                            state: { from: intendedDestination }
                          });
                        } else {
                          navigate(intendedDestination, { replace: true });
                        }
                      },
                      onError: (e) => {
                        triggerErrorHighlight();
                        if (e instanceof ApiError) {
                          if (e.code === "INVALID_CREDENTIALS") {
                            if (e.retryAfterSeconds != null && e.retryAfterSeconds > 0) {
                              setLockoutSecondsLeft(e.retryAfterSeconds);
                              const wait = formatLockoutWait(e.retryAfterSeconds);
                              const msg = `${e.message} Too many attempts — try again in about ${wait}.`;
                              setSubmitError(msg);
                              toast.error(msg);
                              return;
                            }
                            setLockoutSecondsLeft(null);
                            setSubmitError(e.message);
                            toast.error(e.message);
                            return;
                          }
                          if (e.code === "INTERNAL" || e.code === "UNKNOWN") {
                            const msg =
                              "Something went wrong on the server. Try again in a moment or contact support.";
                            setSubmitError(msg);
                            toast.error(msg);
                            return;
                          }
                          setSubmitError(e.message);
                          toast.error(e.message);
                          return;
                        }
                        const msg =
                          "Could not reach the server. Check your connection and that the API URL is configured.";
                        setSubmitError(msg);
                        toast.error(msg);
                      }
                    }
                  );
                })(ev);
              }}
            >
              <div className={step === "email" ? "space-y-2" : "sr-only"}>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  spellCheck={false}
                  tabIndex={step === "email" ? 0 : -1}
                  className="min-h-11"
                  aria-invalid={!!form.formState.errors.email}
                  aria-describedby={form.formState.errors.email ? "login-email-error" : undefined}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p id="login-email-error" className="text-sm font-medium text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {step === "email" ? (
                <Button type="submit" className="min-h-11 w-full">
                  Continue
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-10 px-2"
                      onClick={() => {
                        setStep("email");
                        setSubmitError(null);
                      }}
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                      Back
                    </Button>
                    <p className="truncate text-sm text-muted-foreground" title={form.getValues("email")}>
                      {form.getValues("email")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="min-h-11 pr-12"
                        aria-invalid={!!form.formState.errors.password}
                        aria-describedby={
                          form.formState.errors.password ? "login-password-error" : "login-password-hint"
                        }
                        {...form.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0.5 top-1/2 min-h-10 min-w-10 -translate-y-1/2"
                        aria-pressed={showPassword}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p id="login-password-hint" className="sr-only">
                      Password visibility can be toggled with the adjacent button.
                    </p>
                    {form.formState.errors.password && (
                      <p id="login-password-error" className="text-sm font-medium text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor="remember-device">
                    <Checkbox
                      id="remember-device"
                      checked={rememberDevice}
                      onCheckedChange={(c) =>
                        form.setValue("rememberDevice", c === true, { shouldDirty: true, shouldTouch: true })
                      }
                    />
                    <span>Remember this device</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Keeps you signed in longer on this browser via the session cookie only. Never stores your
                    password.
                  </p>

                  <Button
                    type="submit"
                    className="min-h-11 w-full"
                    disabled={login.isPending || (lockoutSecondsLeft != null && lockoutSecondsLeft > 0)}
                  >
                    {login.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Signing in…
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </>
              )}

              <p className="min-h-[1.25rem] text-sm text-destructive" role="alert" aria-live="polite">
                {submitError}
              </p>
              {lockoutSecondsLeft != null && lockoutSecondsLeft > 0 && (
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  Try again in {formatLockoutWait(lockoutSecondsLeft)}.
                </p>
              )}
            </form>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-center text-xs text-muted-foreground">
              {statusPageUrl ? (
                <a
                  href={statusPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Service status
                </a>
              ) : null}
              <Link to="/privacy-policy" className="hover:text-foreground underline underline-offset-4">
                Privacy policy
              </Link>
              <p>If you cannot sign in, ask an administrator to reset your password.</p>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                to="/"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Back to website
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
