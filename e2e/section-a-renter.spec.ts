import { test, expect } from "@playwright/test";
import {
  bypassOnboarding,
  hasRenterAccount,
  MISSING_AUTH_REASON,
  signInWithEmail,
  STAGING_ACCOUNTS,
} from "./helpers";

test.describe("Section A — Renter", { tag: "@section-A" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[A.3] Browse listings without signing in", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();

    await page.goto("/search");
    await expect(page.getByRole("heading", { name: "Find a space" })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("[A.4] Filter by category, area, price; sort each way", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("article").first()).toBeVisible();

    // Filter by category: Living
    const aside = page.locator("aside");
    await aside.getByRole("button", { name: "Living", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Living" })).toBeVisible();

    // Filter by area using AreaPicker
    await aside.getByRole("button", { name: "Everywhere" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByPlaceholder("Search an area or neighbourhood").fill("Dhanmondi");
    await dialog.getByRole("button", { name: /Dhanmondi/i }).first().click();
    await expect(dialog).toBeHidden();

    // Reset area to Everywhere so we have plenty of results to sort
    await aside.getByRole("button", { name: /Dhanmondi/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Everywhere" }).click();

    // Filter by price slider
    const slider = aside.getByRole("slider", { name: "Maximum monthly price" });
    await slider.fill("30000");
    await expect(aside.getByText(/Rent up to ৳30,000/)).toBeVisible();

    // Sort each way
    const sortSelect = page.getByLabel("Sort");
    for (const sortValue of ["price-low", "price-high", "recent", "size", "best-match"]) {
      await sortSelect.selectOption(sortValue);
      await expect(page.locator("article").first()).toBeVisible();
    }
  });

  test("[A.5] Enter requirements at /find; matches are scored with reasons", async ({ page }) => {
    await page.goto("/find");
    await expect(page.getByRole("heading", { name: "Tell us what you need." })).toBeVisible();

    await page.getByRole("button", { name: "Living" }).click();
    await page.getByLabel("Minimum").fill("8000");
    await page.getByLabel("Maximum").fill("25000");
    await page.getByRole("button", { name: "Show my matches" }).click();

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByText(/Scored against your needs:/)).toBeVisible();

    // Cards show percentage match pills
    const firstCard = page.locator("article").first();
    await expect(firstCard.getByText(/%/)).toBeVisible();

    // Open the space and verify match breakdown with reasons
    await firstCard.getByRole("link").first().click();
    await expect(page.getByRole("heading", { name: "Why this scores as it does" })).toBeVisible();
    await expect(page.getByText("Budget", { exact: true })).toBeVisible();
    await expect(page.getByText("Location", { exact: true })).toBeVisible();
  });

  test("[A.6] Open a space: images, cost breakdown, availability, owner, sibling spaces", async ({
    page,
  }) => {
    // SP-0226 (Flat 7C in PR-D1) has sibling spaces in PR-D1
    await page.goto("/space/SP-0226");
    await expect(page.getByRole("heading", { name: "Flat 7C" })).toBeVisible();

    // Images gallery + view all trigger
    await expect(page.getByText(/view all/i)).toBeVisible();

    // Cost breakdown
    await expect(page.getByRole("heading", { name: "Monthly cost" })).toBeVisible();
    await expect(page.getByText("Service charge")).toBeVisible();
    await expect(page.getByText("Utilities")).toBeVisible();

    // Availability
    await expect(page.getByText(/Available/i).first()).toBeVisible();

    // Owner section
    await expect(page.getByRole("heading", { name: "Owner" })).toBeVisible();
    await expect(page.getByText(/Replies to \d+% of inquiries/)).toBeVisible();

    // Sibling spaces at the same property
    await expect(page.getByRole("heading", { name: /More at/i })).toBeVisible();
  });

  test("[A.7] Save a space — persists across reload", async ({ page }) => {
    await page.goto("/space/SP-0226");
    const saveBtn = page.locator("aside").getByRole("button", { name: /^Save$/i });
    await saveBtn.click();
    await expect(page.locator("aside").getByRole("button", { name: /^Saved$/i })).toBeVisible();

    await page.reload();
    await expect(page.locator("aside").getByRole("button", { name: /^Saved$/i })).toBeVisible();

    await page.goto("/saved");
    await expect(page.getByRole("heading", { name: "Saved spaces" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Flat 7C" })).toBeVisible();
  });

  test("[A.8] Compare two spaces", async ({ page }) => {
    await page.goto("/search");
    const compareButtons = page.getByRole("button", { name: /Add .* to compare/i });
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();

    // Compare tray appears at the bottom
    await expect(page.getByText("Compare 2")).toBeVisible();
    await page.getByRole("link", { name: /Compare/i }).last().click();

    await expect(page).toHaveURL(/\/compare$/);
    await expect(page.getByText(/2 spaces side by side/)).toBeVisible();
    const table = page.getByRole("table", {
      name: /Side-by-side comparison of the spaces you selected/i,
    });
    await expect(table).toBeVisible();
    await expect(table.getByRole("rowheader", { name: "Price", exact: true })).toBeVisible();
    await expect(table.getByRole("rowheader", { name: "Total monthly", exact: true })).toBeVisible();
    await expect(table.getByRole("rowheader", { name: "Availability", exact: true })).toBeVisible();
  });

  test("[A.9] Send an inquiry on an owner's listing", async ({ page }) => {
    // SP-0003 belongs to a non-DEMO_OWNER_ID owner so Send inquiry is shown
    await page.goto("/space/SP-0003");
    await page.locator("aside").getByRole("button", { name: "Send inquiry" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByLabel("Your name").fill("Nadia Islam");
    await modal.getByLabel("Phone").fill("01711223344");
    await modal.getByLabel("Message").fill("Is this space still available from next month?");
    await modal.getByRole("button", { name: "Send inquiry" }).click();

    await expect(modal.getByText("Inquiry sent")).toBeVisible();
    await expect(modal.getByRole("button", { name: "Open conversation" })).toBeVisible();
  });

  test("[A.10] Post a space request — persists across reload", async ({ page }) => {
    await page.goto("/requests");
    await page.getByRole("button", { name: "Post a request" }).first().click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByLabel("Anything else").fill("Need ground floor with generator backup");
    await modal.getByRole("button", { name: "Post", exact: true }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText("Need ground floor with generator backup")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Need ground floor with generator backup")).toBeVisible();
  });

  test("[A.1, A.2, A.11] Register/sign in, session survives refresh, edit name and phone on /account", async ({
    page,
  }) => {
    test.skip(!hasRenterAccount, MISSING_AUTH_REASON);

    await signInWithEmail(page, STAGING_ACCOUNTS.renterEmail, STAGING_ACCOUNTS.renterPassword);
    await expect(page).toHaveURL(/\/(explore|portfolio)/);

    // Session survives a refresh
    await page.reload();
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();

    // Edit name and phone on /account — persists
    const nameInput = page.getByLabel("Name");
    await nameInput.fill("Renter E2E Updated");
    await page.getByRole("button", { name: /Save/i }).click();
    await page.reload();
    await expect(page.getByLabel("Name")).toHaveValue("Renter E2E Updated");
  });
});
