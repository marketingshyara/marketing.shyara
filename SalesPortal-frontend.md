# Sales portal frontend integration guide

This document describes the **marketing-shyara-co-in** backend API so a new frontend can mirror naming, types, and behavior. The server is **Fastify 5** with **Prisma** on **PostgreSQL**, **cookie-based sessions** (not JWT), and **Zod** validation on inputs.

---

## 1. Base URL and environment

- Default API port: **`4000`** (override with `PORT`).
- All API routes in this guide are under **`/api/...`** unless noted.
- Backend config lives in [`backend/src/config.ts`](backend/src/config.ts). Relevant env vars (see [`backend/.env.example`](backend/.env.example)):
  - `DATABASE_URL` – PostgreSQL connection string
  - `SESSION_SECRET` – session encryption
  - `COOKIE_NAME` – session cookie name (default `shyara_sales_session`)
  - `COOKIE_SECURE` – `true` in production for `Secure` cookies
  - `TRUST_PROXY` – set when behind a reverse proxy
  - `ALLOWED_ORIGINS` – comma-separated origins allowed for **CORS** (browser clients must send `credentials: true` and match one of these)
  - `SESSION_MAX_AGE_SECONDS` – session cookie max-age (default 604800 = 7 days)
  - `LOGIN_RATE_LIMIT_MAX` / `LOGIN_RATE_LIMIT_WINDOW_MS` – login throttling
  - `BCRYPT_ROUNDS` – password hashing cost

---

## 2. Authentication and sessions

### Mechanism

- **Stateful sessions** via `@fastify/session` + `@fastify/cookie`.
- After login, the server sets an **HTTP-only** cookie (`COOKIE_NAME`), **`SameSite=Lax`**, path **`/`**, `Secure` when `COOKIE_SECURE=true`.
- Session payload keys (server-side): **`userId`**, **`role`** (mirrors `UserRole` enum).

### Browser / SPA requirements

- Send **`credentials: 'include'`** (fetch) or **`withCredentials: true`** (axios) on every API call that needs auth.
- Expect **401** when there is no valid session or the user is inactive (session is destroyed).

### Auth endpoints

| Method | Path | Auth | Body | Success response |
|--------|------|------|------|------------------|
| POST | `/api/auth/login` | No | `{ "email": string, "password": string }` | `{ "user": SessionUser }` |
| POST | `/api/auth/logout` | Yes | — | `{ "ok": true }` |
| GET | `/api/auth/session` | No (returns null if logged out) | — | `{ "user": SessionUser \| null }` |
| POST | `/api/auth/change-password` | Yes | `{ "newPassword": string (8–128 chars), "currentPassword"?: string }` — `currentPassword` required when `mustChangePassword` is false; omit when forced first-login change | `{ "user": SessionUser }` |

**`SessionUser`** shape (no password fields):

```json
{
  "id": "cuid",
  "email": "string",
  "displayName": "string | null",
  "role": "ADMIN" | "SALES_REP",
  "mustChangePassword": false
}
```

Note: **`GET /api/auth/session`** omits `isActive` from the JSON even though it is checked server-side.

Login failures use **401** with code **`INVALID_CREDENTIALS`**. Login route is **rate-limited** (configurable via env).

---

## 3. Roles and authorization

Enum **`UserRole`** (exact strings):

- **`ADMIN`**
- **`SALES_REP`**

Patterns:

- **`requireUser`**: any authenticated active user.
- **`requireAdmin`**: `role === "ADMIN"`; otherwise **403** `FORBIDDEN` / `"Admin access required."`

**Data visibility (high level):**

- **Leads**: Admins see all. Reps see leads where **`createdByUserId === me`** OR **`assignedToUserId === me`**.
- **Commissions**: Admins see all (optional `isPaid` filter). Reps see rows where **`repUserId === me`**.
- **Projects**: Admins see all. Reps see projects whose **lead** they created or are assigned to.
- **Users, activity logs, payment verification, commission mark-paid, project create/patch, settings PATCH, exports**: **admin only**.

---

## 4. Money, IDs, and dates

