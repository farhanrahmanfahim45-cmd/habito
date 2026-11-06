# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-h-geography.spec.ts >> Section H — Geography & Area Picker >> [H.4, H.5] Search filter has 'Everywhere' option while listing form does not; changing area updates results
- Location: e2e\section-h-geography.spec.ts:39:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Mirpur/i })

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - paragraph [ref=f1e5]:
    - generic [ref=f1e8]:
      - strong [ref=f1e9]: Prototype.
      - text: Listings, owners and images are synthetic seed data and do not represent real availability.
  - banner [ref=f1e10]:
    - generic [ref=f1e11]:
      - link "Habito" [ref=f1e12] [cursor=pointer]:
        - /url: /
      - navigation "Main" [ref=f1e17]:
        - link "Explore" [ref=f1e18] [cursor=pointer]:
          - /url: /explore
        - link "Search" [ref=f1e19] [cursor=pointer]:
          - /url: /search
        - link "My spaces" [ref=f1e20] [cursor=pointer]:
          - /url: /portfolio
        - link "Bookings" [ref=f1e21] [cursor=pointer]:
          - /url: /bookings
      - generic [ref=f1e22]:
        - generic [ref=f1e23]:
          - link "Saved" [ref=f1e24] [cursor=pointer]:
            - /url: /saved
          - link "Messages" [ref=f1e28] [cursor=pointer]:
            - /url: /messages
        - group "Language / ভাষা" [ref=f1e34]:
          - button "EN" [pressed] [ref=f1e35]
          - button "বাং" [ref=f1e36]
        - generic [ref=f1e37]:
          - link "Profile" [ref=f1e38] [cursor=pointer]:
            - /url: /account
          - link "Settings" [ref=f1e43] [cursor=pointer]:
            - /url: /settings
  - main [ref=f1e48]:
    - generic [ref=f1e51]:
      - heading "List a space" [level=1] [ref=f1e52]
      - paragraph [ref=f1e53]: Six steps. What you're asked changes with the kind of space you're listing.
    - generic [ref=f1e54]:
      - list "Progress" [ref=f1e55]:
        - listitem [ref=f1e56]:
          - generic [ref=f1e57]: What
        - listitem [ref=f1e60]:
          - generic [ref=f1e61]: Where
        - listitem [ref=f1e64]:
          - generic [ref=f1e65]: Details
        - listitem [ref=f1e68]:
          - generic [ref=f1e69]: Included
        - listitem [ref=f1e72]:
          - generic [ref=f1e73]: Photos
        - listitem [ref=f1e76]:
          - generic [ref=f1e77]: Price
        - listitem [ref=f1e80]:
          - generic [ref=f1e81]: Review
      - generic [ref=f1e84]:
        - generic [ref=f1e85]:
          - heading "Where is it?" [level=2] [ref=f1e86]
          - paragraph [ref=f1e87]: Which property is this space in?
          - generic [ref=f1e88]:
            - generic [ref=f1e89] [cursor=pointer]:
              - radio "Rahman Building Mirpur 1, Mirpur Model" [ref=f1e90]
              - generic [ref=f1e91]:
                - paragraph [ref=f1e92]: Rahman Building
                - paragraph [ref=f1e93]: Mirpur 1, Mirpur Model
            - generic [ref=f1e94] [cursor=pointer]:
              - radio "Rahman Annex Middle Badda, Badda" [ref=f1e95]
              - generic [ref=f1e96]:
                - paragraph [ref=f1e97]: Rahman Annex
                - paragraph [ref=f1e98]: Middle Badda, Badda
            - generic [ref=f1e99] [cursor=pointer]:
              - radio "Rahman Bari Saturia, Manikganj" [ref=f1e100]
              - generic [ref=f1e101]:
                - paragraph [ref=f1e102]: Rahman Bari
                - paragraph [ref=f1e103]: Saturia, Manikganj
            - generic [ref=f1e104] [cursor=pointer]:
              - radio "Uddin Heights Nikunja 2, Khilkhet" [ref=f1e105]
              - generic [ref=f1e106]:
                - paragraph [ref=f1e107]: Uddin Heights
                - paragraph [ref=f1e108]: Nikunja 2, Khilkhet
            - generic [ref=f1e109] [cursor=pointer]:
              - radio "A new property" [checked] [active] [ref=f1e110]
              - generic [ref=f1e113]: A new property
          - generic [ref=f1e114]:
            - generic [ref=f1e115]:
              - generic [ref=f1e116]: Property name
              - textbox "Property name" [ref=f1e117]:
                - /placeholder: e.g. Rahman Villa
            - generic [ref=f1e118]:
              - generic [ref=f1e119]: Area
              - button "Area" [ref=f1e120]:
                - generic [ref=f1e124]: Mirpur
            - generic [ref=f1e125]:
              - generic [ref=f1e126]: Neighbourhood
              - textbox "Neighbourhood" [ref=f1e127]:
                - /placeholder: e.g. Mirpur 10
        - generic [ref=f1e128]:
          - button "Back" [ref=f1e129]
          - generic [ref=f1e132]: Step 2 of 7
          - button "Continue" [disabled] [ref=f1e133]
  - contentinfo [ref=f1e136]:
    - generic [ref=f1e137]:
      - generic [ref=f1e138]:
        - link "Habito" [ref=f1e139] [cursor=pointer]:
          - /url: /
        - paragraph [ref=f1e144]: Habito makes every kind of usable space discoverable — homes, rooms, shops, offices, storage, parking and land, across Bangladesh.
      - navigation "Find a space" [ref=f1e145]:
        - heading "Find a space" [level=2] [ref=f1e146]
        - list [ref=f1e147]:
          - listitem [ref=f1e148]:
            - link "Explore" [ref=f1e149] [cursor=pointer]:
              - /url: /explore
          - listitem [ref=f1e150]:
            - link "Search" [ref=f1e151] [cursor=pointer]:
              - /url: /search
          - listitem [ref=f1e152]:
            - link "Find my space" [ref=f1e153] [cursor=pointer]:
              - /url: /find
          - listitem [ref=f1e154]:
            - link "Saved" [ref=f1e155] [cursor=pointer]:
              - /url: /saved
          - listitem [ref=f1e156]:
            - link "Messages" [ref=f1e157] [cursor=pointer]:
              - /url: /messages
      - navigation "For owners" [ref=f1e158]:
        - heading "For owners" [level=2] [ref=f1e159]
        - list [ref=f1e160]:
          - listitem [ref=f1e161]:
            - link "List a space" [ref=f1e162] [cursor=pointer]:
              - /url: /list
          - listitem [ref=f1e163]:
            - link "My spaces" [ref=f1e164] [cursor=pointer]:
              - /url: /portfolio
          - listitem [ref=f1e165]:
            - link "Create your account." [ref=f1e166] [cursor=pointer]:
              - /url: /signup
          - listitem [ref=f1e167]:
            - link "Requests" [ref=f1e168] [cursor=pointer]:
              - /url: /requests
    - generic [ref=f1e170]:
      - paragraph [ref=f1e171]: Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.
      - paragraph [ref=f1e172]: All seed data is synthetic. No real identity or ownership verification is performed.
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { bypassOnboarding } from "./helpers";
  3  | 
  4  | test.describe("Section H — Geography & Area Picker", { tag: "@section-H" }, () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await bypassOnboarding(page);
  7  |   });
  8  | 
  9  |   test("[H.1, H.2, H.3] AreaPicker opens a searchable sheet grouped by region and matches neighbourhoods to their thana", async ({
  10 |     page,
  11 |   }) => {
  12 |     await page.goto("/search");
  13 |     await page.locator("aside").getByRole("button", { name: "Everywhere" }).click();
  14 | 
  15 |     const dialog = page.getByRole("dialog");
  16 |     await expect(dialog).toBeVisible();
  17 | 
  18 |     // [H.2] Grouped: Dhaka Metro, Greater Dhaka, then other divisions
  19 |     await expect(dialog.getByRole("heading", { name: "Dhaka Metro" })).toBeVisible();
  20 |     await expect(dialog.getByRole("heading", { name: "Greater Dhaka" })).toBeVisible();
  21 |     await expect(dialog.getByRole("heading", { name: "Chattogram" })).toBeVisible();
  22 | 
  23 |     // [H.3] Typing a neighbourhood finds its thana
  24 |     const searchInput = dialog.getByPlaceholder("Search an area or neighbourhood");
  25 | 
  26 |     await searchInput.fill("kazipara");
  27 |     await expect(dialog.getByRole("button", { name: /Mirpur Model/i })).toBeVisible();
  28 |     await expect(dialog.getByText(/Kazipara · Dhaka/i)).toBeVisible();
  29 | 
  30 |     await searchInput.fill("banasree");
  31 |     await expect(dialog.getByRole("button", { name: /Rampura/i })).toBeVisible();
  32 |     await expect(dialog.getByText(/Banasree · Dhaka/i)).toBeVisible();
  33 | 
  34 |     await searchInput.fill("sector 7");
  35 |     await expect(dialog.getByRole("button", { name: /Uttara East/i })).toBeVisible();
  36 |     await expect(dialog.getByText(/Sector 7 · Dhaka/i)).toBeVisible();
  37 |   });
  38 | 
  39 |   test("[H.4, H.5] Search filter has 'Everywhere' option while listing form does not; changing area updates results", async ({
  40 |     page,
  41 |   }) => {
  42 |     await page.goto("/search");
  43 |     await page.locator("aside").getByRole("button", { name: "Everywhere" }).click();
  44 |     const searchDialog = page.getByRole("dialog");
  45 |     await expect(searchDialog.getByRole("button", { name: "Everywhere" })).toBeVisible();
  46 | 
  47 |     // Select Mirpur Model and verify search results appear
  48 |     await searchDialog.getByPlaceholder("Search an area or neighbourhood").fill("Mirpur Model");
  49 |     await searchDialog.getByRole("button", { name: /Mirpur Model/i }).click();
  50 |     await expect(page.locator("article").first()).toBeVisible();
  51 | 
  52 |     // Listing form AreaPicker (for a new property) does NOT have "Everywhere"
  53 |     await page.goto("/list");
  54 |     await page.getByRole("button", { name: "Continue" }).click();
  55 |     await page.getByLabel("A new property").check();
> 56 |     await page.getByRole("button", { name: /Mirpur/i }).click();
     |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  57 |     const listDialog = page.getByRole("dialog");
  58 |     await expect(listDialog).toBeVisible();
  59 |     await expect(listDialog.getByRole("button", { name: "Everywhere" })).toHaveCount(0);
  60 |   });
  61 | });
  62 | 
```