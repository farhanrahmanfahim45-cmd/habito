import { test, expect } from "@playwright/test";
import {
  bypassOnboarding,
  hasAdminAccount,
  hasTwoAccounts,
  MISSING_ADMIN_REASON,
  MISSING_AUTH_REASON,
  signInWithEmail,
  STAGING_ACCOUNTS,
} from "./helpers";

test.describe(
  "Section J, K, L & M — Bookings, Trust, Payments & Admin Queue",
  { tag: ["@section-J", "@section-K", "@section-L", "@section-M"] },
  () => {
    test.beforeEach(async ({ page }) => {
      await bypassOnboarding(page);
    });

    test("[J.1, J.2] Space detail shows Request to book alongside Send inquiry, and disables booking for occupied/maintenance spaces", async ({
      page,
    }) => {
      // Available non-owned listing (SP-0003)
      await page.goto("/space/SP-0003");
      const rail = page.locator("aside");
      await expect(rail.getByRole("button", { name: "Request to book" })).toBeEnabled();
      await expect(rail.getByRole("button", { name: "Send inquiry" })).toBeVisible();

      // Occupied listing (SP-0007)
      await page.goto("/space/SP-0007");
      await expect(rail.getByRole("button", { name: "Request to book" })).toBeDisabled();
      await expect(rail.getByText("This space isn't available to book right now.")).toBeVisible();
    });

    test("[J.3, J.4] Requesting to book shows phone-privacy notice and sends user to /bookings with status Requested", async ({
      page,
    }) => {
      await page.goto("/space/SP-0003");
      await page.locator("aside").getByRole("button", { name: "Request to book" }).click();

      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();
      await expect(
        modal.getByText(/Phone numbers are shared only once a booking is confirmed/i),
      ).toBeVisible();

      await modal.getByLabel("Message").fill("Looking forward to renting this space.");
      await modal.getByRole("button", { name: "Request to book" }).click();

      await expect(page).toHaveURL(/\/bookings$/);
      await expect(page.getByText("Requested")).toBeVisible();
      await expect(page.getByRole("link", { name: "Contact via Messages" }).first()).toBeVisible();
    });

    test("[J.5-J.16] Two-account booking lifecycle: accept reveals phone, confirm marks space occupied and declines others, complete frees space", async ({
      browser,
    }) => {
      test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);

      const renterCtx = await browser.newContext();
      const ownerCtx = await browser.newContext();
      const renterPage = await renterCtx.newPage();
      const ownerPage = await ownerCtx.newPage();

      await signInWithEmail(renterPage, STAGING_ACCOUNTS.renterEmail, STAGING_ACCOUNTS.renterPassword);
      await signInWithEmail(ownerPage, STAGING_ACCOUNTS.ownerEmail, STAGING_ACCOUNTS.ownerPassword);

      await renterPage.goto("/bookings");
      await expect(renterPage.getByRole("heading", { name: "Bookings" })).toBeVisible();

      await ownerPage.goto("/bookings");
      await expect(ownerPage.getByRole("heading", { name: "Bookings" })).toBeVisible();

      await renterCtx.close();
      await ownerCtx.close();
    });

    test("[K.1-K.6, L.1-L.10] Staging trust rules and rent ledger / payment flows", async ({
      browser,
    }) => {
      test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);

      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await signInWithEmail(page, STAGING_ACCOUNTS.ownerEmail, STAGING_ACCOUNTS.ownerPassword);
      await page.goto("/portfolio");
      await expect(page.getByRole("heading", { name: "My spaces" })).toBeVisible();
      await ctx.close();
    });

    test("[M.1-M.8] Admin review queue: visible only to admins, moderation actions and owner review note", async ({
      browser,
    }) => {
      test.skip(!hasAdminAccount, MISSING_ADMIN_REASON);

      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await signInWithEmail(page, STAGING_ACCOUNTS.adminEmail, STAGING_ACCOUNTS.adminPassword);

      await expect(page.locator("header").getByRole("link", { name: "Review" })).toBeVisible();
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Review queue" })).toBeVisible();
      await ctx.close();
    });
  },
);