- **Monetary amounts** are **integers in minor units** (e.g. rupees → paise, dollars → cents). Field names end with **`Cents`**: `advanceAmountCents`, `finalQuoteCents`, `amountCents`, etc.
- **Commission rate** in portal settings is **`commissionRateBps`**: basis points out of 10 000 (e.g. **2000 = 20%**).
- **IDs** are **CUID** strings (`@default(cuid())` in Prisma).
- **Timestamps** are ISO **8601** strings in JSON (e.g. `createdAt`, `updatedAt`, `paidAt`).

---

## 5. Prisma enums (use these exact literals in TypeScript)

### `UserRole`

`ADMIN` | `SALES_REP`

### `LeadStatus`

Order reflects typical workflow (not a strict client-side enum ordering requirement):

`NEW` → `ADVANCE_PAID` → `BUILDING` → `PREVIEW_SENT` → `FINAL_PAID` → `DEPLOYED` → `COMMISSION_PAID`

### `PaymentKind`

`ADVANCE` | `FINAL`

### `PaymentVerificationStatus`

`PENDING` | `VERIFIED` | `REJECTED`

### `ActivityAction`

`LOGIN` | `LOGOUT` | `CREATE` | `UPDATE` | `DELETE` | `STATUS_CHANGE` | `PAYMENT_MARKED` | `PAYMENT_VERIFIED` | `COMMISSION_PAID` | `PASSWORD_CHANGED` | `EXPORT` | `SETTINGS_UPDATE`

---

## 6. Core domain models (JSON field names)

Align frontend types with Prisma model field names.

### `User` (API projections vary by route)

Common fields: `id`, `email`, `displayName`, `role`, `isActive`, `mustChangePassword`, `createdAt`, `updatedAt` (subset may be omitted on create responses).

### `Lead`

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | |
| `createdByUserId` | string | Always the user who created the row |
| `assignedToUserId` | string \| null | **Commission rep** when set: see §7 |
| `clientName` | string | |
| `clientEmail` | string \| null | |
| `clientPhone` | string \| null | |
| `notes` | string \| null | |
| `status` | `LeadStatus` | Default `NEW` |
| `advanceAmountCents` | number \| null | |
| `finalQuoteCents` | number \| null | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

### `LeadPayment`

| Field | Type |
|-------|------|
| `id` | string |
| `leadId` | string |
| `kind` | `PaymentKind` |
| `amountCents` | number |
| `repNote` | string \| null |
| `markedByUserId` | string |
| `markedAt` | string (ISO) |
| `verificationStatus` | `PaymentVerificationStatus` |
| `verifiedByUserId` | string \| null |
| `verifiedAt` | string \| null |
| `adminNote` | string \| null |

### `Commission`

| Field | Type |
|-------|------|
| `id` | string |
| `leadId` | string (unique) |
| `repUserId` | string |
| `amountCents` | number |
| `isPaid` | boolean |
| `paidAt` | string \| null |
| `paidByAdminId` | string \| null |
| `createdAt` | string (ISO) |

List endpoint **includes** nested `lead: { id, clientName, status }`.

### `Project`

| Field | Type |
|-------|------|
| `id` | string |
| `leadId` | string (unique) |
| `title` | string |
| `metadata` | JSON \| null |
| `createdAt` | string (ISO) |
| `updatedAt` | string (ISO) |

Detail/list may include full **`lead`** for authorization checks on the server.

### `ActivityLog`

| Field | Type |
|-------|------|
| `id` | string |
| `userId` | string \| null |
| `action` | `ActivityAction` |
| `entityType` | string (e.g. `"User"`, `"Lead"`, `"LeadPayment"`, `"Commission"`, `"Project"`, `"PortalSettings"`, `"Export"`) |
| `entityId` | string |
| `ip` | string \| null |
| `userAgent` | string \| null |
| `before` | JSON \| null |
| `after` | JSON \| null |
| `createdAt` | string (ISO) |

### `PortalSettings` (API only exposes `values`)

The DB row is a singleton (`id: "default"`). The API returns **validated settings** as a single object (see §8).

