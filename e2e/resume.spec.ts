import { test, expect } from "@playwright/test";

test.describe("resume page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/resume/");
  });

  test("renders every resume section", async ({ page }) => {
    const headings = ["Summary", "Skills", "Experience", "Selected projects", "Open source", "Education"];
    for (const heading of headings) {
      await expect(page.getByRole("heading", { name: heading, level: 2 })).toBeVisible();
    }
  });

  test("shows contact details from data/profile.json", async ({ page }) => {
    await expect(page.locator('.resume-contact a[href="mailto:contact@dillonsmedley.com"]')).toBeVisible();
    await expect(page.locator(".resume-contact").getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(page.locator(".resume-contact").getByRole("link", { name: "LinkedIn" })).toBeVisible();
  });

  test("lists skill areas with their items", async ({ page }) => {
    const skills = page.locator(".resume-skills");
    await expect(skills.getByText("Backend", { exact: true })).toBeVisible();
    await expect(skills.getByText("Laravel", { exact: false }).first()).toBeVisible();
  });

  test("selected projects link to the project pages", async ({ page }) => {
    const projects = page.locator(".resume-projects");
    await expect(projects.getByRole("link", { name: "SWG Junkyard" })).toHaveAttribute("href", "/projects/swg-junkyard/");
  });
});

test.describe("about and contact pages", () => {
  test("about page renders its content", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.getByRole("heading", { name: "About", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What I work on" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How I approach it" })).toBeVisible();
  });

  test("contact page exposes the domain mailto link, not the gmail one", async ({ page }) => {
    await page.goto("/contact/");
    await expect(page.getByRole("heading", { name: "Contact", level: 1 })).toBeVisible();
    await expect(page.locator('.post-content a[href="mailto:contact@dillonsmedley.com"]')).toBeVisible();
    await expect(page.locator('a[href*="gmail.com"]')).toHaveCount(0);
  });
});
