# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-b-owner.spec.ts >> Section B — Owner >> [B.3] Create a property and a space through /list — persists and appears in search
- Location: e2e\section-b-owner.spec.ts:15:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/space\/SP-/
Received string:  "http://localhost:5173/list"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en" data-lang="en">…</html>
       - unexpected value "http://localhost:5173/list"

```

```yaml
- paragraph:
  - strong: Prototype.
  - text: Listings, owners and images are synthetic seed data and do not represent real availability.
- banner:
  - link "Habito":
    - /url: /
  - navigation "Main":
    - link "Explore":
      - /url: /explore
    - link "Search":
      - /url: /search
    - link "My spaces":
      - /url: /portfolio
    - link "Bookings":
      - /url: /bookings
  - link "Saved":
    - /url: /saved
  - link "Messages":
    - /url: /messages
  - group "Language / ভাষা":
    - button "EN" [pressed]
    - button "বাং"
  - link "Profile":
    - /url: /account
  - link "Settings":
    - /url: /settings
- main:
  - heading "List a space" [level=1]
  - paragraph: Six steps. What you're asked changes with the kind of space you're listing.
  - list "Progress":
    - listitem: What
    - listitem: Where
    - listitem: Details
    - listitem: Included
    - listitem: Photos
    - listitem: Price
    - listitem: Review
  - heading "Review and publish" [level=2]
  - paragraph: Publishing this listing
  - paragraph: Habito charges a small one-off fee per listing. It keeps spam and copied posts off the platform, and it is what pays for the platform instead of taking a cut of your rent.
  - text: Listing fee ৳500
  - paragraph: Free listing 1 of 3 this month
  - paragraph: Payments are simulated in this prototype. Nothing is charged.
  - term: Space
  - definition: E2E Corner Shop 99 · Shop
  - term: Property
  - definition: E2ETest Plaza (new) · Mirpur
  - term: Rent
  - definition: ৳18,000 · about ৳21,500 all in
  - term: Availability
  - definition: available
  - term: Included
  - definition: Nothing listed
  - paragraph: Placeholder images are attached automatically in this prototype. The space is saved on this device and appears immediately in search and in your portfolio.
  - button "Back"
  - text: Step 7 of 7
  - button "Publishing…" [disabled]
