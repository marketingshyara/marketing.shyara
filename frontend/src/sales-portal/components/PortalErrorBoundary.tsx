import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultPortalHome } from "../lib/portalPaths";
import type { UserRole } from "../types";

type Props = {
  children: ReactNode;
  role?: UserRole;
};

type State = {
  error: Error | null;
};

export class PortalErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Portal error boundary:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const home = defaultPortalHome(this.props.role ?? "SALES_REP");
      return (
        <div
          className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 border-2 border-[#0A0A0A] bg-white px-6 py-8 text-center shadow-[4px_4px_0_0_#0A0A0A]"
          role="alert"
        >
          <AlertTriangle className="h-10 w-10 text-[#FF3333]" aria-hidden />
          <h1 className="font-heading text-xl font-black uppercase tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-[#0A0A0A]/60">
            This page hit an unexpected error. You can reload or return to your home screen. If
            this keeps happening, contact support.
          </p>
          <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={this.handleReload}>
              Reload page
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={this.handleReset}
            >
              Try again
            </Button>
            <Button asChild variant="secondary" className="min-h-11 w-full sm:w-auto">
              <Link to={home}>Go to home</Link>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
