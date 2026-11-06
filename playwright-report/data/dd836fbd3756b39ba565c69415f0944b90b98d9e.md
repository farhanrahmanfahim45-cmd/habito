# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-i-category-weighting.spec.ts >> Section I — Category weighting >> [I.2, I.3, I.4, I.5] Category-specific match breakdowns for parking, shop, godown, and parking slot shortfall
- Location: e2e\section-i-category-weighting.spec.ts:30:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Parking' }) resolved to 2 elements:
    1) <button type="button" aria-pressed="false" class="inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-150 px-4 py-2 text-sm bg-ivory-deep text-ink-soft hover:bg-hairline">…</button> aka getByRole('button', { name: 'Parking' }).first()
    2) <button type="button" aria-pressed="false" class="inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-150 px-3 py-1.5 text-xs bg-ivory-deep text-ink-soft hover:bg-hairline">…</button> aka getByRole('button', { name: 'Parking' }).nth(1)

Call log:
  - waiting for getByRole('button', { name: 'Parking' })

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
    - generic [ref=e49]:
      - generic [ref=e50]:
        - heading "Tell us what you need." [level=1] [ref=e51]
        - paragraph [ref=e52]: A few answers, and every space afterwards arrives with a score and the reasons behind it.
      - generic [ref=e53]:
        - generic [ref=e54]:
          - heading "Are you renting or buying?" [level=2] [ref=e55]
          - generic [ref=e56]:
            - button "Renting" [pressed] [ref=e57]
            - button "Buying" [ref=e58]
        - generic [ref=e59]:
          - heading "What kind of space?" [level=2] [ref=e60]
          - list [ref=e61]:
            - listitem [ref=e62]:
              - button "Anything" [pressed] [ref=e63]
            - listitem [ref=e64]:
              - button "Living" [ref=e65]
            - listitem [ref=e69]:
              - button "Business" [ref=e70]
            - listitem [ref=e76]:
              - button "Storage" [ref=e77]
            - listitem [ref=e81]:
              - button "Parking" [ref=e82]
            - listitem [ref=e87]:
              - button "Land & rural" [ref=e88]
        - generic [ref=e93]:
          - heading "Where?" [level=2] [ref=e94]
          - button "Badda Dhaka" [ref=e96]:
            - generic [ref=e100]: Badda
            - generic [ref=e101]: Dhaka
          - paragraph [ref=e102]: Spaces nearby still appear, ranked by how far they are from here.
        - generic [ref=e103]:
          - heading "Monthly budget" [level=2] [ref=e104]
          - generic [ref=e105]:
            - generic [ref=e106]:
              - generic [ref=e107]: Minimum
              - generic [ref=e108]:
                - generic: ৳
                - spinbutton "Minimum ৳" [ref=e109]: "6000"
            - generic [ref=e110]:
              - generic [ref=e111]: Maximum
              - generic [ref=e112]:
                - generic: ৳
                - spinbutton "Maximum ৳" [ref=e113]: "14000"
          - paragraph [ref=e114]: Where an owner has listed every cost, we score against the full monthly figure — rent plus service charge and utilities — not rent alone.
        - generic [ref=e115]:
          - heading "When do you need it?" [level=2] [ref=e116]
          - textbox "Move-in date" [ref=e117]: 2026-11-27
        - generic [ref=e118]:
          - heading "Anything you can't do without?optional" [level=2] [ref=e119]
          - list [ref=e120]:
            - listitem [ref=e121]:
              - button "Lift" [ref=e122]
            - listitem [ref=e126]:
              - button "Wi-Fi ready" [ref=e127]
            - listitem [ref=e132]:
              - button "Gas line" [ref=e133]
            - listitem [ref=e136]:
              - button "Generator" [ref=e137]
            - listitem [ref=e140]:
              - button "Parking" [ref=e141]
            - listitem [ref=e146]:
              - button "Balcony" [ref=e147]
            - listitem [ref=e151]:
              - button "Attached bathroom" [ref=e152]
            - listitem [ref=e157]:
              - button "Furnished" [ref=e158]
            - listitem [ref=e162]:
              - button "Water reserve" [ref=e163]
            - listitem [ref=e167]:
              - button "Security guard" [ref=e168]
            - listitem [ref=e172]:
              - button "CCTV" [ref=e173]
            - listitem [ref=e178]:
              - button "Rooftop access" [ref=e179]
      - button "Show my matches" [ref=e185]
  - contentinfo [ref=e188]:
    - generic [ref=e189]:
      - generic [ref=e190]:
        - link "Habito" [ref=e191] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e196]: Habito makes every kind of usable space discoverable — homes, rooms, shops, offices, storage, parking and land, across Bangladesh.
      - navigation "Find a space" [ref=e197]:
        - heading "Find a space" [level=2] [ref=e198]
        - list [ref=e199]:
          - listitem [ref=e200]:
            - link "Explore" [ref=e201] [cursor=pointer]:
              - /url: /explore
          - listitem [ref=e202]:
            - link "Search" [ref=e203] [cursor=pointer]:
              - /url: /search
          - listitem [ref=e204]:
            - link "Find my space" [ref=e205] [cursor=pointer]:
              - /url: /find
          - listitem [ref=e206]:
            - link "Saved" [ref=e207] [cursor=pointer]:
              - /url: /saved
          - listitem [ref=e208]:
            - link "Messages" [ref=e209] [cursor=pointer]:
              - /url: /messages
      - navigation "For owners" [ref=e210]:
        - heading "For owners" [level=2] [ref=e211]
        - list [ref=e212]:
          - listitem [ref=e213]:
            - link "List a space" [ref=e214] [cursor=pointer]:
              - /url: /list
          - listitem [ref=e215]:
            - link "My spaces" [ref=e216] [cursor=pointer]:
              - /url: /portfolio
          - listitem [ref=e217]:
            - link "Create your account." [ref=e218] [cursor=pointer]:
              - /url: /signup
          - listitem [ref=e219]:
            - link "Requests" [ref=e220] [cursor=pointer]:
              - /url: /requests
    - generic [ref=e222]:
      - paragraph [ref=e223]: Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.
      - paragraph [ref=e224]: All seed data is synthetic. No real identity or ownership verification is performed.
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { bypassOnboarding } from "./helpers";
  3  | 
  4  | test.describe("Section I — Category weighting", { tag: "@section-I" }, () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await bypassOnboarding(page);
  7  |   });
  8  | 
  9  |   test("[I.1] /find asks a different capacity question per category", async ({ page }) => {
  10 |     await page.goto("/find");
  11 | 
  12 |     await page.getByRole("button", { name: "Living" }).click();
  13 |     await expect(page.getByRole("heading", { name: /How many bedrooms\?/i })).toBeVisible();
  14 | 
  15 |     await page.getByRole("button", { name: "Business" }).click();
  16 |     await expect(page.getByRole("heading", { name: /Minimum size/i })).toBeVisible();
  17 | 
  18 |     await page.getByRole("button", { name: "Storage" }).click();
  19 |     await expect(page.getByRole("heading", { name: /How much storage space\?/i })).toBeVisible();
  20 |     await expect(page.getByText("Ceiling height")).toBeVisible();
  21 | 
  22 |     await page.getByRole("button", { name: "Parking" }).click();
  23 |     await expect(page.getByRole("heading", { name: /How many vehicles\?/i })).toBeVisible();
  24 |     await expect(page.getByText("Motorcycles")).toBeVisible();
  25 | 
  26 |     await page.getByRole("button", { name: "Land & rural" }).click();
  27 |     await expect(page.getByRole("heading", { name: /How much land\?/i })).toBeVisible();
  28 |   });
  29 | 
  30 |   test("[I.2, I.3, I.4, I.5] Category-specific match breakdowns for parking, shop, godown, and parking slot shortfall", async ({
  31 |     page,
  32 |   }) => {
  33 |     // State needs on /find: Parking, 2 vehicles
  34 |     await page.goto("/find");
> 35 |     await page.getByRole("button", { name: "Parking" }).click();
     |                                                         ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Parking' }) resolved to 2 elements:
  36 |     await page.getByRole("button", { name: "2", exact: true }).first().click();
  37 |     await page.getByRole("button", { name: "Show my matches" }).click();
  38 | 
  39 |     // [I.2, I.5] Open SP-0233 (Parking slot 1 with 1 car slot free)
  40 |     await page.goto("/space/SP-0233");
  41 |     const breakdown = page.locator("aside");
  42 |     await expect(breakdown.getByRole("heading", { name: "Why this scores as it does" })).toBeVisible();
  43 | 
  44 |     // [I.2] Parking listing has NO size/capacity/slots row at all (only Budget, Location, Space type, Availability, Amenities)
  45 |     await expect(breakdown.getByText("Size", { exact: true })).toHaveCount(0);
  46 |     await expect(breakdown.getByText("Slots", { exact: true })).toHaveCount(0);
  47 |     await expect(breakdown.getByText("Capacity", { exact: true })).toHaveCount(0);
  48 | 
  49 |     // [I.5] Asking for 2 car slots on a parking space with 1 free scores Availability down (10/20) with the free-slot note
  50 |     await expect(breakdown.getByText("1 car slot free")).toBeVisible();
  51 |     await expect(breakdown.getByText("10/20")).toBeVisible();
  52 | 
  53 |     // [I.3] A shop's breakdown (SP-0228) gives Location (30) more weight than Budget (24)
  54 |     await page.goto("/space/SP-0228");
  55 |     await expect(breakdown.getByText(/\/30$/)).toBeVisible();
  56 |     await expect(breakdown.getByText(/\/24$/)).toBeVisible();
  57 | 
  58 |     // [I.4] A godown's breakdown (SP-0041) gives Capacity 20 points (/20)
  59 |     await page.goto("/space/SP-0041");
  60 |     await expect(breakdown.getByText("Capacity", { exact: true })).toBeVisible();
  61 |     await expect(breakdown.getByText(/\/20$/)).toBeVisible();
  62 |   });
  63 | });
  64 | 
```