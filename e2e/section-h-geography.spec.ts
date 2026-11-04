import { test, expect } from "@playwright/test";
import { bypassOnboarding } from "./helpers";

test.describe("Section H — Geography & Area Picker", { tag: "@section-H" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[H.1, H.2, H.3] AreaPicker opens a searchable sheet grouped by region and matches neighbourhoods to their thana", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.locator("aside").getByRole("button", { name: "Everywhere" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // [H.2] Grouped: Dhaka Metro, Greater Dhaka, then other divisions
    await expect(dialog.getByRole("heading", { name: "Dhaka Metro" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Greater Dhaka" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Chattogram" })).toBeVisible();

    // [H.3] Typing a neighbourhood finds its thana
    const searchInput = dialog.getByPlaceholder("Search an area or neighbourhood");

    await searchInput.fill("kazipara");
    await expect(dialog.getByRole("button", { name: /Mirpur Model/i })).toBeVisible();
    await expect(dialog.getByText(/Kazipara · Dhaka/i)).toBeVisible();

    await searchInput.fill("banasree");
    await expect(dialog.getByRole("button", { name: /Rampura/i })).toBeVisible();
    await expect(dialog.getByText(/Banasree · Dhaka/i)).toBeVisible();

    await searchInput.fill("sector 7");
    await expect(dialog.getByRole("button", { name: /Uttara East/i })).toBeVisible();
    await expect(dialog.getByText(/Sector 7 · Dhaka/i)).toBeVisible();
  });

  test("[H.4, H.5] Search filter has 'Everywhere' option while listing form does not; changing area updates results", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.locator("aside").getByRole("button", { name: "Everywhere" }).click();
    const searchDialog = page.getByRole("dialog");
    await expect(searchDialog.getByRole("button", { name: "Everywhere" })).toBeVisible();

    // Select Mirpur Model and verify search results appear
    await searchDialog.getByPlaceholder("Search an area or neighbourhood").fill("Mirpur Model");
    await searchDialog.getByRole("button", { name: /Mirpur Model/i }).click();
    await expect(page.locator("article").first()).toBeVisible();

    // Listing form AreaPicker (for a new property) does NOT have "Everywhere"
    await page.goto("/list");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("A new property").check();
    await page.getByRole("button", { name: /Mirpur/i }).click();
    const listDialog = page.getByRole("dialog");
    await expect(listDialog).toBeVisible();
    await expect(listDialog.getByRole("button", { name: "Everywhere" })).toHaveCount(0);
  });
});
