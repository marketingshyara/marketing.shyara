# Shyara marketing frontend (Vite + React)

## Sales portal

Authenticated staff use the **sales portal** at **`/portal`** (e.g. `http://localhost:8080/portal/login` in development).

- **Cookie sessions**: All API calls use `credentials: 'include'`. The backend sets an HTTP-only session cookie after login.
- **CORS**: If the UI and API are on different origins, add the frontend origin to the backend `ALLOWED_ORIGINS` list.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Optional API **origin** (no trailing slash). If unset, requests use relative `/api/...` (same origin). In dev, Vite proxies `/api` to the backend (see `vite.config.ts`). Example production: `https://api.example.com`. |
| `VITE_BACKEND_URL` | Used only by the **Vite dev server** proxy as the target for `/api` (default `http://localhost:4000`). Not baked into the client bundle. |
| `FRONTEND_PORT` | Dev server port (default `8080`). |

## Install & scripts

Install dependencies once from the **repository root** (npm workspaces):

```bash
npm install
```

Run the frontend dev server:

```bash
cd frontend
npm run dev
```

```bash
cd frontend
npm run build
```

Default ports: frontend **8080**, backend API **4000** (see backend `PORT`).

## Tech notes

- **TanStack Query** powers server state for the portal.
- **Themes**: `next-themes` with `defaultTheme="system"`, user override stored under `shyara-theme` in `localStorage`.
