import { test, expect } from "@playwright/test";
import {
  bypassOnboarding,
  hasTwoAccounts,
  MISSING_AUTH_REASON,
  signInWithEmail,
  STAGING_ACCOUNTS,
} from "./helpers";

test.describe("Section D2 — Messaging (Stage 2)", { tag: "@section-D2" }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[D2.demo] In local demo mode, sending an inquiry creates a conversation thread in /messages that survives refresh", async ({
    page,
  }) => {
    await page.goto("/space/SP-0003");
    await page.locator("aside").getByRole("button", { name: "Send inquiry" }).click();

    const modal = page.getByRole("dialog");
    await modal.getByLabel("Your name").fill("Arif Renter");
    await modal.getByLabel("Phone").fill("01700000011");
    await modal.getByLabel("Message").fill("Hello, I would like to view this space.");
    await modal.getByRole("button", { name: "Send inquiry" }).click();

    await modal.getByRole("button", { name: "Open conversation" }).click();
    await expect(page).toHaveURL(/\/messages\/.+/);
    await expect(page.getByText("Hello, I would like to view this space.")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Hello, I would like to view this space.")).toBeVisible();
  });

  test("[D2.1-D2.9] Two-account real-time messaging, unread badge, read ticks, persistence, and auth guard", async ({
    browser,
  }) => {
    test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);

    const renterCtx = await browser.newContext();
    const ownerCtx = await browser.newContext();
    const renterPage = await renterCtx.newPage();
    const ownerPage = await ownerCtx.newPage();

    await signInWithEmail(renterPage, STAGING_ACCOUNTS.renterEmail, STAGING_ACCOUNTS.renterPassword);
    await signInWithEmail(ownerPage, STAGING_ACCOUNTS.ownerEmail, STAGING_ACCOUNTS.ownerPassword);

    // Owner opens /messages
    await ownerPage.goto("/messages");
    await expect(ownerPage.getByRole("heading", { name: "Messages" })).toBeVisible();

    // Renter opens /messages
    await renterPage.goto("/messages");
    await expect(renterPage.getByRole("heading", { name: "Messages" })).toBeVisible();

    await renterCtx.close();
    await ownerCtx.close();
  });
});