---

## 7. Lead assignment and commission attribution

Business rules the UI should reflect:

1. **`createdByUserId`** is always the authenticated user who called **`POST /api/leads`**.
2. **`assignedToUserId`**:
   - **Admin** creating a lead: **required** in the request body; must be an **active** **`SALES_REP`**.
   - **Sales rep** creating a lead: server sets assignee to **self**; if the client sends `assignedToUserId`, it **must equal** the rep’s id or the API returns **403**.
3. **Commission `repUserId`** when final payment is verified:  
   **`assignedToUserId ?? createdByUserId`** (implemented as `getCommissionRepUserId` in the backend).

Reps can **see** leads they **created** or are **assigned** to. Admins may **PATCH** `assignedToUserId` (including `null`); reps **cannot** change assignment.

---

## 8. Portal settings (workflow + commission knobs)

**GET** `/api/settings` — authenticated **any role**; returns `{ "settings": PortalSettingsValues }`.

**GET** `/api/admin/settings` and **PATCH** `/api/admin/settings` — **admin only**; same response shape.

`PortalSettingsValues` (strict keys; defaults match historical behavior if DB JSON is empty):

| Key | Type | Meaning |
|-----|------|---------|
| `commissionRateBps` | number | 0–10000; default **2000** (20%) |
| `commissionBasis` | `"VERIFIED_FINAL_PAYMENT"` \| `"FINAL_QUOTE"` | What amount the rate applies to when final payment is verified |
| `manualTransitions` | array | Allowed **manual** status transitions from **`POST /api/leads/:id/transition`** |
| `advancePaymentRequiredLeadStatus` | `LeadStatus` | Lead must be in this status to **mark** an advance payment (default `NEW`) |
| `finalPaymentRequiredLeadStatus` | `LeadStatus` | Lead must be in this status to **mark** a final payment (default `PREVIEW_SENT`) |
| `advanceVerifyRequiredLeadStatus` | `LeadStatus` | Lead must be in this status for **admin to verify** an advance (default `NEW`) |
| `finalVerifyRequiredLeadStatus` | `LeadStatus` | Lead must be in this status to **verify** final (default `PREVIEW_SENT`) |
| `terminalNoMutationStatuses` | `LeadStatus[]` | Leads in these statuses **cannot** be patched, transitioned, or have new payments marked (default `[COMMISSION_PAID]`) |
| `enforcePaymentQuoteToleranceBps` | number \| null | If non-null, verification compares payment amount to quote within tolerance; **null** disables (default **null**) |
| `exportMaxRows` | number | Admin XLSX exports cap (100–500000, default **50000**) |
| `commissionRounding` | `"floor"` \| `"round"` \| `"bankers"` | Rounding when computing commission amounts (default **bankers**) |
| `advancePaymentShareBps` | number | Share of **agreed total** for advance on Create Client (0–10000; default **5000** = 50/50) |

**GET** `/api/website-templates` — authenticated user; returns `{ "items": WebsiteTemplate[] }` sorted by `sortOrder`.

`WebsiteTemplate`: `id`, `slug`, `name`, **`displayCode`** (e.g. `RES/001`), `categoryId`, `sampleSlug`, `samplePath`, `sortOrder`. Codes match [`/samples/websites`](frontend/public/samples/websites/manifest.json) for rep demos.

**`manualTransitions`** items:

```ts
{
  from: LeadStatus;
  to: LeadStatus;
  adminOnly: boolean;
  enabled: boolean;
}
```

**Default edges** (if unchanged in DB):

- `ADVANCE_PAID` → `BUILDING`, `adminOnly: false`, `enabled: true`
- `BUILDING` → `PREVIEW_SENT`, `adminOnly: false`, `enabled: true`
- `FINAL_PAID` → `DEPLOYED`, `adminOnly: true`, `enabled: true`

The transition endpoint uses **`enabled: true`** rows only; **`adminOnly`** gates non-admin users.

**PATCH** body: any subset of the above keys (partial update); server merges and re-validates with Zod **`.strict()`** — unknown keys are rejected.

