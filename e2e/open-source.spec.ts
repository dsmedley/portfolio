import { test, expect } from "@playwright/test";

// Mirrors data/open-source.json. Every entry is a pull request merged upstream,
// so a failure here means the page is claiming something the data does not.
const projects = [
  { name: "Backstage", url: "https://github.com/backstage/backstage", count: 3 },
  {
    name: "OpenShift Jenkins Sync Plugin",
    url: "https://github.com/openshift/jenkins-sync-plugin",
    count: 3,
  },
  {
    name: "cookiecutterassert",
    url: "https://github.com/cookiecutterassert/cookiecutterassert",
    count: 1,
  },
];

const totalContributions = projects.reduce((n, p) => n + p.count, 0);

test.describe("open source page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/open-source/");
  });

  test("has a heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Open Source", level: 1 })).toBeVisible();
    await expect(page.getByText("Small, upstream, and merged", { exact: false })).toBeVisible();
  });

  test("lists every upstream project", async ({ page }) => {
    await expect(page.locator(".oss-project")).toHaveCount(projects.length);
    for (const project of projects) {
      await expect(page.locator(".oss-project").getByRole("link", { name: project.name })).toHaveAttribute("href", project.url);
    }
  });

  test("lists every contribution", async ({ page }) => {
    await expect(page.locator(".oss-item")).toHaveCount(totalContributions);
  });

  test("each project shows its own contribution count", async ({ page }) => {
    for (let i = 0; i < projects.length; i++) {
      await expect(page.locator(".oss-project").nth(i).locator(".oss-item")).toHaveCount(projects[i].count);
    }
  });

  test("every contribution links to a real pull request and shows its metadata", async ({ page }) => {
    const items = page.locator(".oss-item");
    for (let i = 0; i < totalContributions; i++) {
      const item = items.nth(i);
      const link = item.locator(".oss-item-title a");
      await expect(link).toHaveAttribute("href", /^https:\/\/github\.com\/.+\/pull\/\d+$/);
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(item.locator(".oss-item-meta")).toContainText("merged");
      await expect(item.locator(".oss-item-summary")).not.toBeEmpty();
    }
  });

  test("surfaces the OpenShift bug fix with its diagnosis", async ({ page }) => {
    const item = page.locator(".oss-item").filter({ hasText: "Bug 2064139" });
    await expect(item.locator(".oss-item-title a")).toHaveAttribute("href", "https://github.com/openshift/jenkins-sync-plugin/pull/418");
    await expect(item).toContainText("re-list");
  });

  test("resume summarizes the same contributions and links here", async ({ page }) => {
    await page.goto("/resume/");
    const section = page.locator(".resume-section").filter({ hasText: "Open source" });
    await expect(section.getByRole("link", { name: "Backstage" })).toBeVisible();
    await expect(section).toContainText("3 merged contributions");
    await expect(section).toContainText("1 merged contribution:");
    await section.getByRole("link", { name: /full details/i }).click();
    await expect(page).toHaveURL("/open-source/");
  });
});
