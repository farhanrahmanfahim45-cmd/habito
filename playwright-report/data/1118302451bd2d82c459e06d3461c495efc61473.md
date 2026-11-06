# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-p-map.spec.ts >> Section P — The Map >> [P.3, P.4, P.5, P.6, P.7, P.8] Map markers show prices or clusters, street-level zoom has no number bubbles, and clicking a price opens a card with location accuracy
- Location: e2e\section-p-map.spec.ts:25:3

# Error details

```
Error: Street-level marker "9" should display a ৳ price, not a cluster count

expect(received).toMatch(expected)

Expected pattern: /^৳/
Received string:  "9"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - paragraph [ref=e5]:
    - generic [ref=e8]:
      - strong [ref=e9]: Prototype.
      - text: Listings, owners and images are synthetic seed data and do not represent real availability.
  - banner [ref=e10]:
    - generic [ref=e11]:
      - link "Habito" [ref=e12] [cursor=pointer]:
        - /url: /
      - navigation "Main" [ref=e17]:
        - link "Explore" [ref=e18] [cursor=pointer]:
          - /url: /explore
        - link "Search" [ref=e19] [cursor=pointer]:
          - /url: /search
        - link "My spaces" [ref=e20] [cursor=pointer]:
          - /url: /portfolio
        - link "Bookings" [ref=e21] [cursor=pointer]:
          - /url: /bookings
      - generic [ref=e22]:
        - generic [ref=e23]:
          - link "Saved" [ref=e24] [cursor=pointer]:
            - /url: /saved
          - link "Messages" [ref=e28] [cursor=pointer]:
            - /url: /messages
        - group "Language / ভাষা" [ref=e34]:
          - button "EN" [pressed] [ref=e35]
          - button "বাং" [ref=e36]
        - generic [ref=e37]:
          - link "Profile" [ref=e38] [cursor=pointer]:
            - /url: /account
          - link "Settings" [ref=e43] [cursor=pointer]:
            - /url: /settings
  - main [ref=e48]:
    - generic [ref=e50]:
      - generic [ref=e51]:
        - heading "Find a space" [level=1] [ref=e52]
        - paragraph [ref=e53]: Browse everything on the platform, or tell us what you need and each space gets a score.
      - link [ref=e54] [cursor=pointer]:
        - /url: /find
        - button "Tell us what you need" [ref=e55]
    - generic [ref=e59]:
      - complementary [ref=e60]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - heading "Filters" [level=2] [ref=e64]
            - button "Reset" [ref=e65]
          - generic [ref=e66]:
            - paragraph [ref=e67]: Category
            - generic [ref=e68]:
              - button "All" [pressed] [ref=e69]
              - button "Living" [ref=e70]
              - button "Business" [ref=e71]
              - button "Storage" [ref=e72]
              - button "Parking" [ref=e73]
              - button "Land & rural" [ref=e74]
          - generic [ref=e75]:
            - paragraph [ref=e76]: Area
            - button "Everywhere" [ref=e77]
          - generic [ref=e82]:
            - paragraph [ref=e83]: Setting
            - generic [ref=e84]:
              - button "Anywhere" [pressed] [ref=e85]
              - button "urban" [ref=e86]
              - button "suburban" [ref=e87]
              - button "rural" [ref=e88]
          - generic [ref=e89]:
            - paragraph [ref=e90]: Rent up to ৳1,50,000
            - slider "Maximum monthly price" [ref=e91]: "150000"
            - paragraph [ref=e92]: Sale listings aren't filtered by this.
          - generic [ref=e93]:
            - paragraph [ref=e94]: Who can live here
            - generic [ref=e95]:
              - button "All" [pressed] [ref=e96]
              - button "Families allowed" [ref=e97]
              - button "Bachelors allowed" [ref=e98]
              - button "Student friendly" [ref=e99]
          - generic [ref=e100]:
            - paragraph [ref=e101]: Show only
            - generic [ref=e102]:
              - generic [ref=e103] [cursor=pointer]:
                - checkbox "Available spaces" [checked] [ref=e104]
                - text: Available spaces
              - generic [ref=e105] [cursor=pointer]:
                - checkbox "Updated in the last 3 weeks" [ref=e106]
                - text: Updated in the last 3 weeks
              - generic [ref=e107] [cursor=pointer]:
                - checkbox "Full cost disclosed" [ref=e108]
                - text: Full cost disclosed
              - generic [ref=e109] [cursor=pointer]:
                - checkbox "Verified (demo)" [ref=e110]
                - text: Verified (demo)
          - generic [ref=e111]:
            - paragraph [ref=e112]: Amenities
            - generic [ref=e113]:
              - button "Lift" [ref=e114]
              - button "Wi-Fi ready" [ref=e115]
              - button "Gas line" [ref=e116]
              - button "Generator" [ref=e117]
              - button "Parking" [ref=e118]
              - button "Balcony" [ref=e119]
              - button "Attached bathroom" [ref=e120]
              - button "Furnished" [ref=e121]
              - button "Water reserve" [ref=e122]
              - button "Security guard" [ref=e123]
              - button "CCTV" [ref=e124]
              - button "Rooftop access" [ref=e125]
              - button "Air conditioning" [ref=e126]
              - button "Roller shutter" [ref=e127]
      - generic [ref=e128]:
        - generic [ref=e129]:
          - paragraph [ref=e130]: 202 spaces
          - generic [ref=e131]:
            - generic [ref=e132]:
              - generic [ref=e133]: Sort
              - combobox "Sort" [ref=e134]:
                - option "Best match" [selected]
                - 'option "Price: low to high"'
                - 'option "Price: high to low"'
                - option "Recently updated"
                - option "Largest first"
            - group "List / Map" [ref=e135]:
              - button "List" [ref=e136]
              - button "Map" [pressed] [ref=e138]
        - generic [ref=e141]:
          - generic [active] [ref=e142]:
            - generic:
              - generic:
                - button "৳1.1K" [ref=e143] [cursor=pointer]
                - button "৳5K" [ref=e145] [cursor=pointer]
                - button "4" [ref=e147] [cursor=pointer]
                - button "9" [ref=e149] [cursor=pointer]
                - button "20" [ref=e151] [cursor=pointer]
                - button "7" [ref=e153] [cursor=pointer]
                - button "8" [ref=e155] [cursor=pointer]
                - button "22" [ref=e157] [cursor=pointer]
                - button "11" [ref=e159] [cursor=pointer]
                - button "2" [ref=e161] [cursor=pointer]
                - button "2" [ref=e163] [cursor=pointer]
                - button "5" [ref=e165] [cursor=pointer]
                - button "7" [ref=e167] [cursor=pointer]
                - button "6" [ref=e169] [cursor=pointer]
                - button "20" [ref=e171] [cursor=pointer]
                - button "2" [ref=e173] [cursor=pointer]
                - button "10" [ref=e175] [cursor=pointer]
                - button "9" [ref=e177] [cursor=pointer]
                - button "7" [ref=e179] [cursor=pointer]
                - button "14" [ref=e181] [cursor=pointer]
                - button "3" [ref=e183] [cursor=pointer]
                - button "8" [ref=e185] [cursor=pointer]
                - button "4" [ref=e187] [cursor=pointer]
                - button "4" [ref=e189] [cursor=pointer]
                - button "4" [ref=e191] [cursor=pointer]
                - button "5" [ref=e193] [cursor=pointer]
                - button "2" [ref=e195] [cursor=pointer]
                - button "৳4.7K" [ref=e197] [cursor=pointer]
                - button "৳3.5K" [ref=e199] [cursor=pointer]
                - button "৳13.5K" [ref=e201] [cursor=pointer]
                - button "৳16K" [ref=e203] [cursor=pointer]
                - button "৳20K" [ref=e205] [cursor=pointer]
            - generic:
              - generic [ref=e207]:
                - button "Zoom in" [ref=e208] [cursor=pointer]: +
                - button "Zoom out" [ref=e209] [cursor=pointer]: −
              - generic [ref=e210]:
                - link "Leaflet" [ref=e211] [cursor=pointer]:
                  - /url: https://leafletjs.com
                - text: "| ©"
                - link "OpenStreetMap" [ref=e216] [cursor=pointer]:
                  - /url: https://www.openstreetmap.org/copyright
                - text: contributors
          - generic: 0 here
  - contentinfo [ref=e217]:
    - generic [ref=e218]:
      - generic [ref=e219]:
        - link "Habito" [ref=e220] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e225]: Habito makes every kind of usable space discoverable — homes, rooms, shops, offices, storage, parking and land, across Bangladesh.
      - navigation "Find a space" [ref=e226]:
        - heading "Find a space" [level=2] [ref=e227]
        - list [ref=e228]:
          - listitem [ref=e229]:
            - link "Explore" [ref=e230] [cursor=pointer]:
              - /url: /explore
          - listitem [ref=e231]:
            - link "Search" [ref=e232] [cursor=pointer]:
              - /url: /search
          - listitem [ref=e233]:
            - link "Find my space" [ref=e234] [cursor=pointer]:
              - /url: /find
          - listitem [ref=e235]:
            - link "Saved" [ref=e236] [cursor=pointer]:
              - /url: /saved
          - listitem [ref=e237]:
            - link "Messages" [ref=e238] [cursor=pointer]:
              - /url: /messages
      - navigation "For owners" [ref=e239]:
        - heading "For owners" [level=2] [ref=e240]
        - list [ref=e241]:
          - listitem [ref=e242]:
            - link "List a space" [ref=e243] [cursor=pointer]:
              - /url: /list
          - listitem [ref=e244]:
            - link "My spaces" [ref=e245] [cursor=pointer]:
              - /url: /portfolio
          - listitem [ref=e246]:
            - link "Create your account." [ref=e247] [cursor=pointer]:
              - /url: /signup
          - listitem [ref=e248]:
            - link "Requests" [ref=e249] [cursor=pointer]:
              - /url: /requests
    - generic [ref=e251]:
      - paragraph [ref=e252]: Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.
      - paragraph [ref=e253]: All seed data is synthetic. No real identity or ownership verification is performed.
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
> 46 |       expect(text.trim(), `Street-level marker "${text}" should display a ৳ price, not a cluster count`).toMatch(/^৳/);
     |                                                                                                          ^ Error: Street-level marker "9" should display a ৳ price, not a cluster count
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
  66 |     await expect(page.getByRole("heading", { name: "Where exactly is it?" })).toBeVisible();
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