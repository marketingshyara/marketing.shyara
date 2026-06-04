import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";

const SAMPLE_WEBSITES_PREFIX = "/samples/websites/";

function resolveSampleFile(publicDir: string, pathname: string): string | null {
  const relative = pathname.replace(/^\//, "");
  const filePath = path.join(publicDir, relative);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return pathname;
  }
  return null;
}

function sampleSlugFromPath(pathname: string): string | null {
  if (!pathname.startsWith(SAMPLE_WEBSITES_PREFIX)) return null;
  const rest = pathname.slice(SAMPLE_WEBSITES_PREFIX.length);
  const slug = rest.split("/")[0];
  return slug || null;
}

/**
 * Vite dev/preview: serve static sample assets and SPA fallback to each sample's index.html.
 */
function sampleStaticMiddleware(publicDir: string): Connect.NextHandleFunction {
  return (req, _res, next) => {
    const raw = req.url ?? "/";
    const [pathname, search = ""] = raw.split("?");
    if (!pathname.startsWith(SAMPLE_WEBSITES_PREFIX)) {
      return next();
    }

    const slug = sampleSlugFromPath(pathname);
    if (!slug) return next();

    const sampleIndex = `${SAMPLE_WEBSITES_PREFIX}${slug}/index.html`;
    const candidates: string[] = [];

    if (pathname.endsWith("/")) {
      candidates.push(`${pathname}index.html`);
    } else if (path.extname(pathname)) {
      candidates.push(pathname);
    } else {
      candidates.push(pathname, `${pathname}/index.html`, sampleIndex);
    }

    for (const candidate of candidates) {
      const resolved = resolveSampleFile(publicDir, candidate);
      if (resolved) {
        req.url = resolved + (search ? `?${search}` : "");
        return next();
      }
    }

    const fallback = resolveSampleFile(publicDir, sampleIndex);
    if (fallback && !pathname.includes("/assets/")) {
      req.url = fallback + (search ? `?${search}` : "");
    }

    next();
  };
}

export function sampleStaticMiddlewarePlugin(): Plugin {
  return {
    name: "sample-static-middleware",
    configureServer(server) {
      server.middlewares.use(sampleStaticMiddleware(server.config.publicDir));
    },
    configurePreviewServer(server) {
      server.middlewares.use(sampleStaticMiddleware(server.config.publicDir));
    },
  };
}
