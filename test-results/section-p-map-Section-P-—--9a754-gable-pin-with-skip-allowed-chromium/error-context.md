# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-p-map.spec.ts >> Section P — The Map >> [P.9, P.10] Listing a new property offers a draggable pin with skip allowed
- Location: e2e\section-p-map.spec.ts:57:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Where exactly is it?' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Where exactly is it?' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Where exactly is it?' })

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
  - heading "Where is it?" [level=2]
  - paragraph: Which property is this space in?
  - radio "Rahman Building Mirpur 1, Mirpur Model"
  - paragraph: Rahman Building
  - paragraph: Mirpur 1, Mirpur Model
  - radio "Rahman Annex Middle Badda, Badda"
  - paragraph: Rahman Annex
  - paragraph: Middle Badda, Badda
  - radio "Rahman Bari Saturia, Manikganj"
  - paragraph: Rahman Bari
  - paragraph: Saturia, Manikganj
  - radio "Uddin Heights Nikunja 2, Khilkhet"
  - paragraph: Uddin Heights
  - paragraph: Nikunja 2, Khilkhet
  - radio "A new property" [checked]
  - text: A new property Property name
  - textbox "Property name":
    - /placeholder: e.g. Rahman Villa
  - text: Area
  - button "Area": Mirpur
  - text: Neighbourhood
  - textbox "Neighbourhood":
    - /placeholder: e.g. Mirpur 10
  - button "Back"
  - text: Step 2 of 7
  - button "Continue" [disabled]
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
  1  | import { test, expect } from "@playwright/test";
  2  | import { bypassOnboarding } from "./helpers";
  3  | 
  4  | test.describe("Section P — The Map", { tag: "@section-P" }, () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await bypassOnboarding(page);
  7  |   });
  8  | 
  9  |   test("[P.1, P.2] Search has List / Map toggle beside Sort, and Leaflet loads only when Map is opened", async ({
  10 |     page,
  11 |   }) => {
  12 |     await page.goto("/search");
  13 |     await expect(page.locator("article").first()).toBeVisible();
  14 | 
  15 |     // Leaflet is not rendered while in List view
  16 |     await expect(page.locator(".leaflet-container")).toHaveCount(0);
  17 | 
  18 |     const toggleGroup = page.getByRole("group", { name: /List \/ Map/i });
  19 |     await expect(toggleGroup).toBeVisible();
  20 | 
  21 |     await toggleGroup.getByRole("button", { name: "Map" }).click();
  22 |     await expect(page.locator(".leaflet-container")).toBeVisible();
  23 |   });
  24 | 
  25 |   test("[P.3, P.4, P.5, P.6, P.7, P.8] Map markers show prices or clusters, street-level zoom has no number bubbles, and clicking a price opens a card with location accuracy", async ({
  26 |     page,
  27 |   }) => {
  28 |     await page.goto("/search");
  29 |     await page.getByRole("group", { name: /List \/ Map/i }).getByRole("button", { name: "Map" }).click();
  30 | 
  31 |     const map = page.locator(".leaflet-container");
  32 |     await expect(map).toBeVisible();
  33 | 
  34 |     const markers = map.locator(".habito-marker");
  35 |     await expect(markers.first()).toBeVisible();
  36 | 
  37 |     // [P.4, P.5, P.6] Zoom in to street level (>= 15) and verify every marker shows a ৳ price, with no cluster number bubbles
  38 |     const zoomIn = map.locator(".leaflet-control-zoom-in");
  39 |     for (let i = 0; i < 6; i++) {
  40 |       await zoomIn.click();
  41 |     }
  42 | 
  43 |     const markerTexts = await markers.allTextContents();
  44 |     expect(markerTexts.length).toBeGreaterThan(0);
  45 |     for (const text of markerTexts) {
  46 |       expect(text.trim(), `Street-level marker "${text}" should display a ৳ price, not a cluster count`).toMatch(/^৳/);
  47 |     }
  48 | 
  49 |     // [P.7, P.8] Click a price marker to open popup card with photo, area, price, and approximate/pinned label
  50 |     await markers.first().click({ force: true });
  51 |     const popup = map.locator(".leaflet-popup-content");
  52 |     await expect(popup).toBeVisible();
  53 |     await expect(popup.locator("img")).toBeVisible();
  54 |     await expect(popup.getByText(/Approximate — somewhere in this area|Placed by the owner/i)).toBeVisible();
  55 |   });
  56 | 
  57 |   test("[P.9, P.10] Listing a new property offers a draggable pin with skip allowed", async ({
  58 |     page,
  59 |   }) => {
  60 |     await page.goto("/list");
  61 |     await page.getByRole("button", { name: "Continue" }).click();
  62 | 
  63 |     await page.getByLabel("A new property").check();
  64 | 
  65 |     // TESTING.md Section P: "Listing a new property offers a draggable pin, with skip allowed"
> 66 |     await expect(page.getByRole("heading", { name: "Where exactly is it?" })).toBeVisible();
     |                                                                               ^ Error: expect(locator).toBeVisible() failed
  67 |     await expect(page.getByRole("button", { name: /Skip — use the area centre/i })).toBeVisible();
  68 |   });
  69 | 
  70 |   test("[P.11] No horizontal scroll at 390px in either List or Map view", async ({ page }) => {
  71 |     await page.setViewportSize({ width: 390, height: 844 });
  72 |     await page.goto("/search");
  73 |     await expect(page.locator("article").first()).toBeVisible();
  74 | 
  75 |     const listOverflow = await page.evaluate(
  76 |       () => document.documentElement.scrollWidth - window.innerWidth,
  77 |     );
  78 |     expect(listOverflow).toBeLessThanOrEqual(0);
  79 | 
  80 |     await page.getByRole("group", { name: /List \/ Map/i }).getByRole("button", { name: "Map" }).click();
  81 |     await expect(page.locator(".leaflet-container")).toBeVisible();
  82 | 
  83 |     const mapOverflow = await page.evaluate(
  84 |       () => document.documentElement.scrollWidth - window.innerWidth,
  85 |     );
  86 |     expect(mapOverflow).toBeLessThanOrEqual(0);
  87 |   });
  88 | });
  89 | 
```