import { expect, test } from "@playwright/test";

test.describe("website samples page", () => {
  test("renders portfolio heading", async ({ page }) => {
    await page.goto("/work", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("portfolio-headline")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText(/don't just take our word for it/i)).toBeVisible();
  });

  test("shows template display codes on sample cards", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("RES/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("RES/004")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("COA/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("GYM/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("GYM/002")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("CAR/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("RET/001")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("REA/001")).toBeVisible({ timeout: 60_000 });
  });

  test("industry filter pills cover every sample category", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    const tablist = page.getByRole("tablist", { name: "Filter samples by industry" });
    await expect(tablist).toBeVisible({ timeout: 60_000 });

    for (const label of [
      "All",
      "Restaurants",
      "Clinics",
      "Astrology",
      "Coaching",
      "Fitness",
      "Auto / Car Care",
      "Retail & Florists",
      "Real Estate",
    ]) {
      await expect(tablist.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
  });

  test("retail and real estate category filters show new samples", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /retail & florists/i })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole("button", { name: /retail & florists/i }).click();
    await expect(page.getByText("RET/001")).toBeVisible();
    await expect(page.getByText("REA/001")).toHaveCount(0);

    await page.getByRole("button", { name: /real estate/i }).click();
    await expect(page.getByText("REA/001")).toBeVisible();
    await expect(page.getByText("RET/001")).toHaveCount(0);
  });

  test("fitness and automotive category filters show new samples", async ({ page }) => {
    await page.goto("/samples", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Fitness" })).toBeVisible({ timeout: 60_000 });
    await page.getByRole("button", { name: "Fitness" }).click();
    await expect(page.getByText("GYM/001")).toBeVisible();
    await expect(page.getByText("GYM/002")).toBeVisible();
    await expect(page.getByText("CAR/001")).toHaveCount(0);

    await page.getByRole("button", { name: /auto \/ car care/i }).click();
    await expect(page.getByText("CAR/001")).toBeVisible();
    await expect(page.getByText("GYM/001")).toHaveCount(0);
  });

  test("fire town cafe sample SPA routes serve index shell", async ({ page, request }) => {
    const base = "/samples/websites/restaurant-fire-town-website";
    for (const path of ["/menu", "/about", "/gallery", "/contact"]) {
      const res = await request.get(`${base}${path}`);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`${base}/static/js/main`);
    }

    await page.goto(`${base}/menu`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /edible botanicals/i }).first()).toBeVisible({
      timeout: 60_000,
    });
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

  test("yoga ananda sample SPA routes serve index shell", async ({ page, request }) => {
    const base = "/samples/websites/yoga-ananda-website";
    for (const path of ["/classes", "/about", "/instructors", "/schedule", "/contact"]) {
      const res = await request.get(`${base}${path}`);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`${base}/assets/index-`);
    }

    await page.goto(`${base}/classes`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /practice for every season/i }).first()).toBeVisible({
      timeout: 60_000,
    });
  });

  test("florist bloom vine sample SPA routes serve index shell", async ({ page, request }) => {
    const base = "/samples/websites/florist-bloom-vine-website";
    for (const path of ["/shop", "/journal", "/about", "/contact"]) {
      const res = await request.get(`${base}${path}`);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`${base}/assets/index-`);
    }

    await page.goto(`${base}/shop`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /in bloom this week/i }).first()).toBeVisible({
      timeout: 60_000,
    });
  });

  test("toy store playhouse sample SPA routes serve index shell", async ({ page, request }) => {
    const base = "/samples/websites/toy-store-playhouse-website";
    for (const path of ["/shop", "/about", "/visit"]) {
      const res = await request.get(`${base}${path}`);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`${base}/assets/index-`);
    }

    await page.goto(`${base}/shop`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /all playthings/i }).first()).toBeVisible({
      timeout: 60_000,
    });
  });

  test("real estate verdant heights sample SPA routes serve index shell", async ({ page, request }) => {
    const base = "/samples/websites/realestate-verdant-heights-website";
    for (const path of ["/residences", "/amenities", "/location", "/gallery", "/contact"]) {
      const res = await request.get(`${base}${path}`);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`${base}/assets/index-`);
    }

    await page.goto(`${base}/residences`, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /four ways to live/i }).first()
    ).toBeVisible({
      timeout: 60_000,
    });
  });

  test("car wash and gym inner pages visible without hard refresh", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/samples/websites/car-wash-auto-care-website/", {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Services" }).click();
    const carWashHeading = page.getByRole("heading", { name: /care, packaged/i });
    await expect(carWashHeading).toBeVisible({ timeout: 30_000 });
    await expect(carWashHeading).toHaveCSS("opacity", "1");

    await page.goto("/samples/websites/gym-ironforge-website/", {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();
    const gymHeading = page.getByRole("heading", { name: /built to/i });
    await expect(gymHeading).toBeVisible({ timeout: 30_000 });
    await expect(gymHeading).toHaveCSS("opacity", "1");
  });

  test("deep-linked category shows sample cards without hard refresh", async ({ page }) => {
    await page.goto("/samples?category=fitness", { waitUntil: "domcontentloaded" });
    const card = page.getByTestId("website-sample-card").first();
    await expect(card).toBeVisible({ timeout: 60_000 });
    await expect(card).toHaveCSS("opacity", "1");
    await expect(page.getByText("GYM/001")).toBeVisible();
    await expect(page.getByText("GYM/002")).toBeVisible();
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

  const MOJIBAKE_SNIPPETS = ["â€", "Â°", "â€™", "â€œ", "Ã©"];

  for (const sample of [
    { path: "/samples/websites/restaurant-journey-of-taste-website/", heading: /fire meets flavor/i },
    { path: "/samples/websites/restaurant-fire-town-website/", heading: /fire town|coffee|caf/i },
    { path: "/samples/websites/astrology-consultant-website/", heading: /celestia|astrology|stars/i },
    { path: "/samples/websites/clinic-multispeciality-waiting-room/", heading: /clinic|health|multispecial/i },
    { path: "/samples/websites/clinic-dental-waiting-room-classic/", heading: /dental|smile/i },
    { path: "/samples/websites/clinic-dermatology-waiting-room/", heading: /dermatology|skin/i },
    { path: "/samples/websites/clinic-pathology-waiting-room/", heading: /pathology|lab/i },
  ]) {
    test(`no UTF-8 mojibake in ${sample.path}`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto(sample.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 60_000 });
      const body = await page.locator("body").innerText();
      for (const snippet of MOJIBAKE_SNIPPETS) {
        expect(body, `found "${snippet}"`).not.toContain(snippet);
      }
    });
  }

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
