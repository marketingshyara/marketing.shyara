import { portalButtonPrimaryClass, portalButtonSecondaryClass, portalInputClass } from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, UserCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import shyaraLogo from "@/assets/shyara-logo.png";

const testAccounts = [
  { label: "Admin", email: "admin@shyara.local", password: "password123", note: "Forced password change after login." },
  { label: "Sales", email: "sales@shyara.local", password: "password123", note: "Sales associate flow." },
  { label: "Operations", email: "ops@shyara.local", password: "password123", note: "Operations delivery flow." }
];

export default function PortalLoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: ({ userEmail, userPassword }: { userEmail: string; userPassword: string }) =>
      portalApi.login(userEmail, userPassword),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-session"] });
      navigate((location.state as { from?: string } | null)?.from ?? "/sales-portal/dashboard", { replace: true });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    login.mutate({ userEmail: email, userPassword: password });
  };

  const fillCredentials = async (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    try {
      await navigator.clipboard.writeText(`${nextEmail}\n${nextPassword}`);
    } catch {
      // Clipboard access can fail in some browser contexts; form fill still works.
    }
  };

  return (
    <div className="portal-shell flex min-h-screen items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-card border border-border bg-card p-8 shadow-card md:p-10">
          <div className="flex items-center gap-3">
            <img src={shyaraLogo} alt="Shyara Marketing" className="h-11 w-auto" />
            <div>
              <p className="text-lg font-extrabold tracking-tight text-accent">Shyara Marketing</p>
              <p className="text-caption uppercase tracking-[0.2em] text-muted-foreground">Internal Sales Portal</p>
            </div>
          </div>

          <p className="portal-eyebrow mt-8">Portal Access</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Login and test the portal quickly
          </h1>
          <p className="mt-3 max-w-2xl text-body text-muted-foreground">
            The portal now follows the same visual direction as the main site: lighter surfaces, cleaner spacing, and stronger text contrast.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={portalInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={portalInputClass}
              />
            </label>
            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={login.isPending}
              className={cn(portalButtonPrimaryClass, "w-full")}
            >
              {login.isPending ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>

        <section className="rounded-card border border-border bg-[hsl(var(--surface))] p-8 shadow-card md:p-10">
          <div className="flex items-start gap-3">
            <div className="icon-well">
              <KeyRound className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="portal-eyebrow">Local Test Accounts</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Copy, paste, and verify the portal directly from here</h2>
              <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                These seeded local credentials are shown only on the login page, as requested, so QA can jump between roles without hunting through the codebase.
              </p>
            </div>
          </div>

          <div className="portal-card-list mt-6">
            {testAccounts.map((account) => (
              <div key={account.email} className="portal-list-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <UserCircle2 className="h-4 w-4 text-accent" />
                      {account.label}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{account.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials(account.email, account.password)}
                    className={portalButtonSecondaryClass}
                  >
                    <Copy className="h-4 w-4" />
                    Copy and fill
                  </button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Test ID</p>
                    <p className="mt-2 break-all text-sm font-medium text-foreground">{account.email}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Password</p>
                    <p className="mt-2 break-all text-sm font-medium text-foreground">{account.password}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