- contentinfo:
  - link "Habito":
    - /url: /
  - paragraph: Habito makes every kind of usable space discoverable — homes, rooms, shops, offices, storage, parking and land, across Bangladesh.
  - navigation "Find a space":
    - heading "Find a space" [level=2]
    - list:
      - listitem:
        - link "Explore":
          - /url: /explore
      - listitem:
        - link "Search":
          - /url: /search
      - listitem:
        - link "Find my space":
          - /url: /find
      - listitem:
        - link "Saved":
          - /url: /saved
      - listitem:
        - link "Messages":
          - /url: /messages
  - navigation "For owners":
    - heading "For owners" [level=2]
    - list:
      - listitem:
        - link "List a space":
          - /url: /list
      - listitem:
        - link "My spaces":
          - /url: /portfolio
      - listitem:
        - link "Create your account.":
          - /url: /signup
      - listitem:
        - link "Requests":
          - /url: /requests
  - paragraph: Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.
  - paragraph: All seed data is synthetic. No real identity or ownership verification is performed.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import {
  3   |   bypassOnboarding,
  4   |   hasTwoAccounts,
  5   |   MISSING_AUTH_REASON,
  6   |   signInWithEmail,
  7   |   STAGING_ACCOUNTS,
  8   | } from "./helpers";
  9   | 
  10  | test.describe("Section B — Owner", { tag: "@section-B" }, () => {
  11  |   test.beforeEach(async ({ page }) => {
  12  |     await bypassOnboarding(page);
  13  |   });
  14  | 
  15  |   test("[B.3] Create a property and a space through /list — persists and appears in search", async ({
  16  |     page,
  17  |   }) => {
  18  |     await page.goto("/list");
  19  |     await expect(page.getByRole("heading", { name: "List a space" })).toBeVisible();
  20  | 
  21  |     // Step 1: What
  22  |     await page.getByRole("button", { name: "Shop", exact: true }).click();
  23  |     await page.getByRole("button", { name: "Continue" }).click();
  24  | 
  25  |     // Step 2: Where — create a new property
  26  |     await page.getByLabel("A new property").check();
  27  |     await page.getByLabel("Property name").fill("E2ETest Plaza");
  28  |     await page.getByLabel("Neighbourhood").fill("Mirpur 10");
  29  |     await page.getByRole("button", { name: "Continue" }).click();
  30  | 
  31  |     // Step 3: Details
  32  |     await page.getByLabel("Name it").fill("E2E Corner Shop 99");
  33  |     await page.getByLabel("Size (sqft)").fill("450");
  34  |     await page.getByRole("button", { name: "Continue" }).click();
  35  | 
  36  |     // Step 4: Included
  37  |     await page.getByRole("button", { name: "Continue" }).click();
  38  | 
  39  |     // Step 5: Photos
  40  |     await expect(page.getByText(/No photos yet/i)).toBeVisible();
  41  |     await page.getByRole("button", { name: "Continue" }).click();
  42  | 
  43  |     // Step 6: Price
  44  |     await page.getByLabel("Monthly rent").fill("18000");
  45  |     await page.getByLabel("Service charge").fill("2000");
  46  |     await page.getByLabel("Utilities").fill("1500");
  47  |     await page.getByRole("button", { name: "Continue" }).click();
  48  | 
  49  |     // Step 7: Review and publish
  50  |     await expect(page.getByText("E2E Corner Shop 99 · Shop")).toBeVisible();
  51  |     await page.getByRole("button", { name: /Pay and publish|Publish space/i }).click();
  52  | 
  53  |     // Redirects to the newly created space detail page
> 54  |     await expect(page).toHaveURL(/\/space\/SP-/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  55  |     await expect(page.getByRole("heading", { name: "E2E Corner Shop 99" })).toBeVisible();
  56  | 
  57  |     // Persists across reload
  58  |     await page.reload();
  59  |     await expect(page.getByRole("heading", { name: "E2E Corner Shop 99" })).toBeVisible();
  60  | 
  61  |     // Appears in search
  62  |     await page.goto("/search?category=business");
  63  |     await expect(page.getByRole("link", { name: "E2E Corner Shop 99" })).toBeVisible();
  64  |   });
  65  | 
  66  |   test("[B.5] Change a space's availability in /portfolio — persists across reload", async ({
  67  |     page,
  68  |   }) => {
  69  |     await page.goto("/portfolio");
  70  |     await expect(page.getByRole("heading", { name: "My spaces" })).toBeVisible();
  71  | 
  72  |     const availabilitySelect = page.getByLabel("Availability for Flat 7C");
  73  |     await expect(availabilitySelect).toBeVisible();
  74  |     await availabilitySelect.selectOption("maintenance");
  75  |     await expect(availabilitySelect).toHaveValue("maintenance");
  76  | 
  77  |     await page.reload();
  78  |     await expect(page.getByLabel("Availability for Flat 7C")).toHaveValue("maintenance");
  79  |   });
  80  | 
  81  |   test("[B.6] Renter's inquiry on an owner space appears in /portfolio", async ({ page }) => {
  82  |     // Seed an inquiry via localStorage or send one on an OW-001 space by temporarily viewing as non-owner,
  83  |     // or verify the Inquiries section in /portfolio renders inquiries for OW-001's spaces.
  84  |     await page.goto("/portfolio");
  85  |     await page.evaluate(() => {
  86  |       const raw = window.localStorage.getItem("habito.db.v2");
  87  |       if (!raw) return;
  88  |       const db = JSON.parse(raw);
  89  |       db.inquiries.push({
  90  |         id: "INQ-9001",
  91  |         spaceId: "SP-0226",
  92  |         name: "Karim Renter",
  93  |         phone: "01811223344",
  94  |         message: "Can I visit Flat 7C this Friday?",
  95  |         moveInDate: "2026-12-01",
  96  |         budgetMin: 10000,
  97  |         budgetMax: 20000,
  98  |         sentAt: new Date().toISOString(),
  99  |         status: "new",
  100 |       });
  101 |       window.localStorage.setItem("habito.db.v2", JSON.stringify(db));
  102 |     });
  103 | 
  104 |     await page.reload();
  105 |     await expect(page.getByText("Karim Renter")).toBeVisible();
  106 |     await expect(page.getByText("Can I visit Flat 7C this Friday?")).toBeVisible();
  107 |   });
  108 | 
  109 |   test("[B.1, B.2, B.4] Owner sign-in, empty portfolio on fresh account, and cross-account search visibility", async ({
  110 |     browser,
  111 |   }) => {
  112 |     test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);
  113 | 
  114 |     const ownerCtx = await browser.newContext();
  115 |     const ownerPage = await ownerCtx.newPage();
  116 |     await signInWithEmail(ownerPage, STAGING_ACCOUNTS.ownerEmail, STAGING_ACCOUNTS.ownerPassword);
  117 |     await ownerPage.goto("/portfolio");
  118 |     await expect(ownerPage.getByRole("heading", { name: "My spaces" })).toBeVisible();
  119 |     await ownerCtx.close();
  120 |   });
  121 | });
  122 | 
```