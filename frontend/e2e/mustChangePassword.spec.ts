/**
 * E2E spec: mustChangePassword flow.
 *
 * Verifies that a freshly-created sales rep account whose admin marked
 * `mustChangePassword: true` is forced into the change-password screen on first login and
 * unblocked into /portal/leads only after submitting a new password.
 *
 * Wiring: add `@playwright/test` as a devDependency and a `playwright.config.ts` whose
 * `webServer` block boots both the backend (`npm --prefix backend run dev`) and the frontend
 * (`npm --prefix frontend run dev`) before this spec runs. The test reads the admin/test rep
 * credentials from env vars so secrets never live in this file.
 */

import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "AdminPass123!";
const NEW_REP_EMAIL = process.env.E2E_REP_EMAIL ?? `rep-${Date.now()}@test.local`;
const NEW_REP_PASSWORD = "TempPass123!";
const FINAL_PASSWORD = "AfterChangePass1!";

test("mustChangePassword forces a password change before /portal/leads access", async ({ page, request }) => {
  // Admin login.
  const loginRes = await request.post("/api/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
  });
  expect(loginRes.ok()).toBe(true);

  // Provision the rep with mustChangePassword. Admins always end up with the flag set when no
  // explicit password is sent, but we set it explicitly here for clarity.
  await request.post("/api/users", {
    data: {
      email: NEW_REP_EMAIL,
      password: NEW_REP_PASSWORD,
      role: "SALES_REP",
      displayName: "E2E Rep",
      mustChangePassword: true
    }
  });

  // Logout admin so the next /portal/login is fresh.
  await request.post("/api/auth/logout");

  // UI flow.
  await page.goto("/portal/login");
  await page.getByLabel(/Email/i).fill(NEW_REP_EMAIL);
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.getByLabel(/^Password$/i).fill(NEW_REP_PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/i }).click();

  // Should be force-redirected to /portal/change-password.
  await page.waitForURL(/\/portal\/change-password/);

  await page.getByLabel(/^New password$/i).fill(FINAL_PASSWORD);
  await page.getByLabel(/Confirm new password/i).fill(FINAL_PASSWORD);
  await page.getByRole("button", { name: /Save Password/i }).click();

  // After the change, the leads page should be reachable.
  await page.waitForURL(/\/portal\/leads/);
  await expect(page.getByRole("heading", { name: /Leads/i })).toBeVisible();
});
