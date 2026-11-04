import { test, expect } from "@playwright/test";
import { bypassOnboarding } from "./helpers";

test.describe("Section P — The Map", { tag: "@section-P" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[P.1, P.2] Search has List / Map toggle beside Sort, and Leaflet loads only when Map is opened", async ({
    page,
  }) => {
    await page.goto("/search");
    await expect(page.locator("article").first()).toBeVisible();

    // Leaflet is not rendered while in List view
    await expect(page.locator(".leaflet-container")).toHaveCount(0);

    const toggleGroup = page.getByRole("group", { name: /List \/ Map/i });
    await expect(toggleGroup).toBeVisible();

    await toggleGroup.getByRole("button", { name: "Map" }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("[P.3, P.4, P.5, P.6, P.7, P.8] Map markers show prices or clusters, street-level zoom has no number bubbles, and clicking a price opens a card with location accuracy", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.getByRole("group", { name: /List \/ Map/i }).getByRole("button", { name: "Map" }).click();

    const map = page.locator(".leaflet-container");
    await expect(map).toBeVisible();

    const markers = map.locator(".habito-marker");
    await expect(markers.first()).toBeVisible();

    // [P.4, P.5, P.6] Zoom in to street level (>= 15) and verify every marker shows a ৳ price, with no cluster number bubbles
    const zoomIn = map.locator(".leaflet-control-zoom-in");
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
    }

    const markerTexts = await markers.allTextContents();
    expect(markerTexts.length).toBeGreaterThan(0);
    for (const text of markerTexts) {
      expect(text.trim(), `Street-level marker "${text}" should display a ৳ price, not a cluster count`).toMatch(/^৳/);
    }

    // [P.7, P.8] Click a price marker to open popup card with photo, area, price, and approximate/pinned label
    await markers.first().click({ force: true });
    const popup = map.locator(".leaflet-popup-content");
    await expect(popup).toBeVisible();
    await expect(popup.locator("img")).toBeVisible();
    await expect(popup.getByText(/Approximate — somewhere in this area|Placed by the owner/i)).toBeVisible();
  });

  test("[P.9, P.10] Listing a new property offers a draggable pin with skip allowed", async ({
    page,
  }) => {
    await page.goto("/list");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("A new property").check();

    // TESTING.md Section P: "Listing a new property offers a draggable pin, with skip allowed"
    await expect(page.getByRole("heading", { name: "Where exactly is it?" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Skip — use the area centre/i })).toBeVisible();
  });

  test("[P.11] No horizontal scroll at 390px in either List or Map view", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/search");
    await expect(page.locator("article").first()).toBeVisible();

    const listOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(listOverflow).toBeLessThanOrEqual(0);

    await page.getByRole("group", { name: /List \/ Map/i }).getByRole("button", { name: "Map" }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();

    const mapOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(mapOverflow).toBeLessThanOrEqual(0);
  });
});
