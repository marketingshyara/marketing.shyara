import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { loginSchema } from "../validation/schemas";
import { useLoginMutation } from "../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "../api/client";
import { sanitizePortalRedirectPath } from "../lib/sanitizeRedirect";
import { toast } from "sonner";

export function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionToastShown = useRef(false);
  const from = sanitizePortalRedirectPath(
    (location.state as { from?: string } | null)?.from
  );
  const login = useLoginMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("reason") !== "session_expired" || sessionToastShown.current) return;
    sessionToastShown.current = true;
    toast.message("Your session expired. Sign in again.");
    const next = new URLSearchParams(searchParams);
    next.delete("reason");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-3 py-8">
      <Card className="w-full max-w-md border shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Sales portal</CardTitle>
          <CardDescription>Sign in with your Shyara account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              setSubmitError(null);
              login.mutate(values, {
                onSuccess: (data) => {
                  setSubmitError(null);
                  if (data.user.mustChangePassword) {
                    navigate("/portal/change-password", { replace: true });
                  } else {
                    navigate(from, { replace: true });
                  }
                },
                onError: (e) => {
                  if (e instanceof ApiError) {
                    if (e.code === "INVALID_CREDENTIALS") {
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
              });
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="min-h-11"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="min-h-11"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="min-h-11 w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
            <p className="min-h-[1.25rem] text-sm text-destructive" aria-live="polite">
              {submitError}
            </p>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              to="/"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Back to website
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
