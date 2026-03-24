import { portalApi } from "@/lib/portal-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.15),_transparent_40%),_#020617] px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-lg rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Shyara Sales Portal</p>
        <h1 className="mt-3 text-3xl font-semibold">Login to continue</h1>
        <p className="mt-2 text-sm text-slate-400">
          Use your assigned company credentials. Temporary passwords must be changed after login.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none ring-0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none ring-0"
            />
          </label>
          {error ? <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
          >
            {login.isPending ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
