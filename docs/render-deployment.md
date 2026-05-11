# Render: full settings (PostgreSQL + Backend + Frontend)

Monorepo: **`marketingshyara/marketing.shyara`**, branch **`main`**. Workspaces: `backend`, `frontend`.

**Create order:** (1) PostgreSQL → (2) Backend Web Service (link DB) → (3) Frontend Static Site → (4) set env vars and redeploy.

---

## 1. PostgreSQL (`marketing-shyara-db`)

### Create (Dashboard → New → PostgreSQL)

| Setting | Recommended value |
|--------|---------------------|
| **Name** | `marketing-shyara-db` (or your choice) |
| **Region** | **Singapore** (same as your web services) |
| **PostgreSQL version** | Default / 18 (as on your instance) |
| **Instance type** | Basic or Free (per your plan) |
| **Database name** | Auto (e.g. `marketing_shyara_db`) — note from dashboard |
| **User** | Auto — note from dashboard |

### After creation — values you will copy

| Field | Where used |
|-------|------------|
| **Internal Database URL** | `DATABASE_URL` on **Backend** only (same region, private) |
| **External Database URL** | Local dev / tools only — **not** required on Render backend if internal works |
| **Hostname / Port / Database / User / Password** | Shown under **Connections** |

**Networking:** Inbound `0.0.0.0/0` is common for managed Postgres; backend connects via **internal** URL from the same Render account/region.

**Migrations:** Applied by the **backend Pre-Deploy** command (below), not manually on the DB dashboard.

#### If Pre-Deploy fails with `P3005` (schema is not empty)

This means Postgres already has tables (for example from an earlier `prisma db push` or manual setup), but Prisma Migrate has **no** `_prisma_migrations` history yet, so `migrate deploy` refuses to run.

**Only do this if the live database schema already matches** what your committed migrations would create (same tables/columns as `backend/prisma/migrations/`). If you are unsure, inspect the DB or compare with a fresh `migrate deploy` on an empty database.

1. Open **Render → your Backend → Shell**. The service injects **`DATABASE_URL`** automatically (same DB Pre-Deploy uses).

2. Run **one** of the following **once**. Prefer the Prisma CLI block: it works even when the Shell’s disk is still on an **older deploy** that does not include the workspace npm scripts yet (a failed Pre-Deploy can leave you in that state).

   **Option A — Prisma CLI (recommended in Shell)**

   ```bash
   cd ~/project/src/backend
   npx prisma migrate resolve --applied 20260210150000_init --schema prisma/schema.prisma
   npx prisma migrate resolve --applied 20260211120000_hardening --schema prisma/schema.prisma
   ```

   If `npx prisma` is slow or fails offline, try the local binary after a successful build:

   ```bash
   cd ~/project/src/backend
   ./node_modules/.bin/prisma migrate resolve --applied 20260210150000_init --schema prisma/schema.prisma
   ./node_modules/.bin/prisma migrate resolve --applied 20260211120000_hardening --schema prisma/schema.prisma
   ```

   **Option B — npm (needs a checkout that includes the script in `backend/package.json`)**

   From repo root `~/project/src`:

   ```bash
   npm run db:migrate:baseline-existing --workspace backend
   ```

   If your root `package.json` already has the helper, you can instead run:

   ```bash
   npm run backend:db:migrate:baseline
   ```

3. Trigger a **new deploy** (or let auto-deploy run). `npm run db:migrate:deploy --workspace backend` should then exit successfully.

If the database schema does **not** match the migration files, do **not** baseline blindly: fix the schema (or reset a disposable DB), then use normal `migrate deploy`.

---

## 2. Backend Web Service (`marketing.shyara-backend`)

### General

| Setting | Value |
|--------|--------|
| **Type** | Web Service |
| **Name** | `marketing.shyara-backend` |
| **Region** | **Singapore** (match DB) |
| **Branch** | `main` |
| **Root Directory** | *(leave empty)* — repo root |
| **Runtime** | **Node** |
| **Instance type** | Free / paid per your plan |
| **Build Command** | `npm install && npm run backend:prisma:generate && npm run build --workspace backend` |
| **Pre-Deploy Command** | `npm run db:migrate:deploy --workspace backend` |
| **Start Command** | `node backend/dist/server.js` |
| **Auto-Deploy** | On Commit (or Manual if you prefer) |

