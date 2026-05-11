/**
 * Smoke: admin team hub + payment reviews heading (opt-in).
 *
 * Set E2E_RUN_JOURNEY=1 when the dev API is available with the admin account.
 */
import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "AdminPass123!";

const run = process.env.E2E_RUN_JOURNEY === "1";

(run ? test : test.skip)("team hub loads for admin", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/team");
  await expect(page.getByRole("heading", { name: /^Team$/ })).toBeVisible();
});

(run ? test : test.skip)("payment reviews page shows updated title", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/approvals");
  await expect(page.getByRole("heading", { name: /Payment reviews/i })).toBeVisible();
});