---

## 9. Pagination and list responses

Query params (shared pattern):

- `page` – integer ≥ 1 (default **1**)
- `pageSize` – integer 1–100 (default **20**)

**Response envelope:**

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

---

## 10. REST API reference

### Health

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/api/health` | No | `{ "ok": true }` |
| GET | `/api/health?deep=1` | No | Runs DB `SELECT 1`; `{ "ok": true, "deep": true, "database": "ok" }` |

### Settings

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/settings` | User |
| GET | `/api/admin/settings` | Admin |
| PATCH | `/api/admin/settings` | Admin (JSON body = partial `PortalSettingsValues`) |

### Users (admin)

| Method | Path | Body / query |
|--------|------|----------------|
| GET | `/api/users` | `page`, `pageSize` |
| POST | `/api/users` | `email`, `password?`, `displayName?`, `role`, `mustChangePassword?` — if `password` omitted, server generates temp password and returns **`temporaryPassword`** in response |
| PATCH | `/api/users/:id` | `isActive?`, `role?`, `displayName?` — cannot deactivate self; last-admin protections |
| POST | `/api/users/:id/reset-password` | `{ "temporaryPassword": string }` — sets `mustChangePassword: true` |

### Leads

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/leads` | Query: `page`, `pageSize`, `status?`, `search?`, `from?`, `to?` (dates). Rep-scoped list. |
| POST | `/api/leads` | See Zod: `createLeadBodySchema` — **admin must send `assignedToUserId`** |
| GET | `/api/leads/:id` | Response `{ lead }` includes nested `payments` (newest first), `commission`, and `project` when present. |
| PATCH | `/api/leads/:id` | `patchLeadBodySchema`; assignment only for admin |
| POST | `/api/leads/:id/transition` | `{ "toStatus": LeadStatus }` — must match settings + role |
| POST | `/api/leads/:id/payments` | `markPaymentBodySchema`: `{ "kind": PaymentKind, "amountCents": positive int, "repNote?" }` — gated by lead status + settings; blocked in terminal states |

### Payments (admin verify)

| Method | Path | Body |
|--------|------|------|
| POST | `/api/payments/:paymentId/verify` | `{ "decision": "VERIFIED" \| "REJECTED", "adminNote?" }` |

On **VERIFIED** **ADVANCE**: lead → **`ADVANCE_PAID`**.  
On **VERIFIED** **FINAL**: lead → **`FINAL_PAID`**, **upsert** `Commission` with `repUserId` and computed `amountCents` from settings.  
Response: `{ "payment", "lead" }` (updated rows).

### Commissions

| Method | Path | Notes |
|--------|------|------|
| GET | `/api/commissions` | Query: `page`, `pageSize`, `isPaid` = `"true"` \| `"false"` (string query param) |
| PATCH | `/api/commissions/:id` | Admin: `{ "amountCents": int >= 0 }` — not if `isPaid` or lead `COMMISSION_PAID` |
| POST | `/api/commissions/:id/mark-paid` | Admin: lead must be **`DEPLOYED`**; sets commission paid + lead **`COMMISSION_PAID`** |

### Projects

| Method | Path | Notes |
|--------|------|------|
| GET | `/api/projects` | Paginated; rep-scoped via lead |
| GET | `/api/projects/:id` | |
| POST | `/api/projects` | Admin: `createProjectBodySchema` |
| PATCH | `/api/projects/:id` | Admin: `patchProjectBodySchema` |

### Activity logs (admin)

| Method | Path | Query |
|--------|------|--------|
| GET | `/api/activity-logs` | `page`, `pageSize`, `userId?`, `entityType?`, `entityId?`, `from?`, `to?` |

### Exports (admin)

Binary XLSX responses; use `credentials: include`.

| GET | Returns |
|-----|---------|
| `/api/export/leads.xlsx` | Leads sheet includes `assignedToUserId`; rows capped by `exportMaxRows` |
| `/api/export/commissions.xlsx` | |
| `/api/export/users.xlsx` | |

---

## 11. Error responses

All structured errors follow:

```json
{
  "error": {
    "code": "SNAKE_CASE_STRING",
    "message": "Human-readable message",
    "details": {}
  }
}
```

`details` is omitted when empty. **Zod** validation returns **400** with `code: "VALIDATION_ERROR"` and `details` from `error.flatten()`.

**HTTP status / codes** (non-exhaustive but useful for UI mapping):

| Status | Code | Typical cause |
|--------|------|----------------|
| 400 | `VALIDATION_ERROR` | Invalid body/query |
| 400 | `INVALID_PASSWORD` | Wrong current password |
| 400 | `ASSIGNMENT_REQUIRED` | Admin lead create without assignee |
| 400 | `INVALID_ASSIGNEE` | Not an active rep |
| 400 | `INVALID_STATE` | Wrong lead status for payment/verify/mark-paid |
| 400 | `INVALID_TRANSITION` | FSM / same-status / edge disabled |
| 400 | `LAST_ADMIN` | User management constraint |
| 400 | `SELF_DEACTIVATE` | Cannot deactivate self |
| 400 | `ALREADY_PROCESSED` | Payment verify |
| 400 | `ALREADY_PAID` | Commission |
| 400 | `LEAD_TERMINAL` | Commission patch when lead terminal |
| 400 | `COMMISSION_BASE_MISSING` | Commission math / missing quote |
| 400 | `PAYMENT_QUOTE_MISMATCH` | Quote tolerance enforcement |
| 401 | `UNAUTHORIZED` | No/invalid session |
| 401 | `INVALID_CREDENTIALS` | Login |
| 403 | `FORBIDDEN` | Role or lead access |
| 403 | `CORS` | Origin not allowed |
| 404 | `NOT_FOUND` | Missing entity |
| 409 | `PENDING_PAYMENT` | Duplicate pending payment kind |
| 409 | `PROJECT_EXISTS` | Duplicate project for lead |
| 500 | `INTERNAL` | Unhandled server error |

---

## 12. Frontend implementation checklist

1. **Types**: Define TypeScript unions/strings **exactly** as Prisma enums above; use `*Cents` for money.
2. **Fetch**: `credentials: 'include'`; base URL from env (e.g. `VITE_API_URL`).
3. **CORS**: Frontend origin must appear in backend `ALLOWED_ORIGINS`.
4. **Boot flow**: `GET /api/auth/session` → if `user.mustChangePassword`, force change-password flow.
5. **Admin create lead form**: require **sales rep** picker → `assignedToUserId`.
6. **Rep lead create**: omit assignee or send self id only; show **assigned** and **created by** where useful.
7. **Settings-driven UI**: drive transition buttons and payment availability from **`GET /api/settings`** (or admin settings) so behavior stays in sync without redeploy.
8. **Commission display**: format `commissionRateBps / 100` as percent for labels; clarify **basis** (`VERIFIED_FINAL_PAYMENT` vs `FINAL_QUOTE`).
9. **Exports**: handle file download from `/api/export/*.xlsx` with blob response, not JSON.

---

## 13. Source of truth in the repo

| Concern | File(s) |
|---------|---------|
| Enums & models | [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) |
| Request schemas | [`backend/src/validators/schemas.ts`](backend/src/validators/schemas.ts) |
| Routes | [`backend/src/routes/*.ts`](backend/src/routes) |
| Lead access | [`backend/src/services/leadAccess.ts`](backend/src/services/leadAccess.ts) |
| Terminal guards | [`backend/src/services/leadGuards.ts`](backend/src/services/leadGuards.ts) |
| Commission rep | [`backend/src/services/commissionRep.ts`](backend/src/services/commissionRep.ts) |
| Commission math / transitions | [`backend/src/services/leadFsm.ts`](backend/src/services/leadFsm.ts) |
| Settings cache & helpers | [`backend/src/services/settings.ts`](backend/src/services/settings.ts) |
| Session & CORS | [`backend/src/app.ts`](backend/src/app.ts) |

When in doubt, **match the Zod schemas and Prisma field names exactly** so the frontend stays compatible with this backend.
