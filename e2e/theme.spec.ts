import { test, expect } from "@playwright/test";

const readAccent = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());

// The warm accent is the whole visual identity, and it is defined once per
// theme as a custom property. These guard the wiring, not the exact hue: if
// --accent stops resolving, every rule, chip and button silently goes grey.
test.describe("accent theming", () => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(scheme, () => {
      test.use({ colorScheme: scheme });

      test("accent custom property resolves", async ({ page }) => {
        await page.goto("/");
        expect(await readAccent(page)).toMatch(/^#[0-9a-f]{6}$/i);
      });

      test("stat values and card rules paint the same warm accent", async ({ page }) => {
        await page.goto("/");
        const statColor = await page
          .locator(".stat-value")
          .first()
          .evaluate((el) => getComputedStyle(el).color);
        const cardRule = await page
          .locator(".project-card")
          .first()
          .evaluate((el) => getComputedStyle(el).borderTopColor);

        expect(statColor).toBe(cardRule);

        // Warm means red channel clearly ahead of blue; grey would be equal.
        const [r, , b] = statColor.match(/\d+/g)!.map(Number);
        expect(r - b).toBeGreaterThan(40);
      });
    });
  }
});

test.describe("theme toggle", () => {
  test("swaps the document theme and the accent with it", async ({ page }) => {
    await page.goto("/");
    const before = await readAccent(page);

    // PaperMod toggles html[data-theme].
    await page.locator("#theme-toggle").click();
    await expect.poll(() => readAccent(page)).not.toBe(before);

    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(["light", "dark"]).toContain(theme);

    // Back again, to prove the toggle is symmetric rather than one-way.
    await page.locator("#theme-toggle").click();
    await expect.poll(() => readAccent(page)).toBe(before);
  });
});
