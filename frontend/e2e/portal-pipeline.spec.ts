/**
 * E2E: rep pipeline shell (smoke).
 *
 * Set E2E_RUN_PIPELINE=1 when dev API + rep account exist.
 */
import { expect, test } from "@playwright/test";

const REP_EMAIL = process.env.E2E_REP_EMAIL ?? "rep@test.local";
const REP_PASSWORD = process.env.E2E_REP_PASSWORD ?? "RepPass123!";

const run = process.env.E2E_RUN_PIPELINE === "1";

(run ? test : test.skip)("pipeline list loads for rep", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: REP_EMAIL, password: REP_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/pipeline");
  await expect(page.getByRole("heading", { name: /Pipeline/i })).toBeVisible();
});

(run ? test : test.skip)("legacy leads URL redirects to pipeline", async ({ page, request }) => {
  const loginRes = await request.post("/api/auth/login", {
    data: { email: REP_EMAIL, password: REP_PASSWORD }
  });
  if (!loginRes.ok()) {
    test.skip();
    return;
  }
  await page.goto("/portal/leads");
  await expect(page).toHaveURL(/\/portal\/pipeline/);
});
