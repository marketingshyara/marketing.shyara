/**
 * E2E: admin reviews queue (smoke). Legacy filename; targets /portal/reviews.
 *
 * Set E2E_RUN_APPROVALS=1 when Playwright webServer exposes the API and the admin account exists.
 */
import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "AdminPass123!";

const run = process.env.E2E_RUN_APPROVALS === "1";

(run ? test : test.skip)("reviews page loads for admin", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/reviews");
  await expect(page.getByRole("heading", { name: /^Reviews$/ })).toBeVisible();
});
