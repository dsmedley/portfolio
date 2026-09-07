import { test, expect } from "@playwright/test";

const navItems = [
  { name: "Projects", url: "/projects/" },
  { name: "Open Source", url: "/open-source/" },
  { name: "Resume", url: "/resume/" },
  { name: "About", url: "/about/" },
  { name: "Contact", url: "/contact/" },
];

test.describe("navigation", () => {
  test("nav contains all expected menu items", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    for (const item of navItems) {
      await expect(nav.getByRole("link", { name: item.name })).toBeVisible();
    }
  });

  for (const item of navItems) {
    test(`${item.name} nav link navigates to ${item.url}`, async ({ page }) => {
      await page.goto("/");
      await page.locator("nav").getByRole("link", { name: item.name }).click();
      await expect(page).toHaveURL(item.url);
      await expect(page).toHaveTitle(new RegExp(`${item.name}.*Dillon Smedley`));
    });
  }

  test("the site title links back home", async ({ page }) => {
    await page.goto("/about/");
    await page.locator("#menu, header").getByRole("link", { name: "Dillon Smedley" }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("unknown URLs render the 404 page", async ({ page }) => {
    const response = await page.goto("/no-such-page/");
    expect(response?.status()).toBe(404);
  });
});