**Important:** The compiled entry file is **`backend/dist/server.js`**.  
**Wrong:** `node backend/dist/src/server.js` (file does not exist → crash on start).

### Source / repo

| Setting | Value |
|--------|--------|
| **Repository** | `https://github.com/marketingshyara/marketing.shyara` |
| **Branch** | `main` |
| **Git credentials** | Your linked GitHub account |

### Environment variables (Backend → Environment)

Set **all** of these in the Render UI (or Blueprint). Do not commit secrets.

#### Required

| Key | Example / rule |
|-----|----------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Paste **Internal Database URL** from the Render Postgres dashboard (starts with `postgresql://`). |
| `SESSION_SECRET` | Long random string (32+ characters). Generate once and keep stable. |
| `ALLOWED_ORIGINS` | Comma-separated list, **exact** browser origins, **no trailing slash**. Must include every URL where users open the site. Examples: `https://your-static-site.onrender.com`, `https://www.shyara.co.in`, `https://shyara.co.in` |

#### Strongly recommended (Render production)

| Key | Value |
|-----|--------|
| `TRUST_PROXY` | `true` |
| `COOKIE_SECURE` | `true` (with `TRUST_PROXY=true`, the app uses the session plugin’s `secure: "auto"` so cookies still work if the proxy scheme is detected correctly) |

#### Cross-site cookie (SPA on custom domain, API on `onrender.com`)

If the **site origin** and **API origin** are different **sites** (e.g. `https://marketing.example.com` vs `https://marketing-shyara-backend.onrender.com`):

| Key | Value |
|-----|--------|
| `COOKIE_SAMESITE` | `none` |

If both are subdomains of the **same** registrable domain (e.g. `app.example.com` + `api.example.com`), you can often use `lax` (default).

`COOKIE_SAMESITE=none` forces secure cookies (HTTPS); the app enforces that.

#### Optional (defaults exist — see `backend/.env.example`)

| Key | Purpose |
|-----|---------|
| `COOKIE_NAME` | Session cookie name (default `shyara_sales_session`) |
| `SESSION_MAX_AGE_SECONDS` | Default `604800` (7 days) |
| `LOGIN_RATE_LIMIT_MAX` | Default `5` |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | Default `900000` |
| `BCRYPT_ROUNDS` | Default `10` |
| `BOOTSTRAP_ADMIN_EMAIL` | One-time first admin (optional) |
| `BOOTSTRAP_ADMIN_PASSWORD` | One-time first admin (optional) |
| `BOOTSTRAP_ADMIN_DISPLAY_NAME` | One-time first admin (optional) |

#### Do not set unless you know why

| Key | Notes |
|-----|--------|
| `PORT` | Render injects `PORT` automatically. |

### Deploy / health

| Setting | Value |
|--------|--------|
| **Health Check Path** | `/api/health` |
| **Health Check** | Leave defaults unless you need stricter timing |

### Custom domains (optional)

| Setting | Notes |
|--------|--------|
| **Custom Domain** | e.g. `api.shyara.co.in` — add DNS per Render instructions |
| **onrender.com subdomain** | e.g. `https://marketing-shyara-backend.onrender.com` |

If you add a custom domain for the API, add that **origin** to `ALLOWED_ORIGINS` only if the browser ever loads pages from it (usually the **frontend** origins matter for CORS; the API URL is for `fetch`, not `Origin` for page loads — still list all **frontend** origins).

### Post-deploy API checks

```text
GET https://<your-backend-host>/api/health
→ {"ok":true}

GET https://<your-backend-host>/api/health?deep=1
→ {"ok":true,"deep":true,"database":"ok"}   (checks DB)
```

---

## 3. Frontend Static Site (new service on Render)

Use **Static Site** (not Node Web Service) for the Vite build output.

### General / build

| Setting | Value |
|--------|--------|
| **Name** | e.g. `marketing.shyara-frontend` |
| **Region** | **Singapore** (optional for static; can match team preference) |
| **Branch** | `main` |
| **Root Directory** | *(empty)* |
| **Build Command** | `npm install && npm run build --workspace frontend` |
| **Publish Directory** | `frontend/dist` |

### Environment variables (build-time)

Vite reads these **during `npm run build`**. Changing them requires a **rebuild**.

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://marketing-shyara-backend.onrender.com` — **no trailing slash**. Use your real backend URL (custom domain if applicable). |

If you use same-origin proxying later and bake empty API URL, set nothing — only for advanced setups.

### SPA routing (reload `/portal/...` without 404)

