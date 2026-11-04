import { test, expect } from "@playwright/test";
import { bypassOnboarding } from "./helpers";

test.describe(
  "Section E, F & N — Stage 3, Stage 4 (Navigation, Editing, Settings) & Bangla",
  { tag: ["@section-E", "@section-F", "@section-N"] },
  () => {
    test.beforeEach(async ({ page }) => {
      await bypassOnboarding(page);
    });

    test("[E.1, E.2, E.3, F.15, N.1, N.2, N.3, N.4] Language toggle switches interface to Bangla, renders Bengali digits in prices, translates seed listings, and survives refresh", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/space/SP-0226");
      await expect(page.getByRole("heading", { name: "Flat 7C" })).toBeVisible();

      // Switch to Bangla via header toggle
      const langGroup = page.locator("header").getByRole("group", { name: /Language/i });
      await langGroup.getByRole("button", { name: "বাং" }).click();

      await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");

      // [F.15] Saved reads সেভ করা, Messages reads মেসেজ
      await expect(page.locator("header").getByRole("link", { name: "সেভ করা" })).toBeVisible();
      await expect(page.locator("header").getByRole("link", { name: "মেসেজ" })).toBeVisible();

      // [N.1, N.2] Seed listing name and description render in Bangla with Bengali numerals
      await expect(page.getByRole("heading", { name: "ফ্ল্যাট ৭C" })).toBeVisible();
      await expect(page.getByText(/৪ তলায় ১২০০ বর্গফুটের ৩ রুমের ফ্ল্যাট।/)).toBeVisible();

      // [E.2] Bengali digits appear in prices (৳ + Bengali numerals)
      await expect(page.locator("aside").getByText(/৳[০-৯,]+/).first()).toBeVisible();

      // [E.3] Language choice survives a refresh
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");
      await expect(page.getByRole("heading", { name: "ফ্ল্যাট ৭C" })).toBeVisible();

      // [N.3] Filter labels in /search and footer are Bangla
      await page.goto("/search");
      await expect(page.locator("aside").getByText("ধরন")).toBeVisible();
      await expect(page.locator("aside").getByText("এলাকা")).toBeVisible();
    });

    test("[E.9, E.10, E.11, E.12] Occupancy rules filter in search, detail page rules, and listing flow living-only rules", async ({
      page,
    }) => {
      await page.goto("/search");
      const aside = page.locator("aside");
      await expect(aside.getByText("Who can live here")).toBeVisible();

      const initialCountText = await page.getByText(/^\d+ spaces$/).textContent();
      const initialCount = Number(initialCountText?.split(" ")[0] ?? 0);

      await aside.getByRole("button", { name: "Bachelors allowed" }).click();
      const filteredCountText = await page.getByText(/^\d+ spaces$/).textContent();
      const filteredCount = Number(filteredCountText?.split(" ")[0] ?? 0);
      expect(filteredCount).toBeLessThan(initialCount);

      // [E.11] Living space detail page shows "Who this is for"
      await page.goto("/space/SP-0226");
      await expect(page.getByRole("heading", { name: "Who this is for" })).toBeVisible();

      // [E.12] Listing flow asks about occupancy rules for living spaces and not for a garage
      await page.goto("/list");
      await page.getByRole("button", { name: "Apartment", exact: true }).click();
      await page.getByRole("button", { name: "Continue" }).click(); // Where
      await page.getByRole("button", { name: "Continue" }).click(); // Details
      await page.getByRole("button", { name: "Continue" }).click(); // Included
      await expect(page.getByRole("heading", { name: "Who this is for" })).toBeVisible();

      // Now go back to Step 1 and pick Garage (parking)
      await page.goto("/list");
      await page.getByRole("button", { name: "Garage", exact: true }).click();
      await page.getByRole("button", { name: "Continue" }).click(); // Where
      await page.getByRole("button", { name: "Continue" }).click(); // Details
      await page.getByRole("button", { name: "Continue" }).click(); // Included
      await expect(page.getByRole("heading", { name: "Who this is for" })).toHaveCount(0);
    });

    test("[F.1, F.2, F.4] Unified navigation in header and mobile bottom bar with no renter/owner mode switch", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/explore");
      const mainNav = page.locator("header").getByRole("navigation", { name: "Main" });
      await expect(mainNav.getByRole("link", { name: "Explore" })).toBeVisible();
      await expect(mainNav.getByRole("link", { name: "Search" })).toBeVisible();
      await expect(mainNav.getByRole("link", { name: "My spaces" })).toBeVisible();
      await expect(mainNav.getByRole("link", { name: "Bookings" })).toBeVisible();

      // Mobile bottom bar at 390px
      await page.setViewportSize({ width: 390, height: 844 });
      const mobileNav = page.locator("nav.fixed");
      await expect(mobileNav.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Search" })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Saved" })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Chats" })).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "My spaces" })).toBeVisible();
    });

    test("[F.5, F.6, F.8, F.9, F.10] Edit a space from My spaces, update price, archive and restore", async ({
      page,
    }) => {
      // [F.9] Own listing offers Edit instead of Send inquiry
      await page.goto("/space/SP-0226");
      await expect(page.locator("aside").getByRole("link", { name: "Edit" })).toBeVisible();
      await expect(page.locator("aside").getByRole("button", { name: "Send inquiry" })).toHaveCount(0);

      // [F.5, F.6] Open Edit from /portfolio
      await page.goto("/portfolio");
      await page.locator('a[href="/list/SP-0226"]').click();
      await expect(page).toHaveURL(/\/list\/SP-0226$/);
      await expect(page.getByRole("heading", { name: "Edit space" })).toBeVisible();

      // Step through to Price (Step 6) and change price
      for (let i = 0; i < 5; i++) {
        await page.getByRole("button", { name: "Continue" }).click();
      }
      await page.getByLabel("Monthly rent").fill("19500");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("button", { name: "Save changes" }).click();

      await expect(page).toHaveURL(/\/space\/SP-0226$/);
      await expect(page.locator("aside").getByText("৳19,500").first()).toBeVisible();

      // [F.10] Archive removes from search but keeps in My spaces marked Archived, and restore puts it back
      await page.goto("/list/SP-0226");
      await page.getByRole("button", { name: "Archive" }).click();
      await expect(page).toHaveURL(/\/portfolio$/);
      await expect(page.getByText("Archived").first()).toBeVisible();

      // Restore
      await page.goto("/list/SP-0226");
      await page.getByRole("button", { name: "Put back in search" }).click();
      await expect(page).toHaveURL(/\/portfolio$/);
    });

    test("[F.7] Clicking a step marker in /list/:id jumps directly to that step without six screens", async ({
      page,
    }) => {
      await page.goto("/list/SP-0226");
      await expect(page.getByRole("heading", { name: "Edit space" })).toBeVisible();

      // TESTING.md Section F: "The step markers are clickable, so a price change doesn't need six screens"
      const progressList = page.getByRole("list", { name: "Progress" });
      await progressList.getByText("Price", { exact: true }).click();
      await expect(page.getByRole("heading", { name: "Price and availability" })).toBeVisible();
    });

    test("[F.11, F.12, F.13] Settings page is reachable from header, switches language, and toggles notification switches", async ({
      page,
    }) => {
      await page.goto("/explore");
      await page.locator("header").getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL(/\/settings$/);
      await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

      // Notification switch toggles
      const msgSwitch = page.getByRole("switch", { name: "New messages" });
      await expect(msgSwitch).toHaveAttribute("aria-checked", "true");
      await msgSwitch.click();
      await expect(msgSwitch).toHaveAttribute("aria-checked", "false");

      // Language toggle in Settings switches language
      await page.locator("main").getByRole("button", { name: "বাং" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");
      await expect(page.getByRole("heading", { name: "সেটিংস" })).toBeVisible();
    });
  },
);
