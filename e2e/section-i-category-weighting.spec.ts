import { test, expect } from "@playwright/test";
import { bypassOnboarding } from "./helpers";

test.describe("Section I — Category weighting", { tag: "@section-I" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[I.1] /find asks a different capacity question per category", async ({ page }) => {
    await page.goto("/find");

    await page.getByRole("button", { name: "Living" }).click();
    await expect(page.getByRole("heading", { name: /How many bedrooms\?/i })).toBeVisible();

    await page.getByRole("button", { name: "Business" }).click();
    await expect(page.getByRole("heading", { name: /Minimum size/i })).toBeVisible();

    await page.getByRole("button", { name: "Storage" }).click();
    await expect(page.getByRole("heading", { name: /How much storage space\?/i })).toBeVisible();
    await expect(page.getByText("Ceiling height")).toBeVisible();

    await page.getByRole("button", { name: "Parking" }).click();
    await expect(page.getByRole("heading", { name: /How many vehicles\?/i })).toBeVisible();
    await expect(page.getByText("Motorcycles")).toBeVisible();

    await page.getByRole("button", { name: "Land & rural" }).click();
    await expect(page.getByRole("heading", { name: /How much land\?/i })).toBeVisible();
  });

  test("[I.2, I.3, I.4, I.5] Category-specific match breakdowns for parking, shop, godown, and parking slot shortfall", async ({
    page,
  }) => {
    // State needs on /find: Parking, 2 vehicles
    await page.goto("/find");
    await page.getByRole("button", { name: "Parking" }).click();
    await page.getByRole("button", { name: "2", exact: true }).first().click();
    await page.getByRole("button", { name: "Show my matches" }).click();

    // [I.2, I.5] Open SP-0233 (Parking slot 1 with 1 car slot free)
    await page.goto("/space/SP-0233");
    const breakdown = page.locator("aside");
    await expect(breakdown.getByRole("heading", { name: "Why this scores as it does" })).toBeVisible();

    // [I.2] Parking listing has NO size/capacity/slots row at all (only Budget, Location, Space type, Availability, Amenities)
    await expect(breakdown.getByText("Size", { exact: true })).toHaveCount(0);
    await expect(breakdown.getByText("Slots", { exact: true })).toHaveCount(0);
    await expect(breakdown.getByText("Capacity", { exact: true })).toHaveCount(0);

    // [I.5] Asking for 2 car slots on a parking space with 1 free scores Availability down (10/20) with the free-slot note
    await expect(breakdown.getByText("1 car slot free")).toBeVisible();
    await expect(breakdown.getByText("10/20")).toBeVisible();

    // [I.3] A shop's breakdown (SP-0228) gives Location (30) more weight than Budget (24)
    await page.goto("/space/SP-0228");
    await expect(breakdown.getByText(/\/30$/)).toBeVisible();
    await expect(breakdown.getByText(/\/24$/)).toBeVisible();

    // [I.4] A godown's breakdown (SP-0041) gives Capacity 20 points (/20)
    await page.goto("/space/SP-0041");
    await expect(breakdown.getByText("Capacity", { exact: true })).toBeVisible();
    await expect(breakdown.getByText(/\/20$/)).toBeVisible();
  });
});
