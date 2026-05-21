/**
 * E2E: admin team home (smoke).
 *
 * Set E2E_RUN_ADMIN_TEAM=1 when dev API + admin account exist.
 */
import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "AdminPass123!";

const run = process.env.E2E_RUN_ADMIN_TEAM === "1";

(run ? test : test.skip)("admin team home loads", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/team");
  await expect(page.getByRole("heading", { name: /Sales team/i })).toBeVisible();
});

(run ? test : test.skip)("admin cannot access rep pipeline", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/pipeline");
  await expect(page).toHaveURL(/\/portal\/team/);
  await expect(page.getByRole("link", { name: /Add lead/i })).toHaveCount(0);
});
