import { defineConfig, devices } from "@playwright/test";

/**
 * Habito E2E configuration.
 *
 * Defaults to running against `npm run dev` in local demo mode with
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY cleared so tests never hit the
 * live production Supabase database.
 *
 * Set PLAYWRIGHT_BASE_URL (plus E2E_RENTER_* / E2E_OWNER_* / E2E_ADMIN_*) to
 * run against a dedicated staging build.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 5173 --strictPort",
        url: "http://localhost:5173",
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
          VITE_SUPABASE_URL: "",
          VITE_SUPABASE_ANON_KEY: "",
        },
      },
});