React Router needs the static host to **rewrite** unknown paths to `index.html`. **Render Static Sites do not read `_redirects`** (that file helps Netlify / Cloudflare Pages).

**On Render — pick one:**

1. **Dashboard (fastest if you already have the static site):** open the static site → **Redirects / Rewrites** → add:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** **Rewrite** (not Redirect)

2. **Blueprint:** the repo root [`render.yaml`](../render.yaml) defines the same rewrite for a service named `marketing.shyara-frontend`. Sync or apply the blueprint if you use IaC; rename the service in YAML if yours differs.

**Also in the repo:** [`frontend/public/_redirects`](../frontend/public/_redirects) is copied into `dist` for hosts that support it (e.g. Netlify).

### Custom domain (optional)

Point your marketing domain to this static site; then add **`https://that-exact-origin`** to backend **`ALLOWED_ORIGINS`**.

---

## 4. Cross-service checklist (must match)

1. **Backend `ALLOWED_ORIGINS`** includes every HTTPS origin where the SPA is served (including `www` and non-`www` if both used).
2. **`VITE_API_BASE_URL`** matches the backend URL you want browsers to call.
3. If login fails with CORS: fix `ALLOWED_ORIGINS`.
4. If login fails with no cookie / 401 on next request: try **`COOKIE_SAMESITE=none`** when frontend and API are different sites (see above).
5. **Pre-Deploy** migrations: first deploy after schema changes must succeed (`db:migrate:deploy`).

---

## 5. First-time bootstrap admin (optional)

With env set on the backend, run once locally or via Render **Shell** (if available on your plan):

```bash
npm run backend:seed
```

Requires `BOOTSTRAP_ADMIN_*` in env and a working `DATABASE_URL`. Remove or rotate bootstrap secrets after use if policy requires.

---

## 6. Summary table — copy/paste commands

| Service | Build | Pre-Deploy | Start / Publish |
|--------|-------|------------|------------------|
| **Postgres** | — | — | — |
| **Backend** | `npm install && npm run backend:prisma:generate && npm run build --workspace backend` | `npm run db:migrate:deploy --workspace backend` | `node backend/dist/server.js` |
| **Frontend (Static)** | `npm install && npm run build --workspace frontend` | — | **Publish:** `frontend/dist` |

---

## 7. What to fix if you had old Render settings

| Old / wrong | Correct |
|-------------|---------|
| Start: `node backend/dist/src/server.js` | `node backend/dist/server.js` |
| No Pre-Deploy | Add `npm run db:migrate:deploy --workspace backend` |
| `DATABASE_URL` = external only | Prefer **Internal** URL for backend on Render |
| Missing `ALLOWED_ORIGINS` | Add exact frontend URL(s) |
| API on onrender.com + SPA on another domain, login broken | Set `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true` |
| SPA 404 on refresh (portal reload) | **Render:** Static site → Redirects/Rewrites → `/*` → `/index.html` **Rewrite**; or sync [`render.yaml`](../render.yaml). **Netlify/CF:** `_redirects` in `frontend/public` (copied to `dist`) and rebuild |

---

## 8. Smoke tests (login and sales rep onboarding)

After each deploy or env change, verify:

1. **API health:** `GET https://<backend>/api/health` → `{"ok":true}`. Optional: `?deep=1` → `"database":"ok"`.
2. **Env sanity:** Backend `SESSION_SECRET` at least **32 characters** (required by `@fastify/session`). `TRUST_PROXY=true`, `COOKIE_SECURE=true`, and `ALLOWED_ORIGINS` listing the **exact** static-site origin(s). Frontend build has `VITE_API_BASE_URL` = backend URL with **no** trailing slash.
3. **Login:** Open the SPA → Sales portal → sign in with a known user. Expect **200** on `POST .../api/auth/login` and redirect into the app (or to change-password if `mustChangePassword` is set).
4. **Create sales rep (admin):** As admin, **Users** → **Add user** → role **Sales rep**, leave password empty → **Create**. A dialog must show the **temporary password**; the new user must have **must change password** on first login. Creating the same email again must return **409** with a clear error (duplicate email).
5. **Cross-origin cookies:** If the static site origin and API origin are different **sites** (e.g. custom domain vs `*.onrender.com`), set **`COOKIE_SAMESITE=none`** on the backend and confirm the session cookie is sent on subsequent API calls (browser DevTools → Network → request headers).
