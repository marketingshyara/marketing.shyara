# Portal launch audit



**Date:** 2026-05-21  

**Last verification pass:** 2026-05-21  

**Leftovers pass:** 2026-05-21  

**Scope:** Sales portal production readiness before sales-team launch.



## Test baseline



| Suite | Result |

|-------|--------|

| Backend `npm test` | 96 passed, 28 skipped (integration requires `DATABASE_URL` + `SESSION_SECRET`) |

| Frontend `npm test` (sales-portal) | 41 passed |

| Backend `npm run build` | Pass |

| Frontend `npm run build` | Pass |

| Integration `portalReviewFixes.test.ts` | Skipped locally (no `DATABASE_URL`) — run on staging/CI before launch |

| Portal E2E bundle | `cd frontend && npm run e2e:portal` (opt-in env flags below) |



### Portal E2E (opt-in)



```bash

cd frontend

E2E_RUN_PIPELINE=1 E2E_RUN_NEW_PAGES=1 E2E_RUN_JOURNEY=1 E2E_RUN_SESSION=1 \

  E2E_REP_EMAIL=... E2E_REP_PASSWORD=... \

  E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... \

  npm run e2e:portal

```



| Flag | Spec |

|------|------|

| `E2E_RUN_PIPELINE=1` | `portal-pipeline.spec.ts` |

| `E2E_RUN_NEW_PAGES=1` | `portal-new-pages.spec.ts` |

| `E2E_RUN_JOURNEY=1` | `portal-journey.spec.ts`, `portal-admin-team.spec.ts` |

| `E2E_RUN_SESSION=1` | `portal-session.spec.ts` (reload stays authenticated) |



## Stage test matrix (canonical funnel)



| Step | Rep action | Admin action | LeadStatus after | Key flags |

|------|------------|--------------|------------------|-----------|

| 1 | Create lead | — | `NEW` | — |

| 2 | Convert + advance payment | Verify advance | `ADVANCE_PAID` | `project` created |

| 3 | Save WhatsApp link | Verify WhatsApp | `BUILDING` (typical) | `whatsappVerifiedAt` |

| 4 | — | Save preview + Mark demo ready | `PREVIEW_SENT` | `project.previewUrl` |

| 5 | Mark demo finalized | Verify demo | — | `demoFinalizedVerifiedAt` |

| 6 | Mark accounts ready | Verify accounts | — | `accountsReadyVerifiedAt` |

| 7 | Record due payment | Verify final | `FINAL_PAID` | — |

| 8 | — | Verify repo transfer | — | `repoTransferVerifiedAt` |

| 9 | Submit live URL | Verify deployment | `DEPLOYED` | commission row |

| 10 | — | Mark commission paid | `COMMISSION_PAID` | — |



Settings (`advancePaymentRequiredLeadStatus`, `finalPaymentRequiredLeadStatus`, etc.) must match pipeline UI locks.



## Findings addressed



| Severity | Issue | Status |

|----------|-------|--------|

| CRITICAL | Pipeline UI ignored portal payment status settings | Fixed |

| CRITICAL | `build_demo` verified on URL save only | Fixed |

| CRITICAL | Deployment without repo transfer (server) | Fixed |

| MAJOR | No exports / activity / pending payments / rep commissions UI | Fixed |

| MAJOR | Repo modal copy wrong order | Fixed |

| MAJOR | Raw `INVALID_STATE` toasts | Fixed |

| MINOR | Dead `verifyProjectDeployment` (frontend) | Removed |

| MINOR | Duplicate `POST /api/projects/:id/verify-deployment` | Deprecated 410; UI uses `POST /api/leads/:id/stages/deployment/verify` |



## Leftovers pass (2026-05-21)



| Item | Status |

|------|--------|

| `npm run e2e:portal` script | Added in `frontend/package.json` |

| Session reload E2E | `frontend/e2e/portal-session.spec.ts` |

| Manual transitions helper text | Settings system tab |

| Export max rows on exports card | `SettingsExportsCard` reads settings |

| Activity log user column | API includes `user.displayName` / `email` |

| Orphan `lead-detail/*` | Already absent from repo |

| M9 integration test | Uses lead stage `deployment/verify` |

| `verify-deployment` project route | Returns `410 DEPRECATED_ENDPOINT` |



## Deferred



| Item | Reason |

|------|--------|

| Manual status transition UI for reps | Settings-only legacy |

| Playwright in GitHub Actions | Run manually on staging with secrets; no workflow added |

| Integration CI without DB secrets | Requires operator/staging `DATABASE_URL` |



## New routes (launch smoke)



| Role | Path | Purpose |

|------|------|---------|

| Rep | `/portal/commission` | Own commission list + payout copy |

| Admin | `/portal/payments` | Pending advance/due payments queue |

| Admin | `/portal/activity` | Paginated audit log |

| Admin | Settings → Data exports | Leads / commissions / users `.xlsx` |



## Operator launch checklist



Run on **staging or production** after deploy. Check when verified:



- [ ] `npm run db:migrate:deploy --workspace backend` (`portal_sessions` migration applied)

- [ ] `BOOTSTRAP_ADMIN_ON_START=false` after first admin login

- [ ] Bootstrap admin password rotated

- [ ] Rep: full funnel (create lead → due payment) without engineer help

