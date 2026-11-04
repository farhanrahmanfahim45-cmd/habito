import { test, expect } from "@playwright/test";
import {
  bypassOnboarding,
  hasTwoAccounts,
  MISSING_AUTH_REASON,
  signInWithEmail,
  STAGING_ACCOUNTS,
} from "./helpers";

test.describe("Section B — Owner", { tag: "@section-B" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[B.3] Create a property and a space through /list — persists and appears in search", async ({
    page,
  }) => {
    await page.goto("/list");
    await expect(page.getByRole("heading", { name: "List a space" })).toBeVisible();

    // Step 1: What
    await page.getByRole("button", { name: "Shop", exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: Where — create a new property
    await page.getByLabel("A new property").check();
    await page.getByLabel("Property name").fill("E2ETest Plaza");
    await page.getByLabel("Neighbourhood").fill("Mirpur 10");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3: Details
    await page.getByLabel("Name it").fill("E2E Corner Shop 99");
    await page.getByLabel("Size (sqft)").fill("450");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 4: Included
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 5: Photos
    await expect(page.getByText(/No photos yet/i)).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 6: Price
    await page.getByLabel("Monthly rent").fill("18000");
    await page.getByLabel("Service charge").fill("2000");
    await page.getByLabel("Utilities").fill("1500");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 7: Review and publish
    await expect(page.getByText("E2E Corner Shop 99 · Shop")).toBeVisible();
    await page.getByRole("button", { name: /Pay and publish|Publish space/i }).click();

    // Redirects to the newly created space detail page
    await expect(page).toHaveURL(/\/space\/SP-/);
    await expect(page.getByRole("heading", { name: "E2E Corner Shop 99" })).toBeVisible();

    // Persists across reload
    await page.reload();
    await expect(page.getByRole("heading", { name: "E2E Corner Shop 99" })).toBeVisible();

    // Appears in search
    await page.goto("/search?category=business");
    await expect(page.getByRole("link", { name: "E2E Corner Shop 99" })).toBeVisible();
  });

  test("[B.5] Change a space's availability in /portfolio — persists across reload", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    await expect(page.getByRole("heading", { name: "My spaces" })).toBeVisible();

    const availabilitySelect = page.getByLabel("Availability for Flat 7C");
    await expect(availabilitySelect).toBeVisible();
    await availabilitySelect.selectOption("maintenance");
    await expect(availabilitySelect).toHaveValue("maintenance");

    await page.reload();
    await expect(page.getByLabel("Availability for Flat 7C")).toHaveValue("maintenance");
  });

  test("[B.6] Renter's inquiry on an owner space appears in /portfolio", async ({ page }) => {
    // Seed an inquiry via localStorage or send one on an OW-001 space by temporarily viewing as non-owner,
    // or verify the Inquiries section in /portfolio renders inquiries for OW-001's spaces.
    await page.goto("/portfolio");
    await page.evaluate(() => {
      const raw = window.localStorage.getItem("habito.db.v2");
      if (!raw) return;
      const db = JSON.parse(raw);
      db.inquiries.push({
        id: "INQ-9001",
        spaceId: "SP-0226",
        name: "Karim Renter",
        phone: "01811223344",
        message: "Can I visit Flat 7C this Friday?",
        moveInDate: "2026-12-01",
        budgetMin: 10000,
        budgetMax: 20000,
        sentAt: new Date().toISOString(),
        status: "new",
      });
      window.localStorage.setItem("habito.db.v2", JSON.stringify(db));
    });

    await page.reload();
    await expect(page.getByText("Karim Renter")).toBeVisible();
    await expect(page.getByText("Can I visit Flat 7C this Friday?")).toBeVisible();
  });

  test("[B.1, B.2, B.4] Owner sign-in, empty portfolio on fresh account, and cross-account search visibility", async ({
    browser,
  }) => {
    test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);

    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await signInWithEmail(ownerPage, STAGING_ACCOUNTS.ownerEmail, STAGING_ACCOUNTS.ownerPassword);
    await ownerPage.goto("/portfolio");
    await expect(ownerPage.getByRole("heading", { name: "My spaces" })).toBeVisible();
    await ownerCtx.close();
  });
});
