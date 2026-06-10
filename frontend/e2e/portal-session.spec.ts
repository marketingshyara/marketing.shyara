/**
 * E2E: session cookie survives page reload (opt-in).
 *
 * Set E2E_RUN_SESSION=1 when dev API + rep account exist.
 */
import { expect, test } from "@playwright/test";

const REP_EMAIL = process.env.E2E_REP_EMAIL ?? "rep@test.local";
const REP_PASSWORD = process.env.E2E_REP_PASSWORD ?? "RepPass123!";

const run = process.env.E2E_RUN_SESSION === "1";

test("login intro plays then sign-in form is visible", async ({ page }) => {
  await page.goto("/portal/login");
  await expect(page.getByTestId("portal-intro-loader")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({
    timeout: 10_000
  });
});

(run ? test : test.skip)("rep stays logged in after reload on pipeline", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: REP_EMAIL, password: REP_PASSWORD, rememberDevice: true }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }

  await page.goto("/portal/pipeline");
  await expect(page.getByRole("heading", { name: /Pipeline/i })).toBeVisible();

  await page.reload();
  await expect(page).not.toHaveURL(/\/portal\/login/);
  await expect(page.getByRole("heading", { name: /Pipeline/i })).toBeVisible();
});

(run ? test : test.skip)("rep session probe after reload does not false-logout", async ({
  page,
  request
}) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: REP_EMAIL, password: REP_PASSWORD, rememberDevice: true }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }

  await page.goto("/portal/commission");
  await expect(page.getByRole("heading", { name: /Your commission/i })).toBeVisible();

  await page.reload();
  await expect(page).not.toHaveURL(/\/portal\/login/);
});
