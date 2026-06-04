import { expect, test } from "@playwright/test";

test.describe("website samples page", () => {
  test("renders portfolio heading", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /website samples/i })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("shows template display codes on sample cards", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("RES/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("COA/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("GYM/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("CAR/001")).toBeVisible({ timeout: 60_000 });
  });

  test("fitness and automotive category filters show new samples", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Fitness" })).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: "Fitness" }).click();
    await expect(page.getByText("GYM/001")).toBeVisible();
    await expect(page.getByText("CAR/001")).toHaveCount(0);

    await page.getByRole("button", { name: /auto \/ car care/i }).click();
    await expect(page.getByText("CAR/001")).toBeVisible();
    await expect(page.getByText("GYM/001")).toHaveCount(0);
  });

  test("car wash sample SPA routes serve index shell", async ({ page, request }) => {
    const base = "/samples/websites/car-wash-auto-care-website";
    for (const path of ["/services", "/about", "/gallery", "/contact"]) {
      const res = await request.get(`${base}${path}`);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`${base}/assets/index-`);
    }

    await page.goto(`${base}/services`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /care, packaged/i })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("deep-linked category shows sample cards without hard refresh", async ({ page }) => {
    await page.goto("/samples?category=fitness", { waitUntil: "domcontentloaded" });
    const card = page.getByTestId("website-sample-card").first();
    await expect(card).toBeVisible({ timeout: 60_000 });
    await expect(card).toHaveCSS("opacity", "1");
    await expect(page.getByText("GYM/001")).toBeVisible();
  });

  test("mobile viewport: no grid iframes until live preview opened", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("website-sample-card").first()).toBeVisible({ timeout: 60_000 });

    await page.waitForTimeout(500);
    const gridIframes = page.locator('[data-testid="website-sample-card"] iframe[src^="/samples/websites"]');
    await expect(gridIframes).toHaveCount(0);

    const firstCard = page.getByTestId("website-sample-card").first();
    await firstCard.getByRole("button", { name: /live preview/i }).first().click();
    await expect(page.locator('[role="dialog"] iframe[src^="/samples/websites"]')).toHaveCount(1, {
      timeout: 90_000,
    });
  });

  test("desktop viewport: poster thumbnails visible; live preview in dialog", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    const firstCard = page.getByTestId("website-sample-card").first();
    await expect(firstCard).toBeVisible({ timeout: 60_000 });

    await expect(firstCard.locator('img[src*="/samples/websites/"][src*="poster"]')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator('[data-testid="website-sample-card"] iframe[src^="/samples/websites"]')
    ).toHaveCount(0);

    await firstCard.getByRole("button", { name: /live preview/i }).first().click();
    await expect(page.locator('[role="dialog"] iframe[src^="/samples/websites"]')).toHaveCount(1, {
      timeout: 90_000,
    });
  });

  test("poster image URLs return 200", async ({ page, request }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("website-sample-card").first()).toBeVisible({ timeout: 60_000 });
    const src = await page
      .locator('[data-testid="website-sample-card"] img[src*="poster"]')
      .first()
      .getAttribute("src");
    expect(src).toBeTruthy();
    const res = await request.get(src!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"] ?? "").toMatch(/image\//);
  });
});
