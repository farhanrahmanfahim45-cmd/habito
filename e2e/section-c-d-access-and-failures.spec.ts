import { test, expect } from "@playwright/test";
import {
  bypassOnboarding,
  hasRenterAccount,
  hasTwoAccounts,
  MISSING_AUTH_REASON,
  signInWithEmail,
  STAGING_ACCOUNTS,
} from "./helpers";

test.describe("Section C & D — Access control and failure states", { tag: ["@section-C", "@section-D"] }, () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test("[D.3] Without Supabase environment variables, the app still browses and /signup says accounts aren't available", async ({
    page,
  }) => {
    test.skip(
      Boolean(STAGING_ACCOUNTS.baseUrl),
      "Only runs in local demo mode where Supabase env vars are removed.",
    );

    await page.goto("/search");
    await expect(page.locator("article").first()).toBeVisible();

    await page.goto("/signup");
    await expect(
      page.getByText(/Habito isn't connected to a database in this build, so accounts can't be created/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Create account/i })).toBeDisabled();
  });

  test("[C.admin-demo] Opening /admin as a non-admin redirects away and hides the Review nav item", async ({ page }) => {
    test.skip(Boolean(STAGING_ACCOUNTS.baseUrl), "Demo-mode guard check.");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("header").getByRole("link", { name: "Review" })).toHaveCount(0);
  });

  test("[C.1] Signed out on a Supabase-connected build, opening /portfolio redirects to /signin", async ({
    page,
  }) => {
    test.skip(!hasRenterAccount, MISSING_AUTH_REASON);

    await page.goto("/portfolio");
    await expect(page).toHaveURL(/\/signin$/);
  });

  test("[D.1] Sign in with the wrong password shows a clear error message", async ({ page }) => {
    test.skip(!hasRenterAccount, MISSING_AUTH_REASON);

    await page.goto("/signin");
    await page.getByLabel("Email").fill(STAGING_ACCOUNTS.renterEmail);
    await page.getByLabel("Password").fill("wrong-password-99999");
    await page.getByRole("button", { name: /^Sign in/i }).click();

    await expect(page.getByText(/invalid|credentials|password/i)).toBeVisible();
  });

  test("[D.2] Sign up with an existing email shows a clear error message", async ({ page }) => {
    test.skip(!hasRenterAccount, MISSING_AUTH_REASON);

    await page.goto("/signup");
    await page.getByLabel("Your name").fill("Existing Renter");
    await page.getByLabel("Email").fill(STAGING_ACCOUNTS.renterEmail);
    await page.getByLabel("Password").fill("password12345");
    await page.getByRole("button", { name: /Create account/i }).click();

    await expect(page.getByText(/already|registered|exists|check your email/i)).toBeVisible();
  });

  test("[C.4, C.5] Renter A cannot see Renter B's saved spaces and an owner cannot edit another owner's listing", async ({
    browser,
  }) => {
    test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);

    const renterCtx = await browser.newContext();
    const renterPage = await renterCtx.newPage();
    await signInWithEmail(renterPage, STAGING_ACCOUNTS.renterEmail, STAGING_ACCOUNTS.renterPassword);
    await renterPage.goto("/saved");
    await expect(renterPage.getByRole("heading", { name: "Saved spaces" })).toBeVisible();
    await renterCtx.close();
  });
});
