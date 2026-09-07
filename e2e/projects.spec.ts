import { test, expect } from "@playwright/test";

const projects = [
  {
    title: "SWG Junkyard",
    url: "/projects/swg-junkyard/",
    tag: "Laravel",
    external: "https://www.swgjunkyard.com",
  },
  {
    title: "Northern Wörthersee",
    url: "/projects/northern-worthersee/",
    tag: "Hugo",
    external: "https://northernworthersee.com",
  },
  {
    title: "This Site",
    url: "/projects/portfolio-site/",
    tag: "PaperMod",
    external: null,
  },
];

test.describe("projects index", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/");
  });

  test("has a heading and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
    await expect(page.getByText("Things I have built", { exact: false }).first()).toBeVisible();
  });

  test("lists every project as a card", async ({ page }) => {
    await expect(page.locator(".project-card")).toHaveCount(projects.length);
  });

  test("every card shows a summary and at least one tag", async ({ page }) => {
    const cards = page.locator(".project-card");
    for (let i = 0; i < projects.length; i++) {
      const card = cards.nth(i);
      await expect(card.locator(".project-card-summary")).not.toBeEmpty();
      await expect(card.locator(".project-card-tags li").first()).toBeVisible();
    }
  });

  for (const project of projects) {
    test(`card for ${project.title} links to its page`, async ({ page }) => {
      await page.locator(".project-card").getByRole("link", { name: project.title }).click();
      await expect(page).toHaveURL(project.url);
    });
  }
});

test.describe("project pages", () => {
  for (const project of projects) {
    test(`${project.title} renders its title, tag and content`, async ({ page }) => {
      await page.goto(project.url);
      await expect(page.getByRole("heading", { name: project.title, level: 1 })).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(`${project.title.replace(/\s+/g, "\\s")}.*Dillon Smedley`));
      await expect(page.getByRole("heading", { name: "What it is" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Stack" })).toBeVisible();
      await expect(page.locator(".post-content").getByText(project.tag).first()).toBeVisible();
    });

    if (project.external) {
      test(`${project.title} exposes its external link`, async ({ page }) => {
        await page.goto(project.url);
        const link = page.locator(`.project-links a[href^="${project.external}"]`);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("rel", /noopener/);
      });
    }
  }

  test("breadcrumbs lead back to the projects index", async ({ page }) => {
    await page.goto("/projects/swg-junkyard/");
    await page.locator(".breadcrumbs").getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL("/projects/");
  });
});
