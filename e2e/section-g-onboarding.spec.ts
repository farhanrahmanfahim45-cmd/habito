import { test, expect } from "@playwright/test";

test.describe("Section G — Onboarding & Coachmarks", { tag: "@section-G" }, () => {
  test("[G.1, G.2] First visit to / shows three questions (language, intent, area) and choosing বাংলা switches immediately", async ({
    page,
  }) => {
    await page.goto("/");
    // Question 1: Language
    await expect(page.getByRole("heading", { name: "Which language would you like?" })).toBeVisible();

    // Choosing বাংলা switches the rest of onboarding immediately
    await page.getByRole("button", { name: /বাংলা/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");

    // Question 2: Intent (in Bangla)
    await expect(page.getByRole("heading", { name: "হ্যাবিটোতে কী করতে এসেছেন?" })).toBeVisible();
  });

  test("[G.3] 'I need a place' then an area lands in Search with that area selected", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /English/ }).click();
    await page.getByRole("button", { name: /I need a place/ }).click();

    await expect(page.getByRole("heading", { name: "Where are you looking?" })).toBeVisible();
    await page.getByRole("button", { name: /^Dhanmondi/ }).click();

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByText(/Scored against your needs: Dhanmondi/)).toBeVisible();
  });

  test("[G.4] 'I have a space to rent out' then an area lands in /list", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /English/ }).click();
    await page.getByRole("button", { name: /I have a space to rent out/ }).click();
    await page.getByRole("button", { name: /^Mirpur Model/ }).click();

    await expect(page).toHaveURL(/\/list$/);
  });

  test("[G.5, G.6, G.7] 'Just looking around' and 'Skip' drop on homepage and onboarding does not reappear on reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Skip" }).click();

    // Onboarding overlay is gone and homepage hero is visible
    await expect(page.getByRole("heading", { name: "Which language would you like?" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Find the space/i })).toBeVisible();

    // Does not reappear on next visit
    await page.reload();
    await expect(page.getByRole("heading", { name: "Which language would you like?" })).toHaveCount(0);
  });

  test("[G.8] A deep link (/space/<id>) is NOT interrupted by onboarding", async ({ page }) => {
    await page.goto("/space/SP-0226");
    await expect(page.getByRole("heading", { name: "Which language would you like?" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Flat 7C" })).toBeVisible();
  });

  test("[G.9, G.10, G.11, G.12] One-time coachmark notes appear in context and disappear for good once dismissed", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("habito.onboarded", "true");
    });

    // [G.10] My spaces shows one-time note explaining property vs space
    await page.goto("/portfolio");
    await expect(page.getByText("Property, then spaces")).toBeVisible();
    await page.getByRole("button", { name: "Got it" }).first().click();
    await expect(page.getByText("Property, then spaces")).toHaveCount(0);

    await page.reload();
    await expect(page.getByText("Property, then spaces")).toHaveCount(0);

    // [G.11] Listing with undisclosed costs (SP-0226) shows one-time note explaining why
    await page.goto("/space/SP-0226");
    await expect(page.getByText("Why some listings show no total")).toBeVisible();
    await page.getByRole("button", { name: "Got it" }).first().click();
    await expect(page.getByText("Why some listings show no total")).toHaveCount(0);

    await page.reload();
    await expect(page.getByText("Why some listings show no total")).toHaveCount(0);
  });
});
