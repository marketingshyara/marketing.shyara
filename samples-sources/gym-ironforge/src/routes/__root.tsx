import {
  Outlet,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { shyaraFaviconLinks } from "@/lib/shyaraFaviconLinks";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route doesn't exist. Let's get you back to the gym floor.
        </p>
        <Link to="/" className="btn-primary mt-6 focus-ring">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-2xl">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-primary focus-ring"
          >
            Try again
          </button>
          <Link to="/" className="btn-secondary focus-ring">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IronForge — Premium Strength & Conditioning Gym" },
      { name: "description", content: "IronForge is a premium gym for strength, conditioning, boxing and HIIT. Train with elite coaches in a world-class facility." },
      { property: "og:title", content: "IronForge — Premium Strength & Conditioning Gym" },
      { name: "twitter:title", content: "IronForge — Premium Strength & Conditioning Gym" },
      { property: "og:description", content: "IronForge is a premium gym for strength, conditioning, boxing and HIIT. Train with elite coaches in a world-class facility." },
      { name: "twitter:description", content: "IronForge is a premium gym for strength, conditioning, boxing and HIIT. Train with elite coaches in a world-class facility." },
      { name: "twitter:card", content: "summary" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, ...shyaraFaviconLinks()],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