- [ ] Admin: reviews queue through commission on one deal

- [ ] `/portal/commission`, `/portal/payments`, `/portal/activity`, Settings export download

- [ ] Tab switch / page reload does not false-logout (`E2E_RUN_SESSION=1` or manual)

- [ ] Integration: `DATABASE_URL=... SESSION_SECRET=... npm test --workspace backend` (all integration files green)



### Integration test command (staging DB)



```bash

cd backend

set DATABASE_URL=postgresql://...

set SESSION_SECRET=...

npm test

```



## Code review gate



| Severity | Count | Notes |

|----------|-------|-------|

| CRITICAL | 0 | Pipeline/settings alignment, repo-before-deploy, build_demo gate |

| MAJOR | 0 in scope | Selected features wired |

| MINOR | 0 in leftovers scope | Deployment API deprecated; orphans already removed |



## UX day-to-day checklist (2026-05-21)



Use this after the UX pass for rep/admin daily workflows.



### Admin (≤2 taps to verification)



- [ ] Login with pending reviews → lands on **Reviews** once per session (then Team is default)

- [ ] Team hub shows dismissible banner when `pendingActionsCount > 0` → **Open reviews queue**

- [ ] Nav **Reviews** matches page title; **Payments** subtitle links to Reviews

- [ ] Reviews queue → project (`?stage=`) → verify → toast shows next admin step

- [ ] Payment verify: Razorpay ref helper; decline requires admin note

- [ ] `/portal/payments` and `/portal/activity` blocked for reps; `/portal/commission` blocked for admins



### Rep



- [ ] New lead page shows **How this works** (3 steps, no settings jargon)

- [ ] Pipeline list: waiting badge subline; empty states on Prospects / Active clients tabs

- [ ] Project detail: focus card waiting copy; commission badge + **View all commission**

- [ ] Stage modals show **After you save:** hint from `stageNextStepHint`

- [ ] Locked steps show `blockedReason` in accordion (no toast-only discovery)



### Copy & consistency



- [ ] Grep UI for raw stage keys / `LeadStatus` — use `stageShortTitle` / `leadStatusLabel`

- [ ] Verified payment refs labeled **Razorpay reference** (admin project + verify dialog)

- [ ] Notifications: `stageKey` → step subtitle in bell



### Manual journeys



| Actor | Path |

|-------|------|

| Rep | New lead → convert → wait banner → due payment → commission link |

| Admin | Team → reviews → payment verify (approve + decline note) → deployment verify → commission paid |



### Automated



- `frontend/src/sales-portal/lib/portalPaths.test.ts` — admin/rep guards + login reviews redirect

- `frontend/src/sales-portal/lib/pipelineCopy.test.ts` — `listWaitingSubline`, `stageNextStepHint`

- Optional: `E2E_RUN_JOURNEY=1` admin pending → reviews landing (seeded DB)



### Accessibility (core paths)



- Login: labeled email/password fields

- Activity table: `caption`, `scope="col"` on headers

- Payment dialog: `aria-describedby` on Razorpay ref field

- Bell: `aria-label` on trigger; stage subtitle when `stageKey` present



## Full site UX pass (2026-05-21)



Site-wide consistency and accessibility beyond the sales portal day-to-day pass.



### Marketing site routes



| Route | Page | Status |
|-------|------|--------|
| `/` | Home | Layout + SEO |
| `/services` | Services hub | Layout + SEO |
| `/services/*` | 4 service pages | Layout + SEO + modals |
| `/samples` | Samples hub | Layout + SEO |
| `/samples/websites` | Website grid | `WebsiteSampleCard` iframe titles |
| `/samples/social-media` | Social media portfolio | Wired (was orphan) |
| `/offers`, `/about`, `/careers`, `/contact` | Content pages | Layout + SEO |
| Legal ×4 | Policies | Layout + SEO |
| `*` | NotFound | Recovery links (Home, Services, Contact) |



### Marketing chrome



- [x] Skip to main content (`#main-content`) in [`Layout.tsx`](frontend/src/components/Layout.tsx)
- [x] Header: `aria-label` on nav; mobile `aria-controls` + `min-h-11` menu button
- [x] Footer: Sales portal link to `/portal/login`



### Portal (remaining headers)



- [x] `PortalPageHeader` on Team, Rep projects, Settings, Users, Resources
- [x] “Verification queue” → “Reviews” in [`PipelineDetailGate`](frontend/src/sales-portal/pages/pipeline/PipelineDetailGate.tsx)



### Static samples



- Manifest: 12 samples in [`manifest.json`](frontend/public/samples/websites/manifest.json); extra folders (e.g. `travel-tour-website`) not in manifest — OK, not linked from grid
- Wrapper: poster `alt`, dialog `DialogDescription`, `min-h-11` CTAs on cards



### Orphan code removed



Legacy unreferenced pages under `frontend/src/sales-portal/pages/` (pre-pipeline UI): deleted in this pass.



### Pre-deploy checklist



```bash
npm test                    # root workspaces
npm run build               # root
cd frontend && npm run lint
```



Manual: Home → Services → Samples (website + social) → Contact → `/portal/login` → admin Reviews + rep Pipeline.



### Deploy



Push to `main` on `marketingshyara/marketing.shyara` → Render auto-deploy (see [`render-deployment.md`](render-deployment.md)).


