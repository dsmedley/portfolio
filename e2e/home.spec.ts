import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("Dillon Smedley");
  });

  test("shows the profile name and subtitle", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dillon Smedley", level: 1 })).toBeVisible();
    await expect(page.getByText("Software engineer", { exact: false }).first()).toBeVisible();
  });

  // The hero shows a real photo when assets/img/profile.* exists and the DS
  // monogram otherwise. Exactly one must render, never both and never neither.
  test("hero shows either a photo or the monogram fallback", async ({ page }) => {
    const photo = page.locator(".hero-avatar");
    const monogram = page.locator(".hero-monogram");
    const photoCount = await photo.count();
    const monogramCount = await monogram.count();
    expect(photoCount + monogramCount).toBe(1);

    if (photoCount === 1) {
      await expect(photo).toBeVisible();
      // A decorative avatar would be useless to a screen reader here.
      await expect(photo).toHaveAttribute("alt", /\S/);
      // Hugo should have processed it, not linked the original straight through.
      await expect(photo).toHaveJSProperty("naturalWidth", 264);
    } else {
      await expect(monogram).toBeVisible();
      await expect(monogram).toHaveText("DS");
      await expect(monogram).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("has a primary resume button and a secondary contact button", async ({ page }) => {
    const primary = page.locator(".hero-button-primary");
    await expect(primary).toHaveText("Resume");
    await expect(primary).toHaveAttribute("href", "/resume");
    const secondary = page.locator(".hero-button-secondary");
    await expect(secondary).toHaveText("Get in touch");
    await expect(secondary).toHaveAttribute("href", "/contact");
  });

  test("shows the stats strip with verifiable figures", async ({ page }) => {
    const stats = page.locator(".stat");
    await expect(stats).toHaveCount(3);
    await expect(stats.nth(0).locator(".stat-value")).toHaveText("10+");
    await expect(stats.nth(1).locator(".stat-value")).toHaveText("3");
    await expect(stats.nth(2).locator(".stat-value")).toHaveText("7");
    // The upstream figure must agree with the open source page it links to.
    await stats.nth(2).getByRole("link").click();
    await expect(page).toHaveURL("/open-source/");
    await expect(page.locator(".oss-item")).toHaveCount(7);
  });

  test("links to GitHub, GitLab and LinkedIn profiles", async ({ page }) => {
    await expect(page.locator('a[href="https://github.com/dsmedley"]').first()).toBeVisible();
    await expect(page.locator('a[href="https://gitlab.com/dsmedley"]').first()).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com/in/dillon-smedley"]').first()).toBeVisible();
  });

  test("shows a selected work section listing every project", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Selected work" })).toBeVisible();
    await expect(page.locator(".project-card")).toHaveCount(3);
  });

  test("project cards name each project", async ({ page }) => {
    const cards = page.locator(".project-card");
    await expect(cards.getByRole("link", { name: "SWG Junkyard" })).toBeVisible();
    await expect(cards.getByRole("link", { name: "Northern Wörthersee" })).toBeVisible();
    await expect(cards.getByRole("link", { name: "This Site" })).toBeVisible();
  });

  test("has a link through to the full projects index", async ({ page }) => {
    await page.getByRole("link", { name: /all projects/i }).click();
    await expect(page).toHaveURL("/projects/");
  });

  test("has a link through to open source contributions", async ({ page }) => {
    await page.getByRole("link", { name: /open source contributions/i }).click();
    await expect(page).toHaveURL("/open-source/");
  });
});
