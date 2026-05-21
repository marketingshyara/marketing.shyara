/**
 * E2E smoke for new portal routes (commission, activity, payments, exports).
 * Set E2E_RUN_NEW_PAGES=1 when dev API + accounts exist.
 */
import { expect, test } from "@playwright/test";

const REP_EMAIL = process.env.E2E_REP_EMAIL ?? "rep@test.local";
const REP_PASSWORD = process.env.E2E_REP_PASSWORD ?? "RepPass123!";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "AdminPass123!";

const run = process.env.E2E_RUN_NEW_PAGES === "1";

async function loginAs(
  request: import("@playwright/test").APIRequestContext,
  email: string,
  password: string
) {
  const res = await request.post("/api/auth/login", { data: { email, password } });
  return res.ok();
}

(run ? test : test.skip)("rep commission page loads", async ({ page, request }) => {
  if (!(await loginAs(request, REP_EMAIL, REP_PASSWORD))) {
    test.skip();
    return;
  }
  await page.goto("/portal/commission");
  await expect(page.getByRole("heading", { name: /Your commission/i })).toBeVisible();
});

(run ? test : test.skip)("admin activity page loads", async ({ page, request }) => {
  if (!(await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD))) {
    test.skip();
    return;
  }
  await page.goto("/portal/activity");
  await expect(page.getByRole("heading", { name: /Activity log/i })).toBeVisible();
});

(run ? test : test.skip)("admin pending payments page loads", async ({ page, request }) => {
  if (!(await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD))) {
    test.skip();
    return;
  }
  await page.goto("/portal/payments");
  await expect(page.getByRole("heading", { name: /Pending payments/i })).toBeVisible();
});

(run ? test : test.skip)("admin settings shows data exports", async ({ page, request }) => {
  if (!(await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD))) {
    test.skip();
    return;
  }
  await page.goto("/portal/settings");
  await expect(page.getByText("Data exports")).toBeVisible();
});
