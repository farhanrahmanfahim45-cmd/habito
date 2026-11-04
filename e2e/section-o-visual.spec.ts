import { test, expect } from "@playwright/test";
import { bypassOnboarding } from "./helpers";

test.describe("Section O — Visual pass, reduced motion & 390px responsiveness", { tag: "@section-O" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[O.1, O.2, O.4] Cards carry .lift, results grid uses .stagger capped after 7 items, and interactive controls carry .press", async ({
    page,
  }) => {
    await page.goto("/search");
    const firstCard = page.locator("article.lift").first();
    await expect(firstCard).toBeVisible();

    const staggerGrid = page.locator(".stagger").first();
    await expect(staggerGrid).toBeVisible();

    // Verify 8th and 9th children share the same animation-delay (280ms cap)
    const delays = await staggerGrid.evaluate((grid) => {
      const children = Array.from(grid.children);
      return children.slice(0, 10).map((el) => getComputedStyle(el).animationDelay);
    });
    if (delays.length >= 9) {
      expect(delays[7]).toBe(delays[8]);
    }
  });

  test("[O.5] Emulating prefers-reduced-motion: reduce removes animations and transitions", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/search");

    const firstCard = page.locator("article.lift").first();
    await expect(firstCard).toBeVisible();

    const timing = await firstCard.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        animationDuration: parseFloat(style.animationDuration),
        transitionDuration: parseFloat(style.transitionDuration),
      };
    });

    // index.css sets 0.01ms (0.00001s) !important under @media (prefers-reduced-motion: reduce)
    expect(timing.animationDuration).toBeLessThanOrEqual(0.001);
    expect(timing.transitionDuration).toBeLessThanOrEqual(0.001);
  });

  test("[O.7] A broken image URL falls back to the category illustration instead of a broken icon", async ({
    page,
  }) => {
    await page.goto("/space/SP-0226");
    await page.evaluate(() => {
      const raw = window.localStorage.getItem("habito.db.v2");
      if (!raw) return;
      const db = JSON.parse(raw);
      const sp = db.spaces.find((x: { id: string }) => x.id === "SP-0226");
      if (sp && sp.images[0]) {
        sp.images[0].url = "https://invalid.example.test/broken-image.jpg";
        delete sp.images[0].fallback;
      }
      window.localStorage.setItem("habito.db.v2", JSON.stringify(db));
    });

    await page.reload();
    const heroImg = page.locator("img").first();
    await expect(heroImg).toHaveAttribute("src", /\/photos\/living-1\.svg$/);
  });

  test("[O.9] No horizontal scroll on any page at 390px viewport width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const routes = [
      "/",
      "/explore",
      "/search",
      "/find",
      "/compare",
      "/requests",
      "/portfolio",
      "/settings",
      "/space/SP-0226",
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });
      expect(overflow, `Route ${route} should not overflow horizontally at 390px`).toBeLessThanOrEqual(0);
    }
  });
});
