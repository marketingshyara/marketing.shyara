# Engineering Rules

## Scope
- These rules apply to backend and frontend sales-portal changes in this repository.
- Every PR must preserve backend invariants, API contract consistency, and regression coverage.
- **Holistic delivery** (user POV, whole solutions, ripple fixes): `.cursor/rules/sales-portal-delivery.mdc` — follow on every portal task.
- **Bug-fix workflow** (rep-first, full-stack, elevated UI/UX on every reported bug): `.cursor/rules/sales-portal-bug-fix-workflow.mdc`.
- Sales portal UX expectations (rep/admin journeys, mobile copy, progressive disclosure) live in `.cursor/rules/sales-portal-ux.mdc` — follow them for portal UI work.

## Required Review Workflow
- Run a `code-reviewer` style pass before merge and tag findings by severity (`CRITICAL`, `MAJOR`, `MINOR`).
- Resolve all `CRITICAL` findings before merge.
- `MAJOR` findings require either fixes in the PR or an explicit follow-up issue with owner/date.

## Backend Invariants
- Enforce auth workflow invariants on the server, never only in frontend guards.
- Use atomic DB operations (or transactions with compare-and-swap checks) for race-prone updates.
- Protect role/security invariants (e.g., last-active-admin) inside transaction boundaries.
- Use DB constraints/indexes as canonical protection for uniqueness/business rules under concurrency.

## Portal password recovery
- No self-service email reset. Recovery path: admin **issues temporary password** → user signs in → forced **set your password** (`mustChangePassword`).
- User-facing strings live in `frontend/src/sales-portal/lib/passwordCopy.ts`; do not duplicate or contradict them in pages or toasts.

## API Contract Consistency
- When backend request/response schemas change, update frontend API types and validators in the same PR.
- Prefer stable machine-readable error codes and handle them explicitly in frontend UX.
- Keep settings schema parity between backend and frontend; no hidden mutable fields.

## Testing Definition of Done
- For risky logic changes, add tests for:
  - happy path
  - negative path
  - edge/race path where applicable
- Required for auth/lead/payment/commission mutations:
  - integration tests for invariants
  - contract checks for response shapes used by frontend
- Do not merge if new tests are flaky or nondeterministic.

## Validation Gates
- Run backend tests including integration suites.
- Run frontend and backend lint/type checks.
- For auth/payment/state-flow changes, run Playwright critical-path checks (`webapp-testing` workflow).

## Migration Safety
- For schema/index changes, include idempotent migration logic where practical.
- Document rollback strategy for migration-affecting PRs.
