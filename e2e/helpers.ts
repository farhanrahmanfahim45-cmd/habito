import type { Page } from "@playwright/test";

/**
 * Marks first-run onboarding as completed before the page loads so tests that
 * are not specifically testing onboarding go straight to the target screen.
 */
export async function bypassOnboarding(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("habito.onboarded", "true");
  });
}

/**
 * Environment-provided staging accounts for two-account / auth-dependent specs.
 * Demo mode runs without a database, so specs that need real Supabase accounts
 * skip with a clear reason unless these variables are provided.
 */
export const STAGING_ACCOUNTS = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL ?? "",
  renterEmail: process.env.E2E_RENTER_EMAIL ?? "",
  renterPassword: process.env.E2E_RENTER_PASSWORD ?? "",
  ownerEmail: process.env.E2E_OWNER_EMAIL ?? "",
  ownerPassword: process.env.E2E_OWNER_PASSWORD ?? "",
  adminEmail: process.env.E2E_ADMIN_EMAIL ?? "",
  adminPassword: process.env.E2E_ADMIN_PASSWORD ?? "",
};

export const hasRenterAccount = Boolean(
  STAGING_ACCOUNTS.baseUrl &&
    STAGING_ACCOUNTS.renterEmail &&
    STAGING_ACCOUNTS.renterPassword,
);

export const hasTwoAccounts = Boolean(
  hasRenterAccount &&
    STAGING_ACCOUNTS.ownerEmail &&
    STAGING_ACCOUNTS.ownerPassword,
);

export const hasAdminAccount = Boolean(
  STAGING_ACCOUNTS.baseUrl &&
    STAGING_ACCOUNTS.adminEmail &&
    STAGING_ACCOUNTS.adminPassword,
);

export const MISSING_AUTH_REASON =
  "Requires a Supabase-connected staging build (PLAYWRIGHT_BASE_URL) and test account credentials (E2E_RENTER_EMAIL, E2E_RENTER_PASSWORD, E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD). Skipped in local demo mode.";

export const MISSING_ADMIN_REASON =
  "Requires a Supabase-connected staging build (PLAYWRIGHT_BASE_URL) and admin credentials (E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD). Skipped in local demo mode.";

export async function signInWithEmail(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await bypassOnboarding(page);
  await page.goto("/signin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^Sign in/i }).click();
}
