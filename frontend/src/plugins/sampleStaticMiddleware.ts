import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";

/**
 * Vite dev/preview serves the marketing SPA for /samples/websites/<folder>/ because
 * of SPA fallback. Rewrite those requests to each sample's index.html in public/.
 */
function sampleStaticMiddleware(publicDir: string): Connect.NextHandleFunction {
  return (req, _res, next) => {
    const raw = req.url ?? "/";
    const [pathname, search = ""] = raw.split("?");
    if (!pathname.startsWith("/samples/websites/")) {
      return next();
    }

    const candidates: string[] = [];
    if (pathname.endsWith("/")) {
      candidates.push(`${pathname}index.html`);
    } else if (path.extname(pathname)) {
      candidates.push(pathname);
    } else {
      candidates.push(pathname, `${pathname}/index.html`);
    }

    for (const candidate of candidates) {
      const filePath = path.join(publicDir, candidate.replace(/^\//, ""));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        req.url = candidate + (search ? `?${search}` : "");
        break;
      }
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
