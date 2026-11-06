# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-e-f-n-stage3-4-bangla.spec.ts >> Section E, F & N — Stage 3, Stage 4 (Navigation, Editing, Settings) & Bangla >> [F.7] Clicking a step marker in /list/:id jumps directly to that step without six screens
- Location: e2e\section-e-f-n-stage3-4-bangla.spec.ts:141:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Price and availability' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Price and availability' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Price and availability' })

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
  - heading "Edit space" [level=1]
  - paragraph: Change anything and publish again.
  - button "Archive"
  - button "Delete permanently"
  - list "Progress":
    - listitem: What
    - listitem: Where
    - listitem: Details
    - listitem: Included
    - listitem: Photos
    - listitem: Price
    - listitem: Review
  - heading "What are you offering?" [level=2]
  - list:
    - listitem:
      - button "Apartment" [pressed]
    - listitem:
      - button "Room"
    - listitem:
      - button "Shared room"
    - listitem:
      - button "Partition room"
    - listitem:
      - button "Sublet"
    - listitem:
      - button "House"
    - listitem:
      - button "Tin-shed house"
    - listitem:
      - button "Shop"
    - listitem:
      - button "Office"
    - listitem:
      - button "Godown"
    - listitem:
      - button "Garage"
    - listitem:
      - button "Parking slot"
    - listitem:
      - button "Farmland"
    - listitem:
      - button "Pond / fishery"
    - listitem:
      - button "Homestead"
  - paragraph: Renting it out, or selling?
  - button "Renting" [pressed]
  - button "Selling"
  - text: Step 1 of 7
  - button "Continue"
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
  50  |       await page.goto("/search");
  51  |       const aside = page.locator("aside");
  52  |       await expect(aside.getByText("Who can live here")).toBeVisible();
  53  | 
  54  |       const initialCountText = await page.getByText(/^\d+ spaces$/).textContent();
  55  |       const initialCount = Number(initialCountText?.split(" ")[0] ?? 0);
  56  | 
  57  |       await aside.getByRole("button", { name: "Bachelors allowed" }).click();
  58  |       const filteredCountText = await page.getByText(/^\d+ spaces$/).textContent();
  59  |       const filteredCount = Number(filteredCountText?.split(" ")[0] ?? 0);
  60  |       expect(filteredCount).toBeLessThan(initialCount);
  61  | 
  62  |       // [E.11] Living space detail page shows "Who this is for"
  63  |       await page.goto("/space/SP-0226");
  64  |       await expect(page.getByRole("heading", { name: "Who this is for" })).toBeVisible();
  65  | 
  66  |       // [E.12] Listing flow asks about occupancy rules for living spaces and not for a garage
  67  |       await page.goto("/list");
  68  |       await page.getByRole("button", { name: "Apartment", exact: true }).click();
  69  |       await page.getByRole("button", { name: "Continue" }).click(); // Where
  70  |       await page.getByRole("button", { name: "Continue" }).click(); // Details
  71  |       await page.getByRole("button", { name: "Continue" }).click(); // Included
  72  |       await expect(page.getByRole("heading", { name: "Who this is for" })).toBeVisible();
  73  | 
  74  |       // Now go back to Step 1 and pick Garage (parking)
  75  |       await page.goto("/list");
  76  |       await page.getByRole("button", { name: "Garage", exact: true }).click();
  77  |       await page.getByRole("button", { name: "Continue" }).click(); // Where
  78  |       await page.getByRole("button", { name: "Continue" }).click(); // Details
  79  |       await page.getByRole("button", { name: "Continue" }).click(); // Included
  80  |       await expect(page.getByRole("heading", { name: "Who this is for" })).toHaveCount(0);
  81  |     });
  82  | 
  83  |     test("[F.1, F.2, F.4] Unified navigation in header and mobile bottom bar with no renter/owner mode switch", async ({
  84  |       page,
  85  |     }) => {
  86  |       await page.setViewportSize({ width: 1280, height: 800 });
  87  |       await page.goto("/explore");
  88  |       const mainNav = page.locator("header").getByRole("navigation", { name: "Main" });
  89  |       await expect(mainNav.getByRole("link", { name: "Explore" })).toBeVisible();
  90  |       await expect(mainNav.getByRole("link", { name: "Search" })).toBeVisible();
  91  |       await expect(mainNav.getByRole("link", { name: "My spaces" })).toBeVisible();
  92  |       await expect(mainNav.getByRole("link", { name: "Bookings" })).toBeVisible();
  93  | 
  94  |       // Mobile bottom bar at 390px
  95  |       await page.setViewportSize({ width: 390, height: 844 });
  96  |       const mobileNav = page.locator("nav.fixed");
  97  |       await expect(mobileNav.getByRole("link", { name: "Home" })).toBeVisible();
  98  |       await expect(mobileNav.getByRole("link", { name: "Search" })).toBeVisible();
  99  |       await expect(mobileNav.getByRole("link", { name: "Saved" })).toBeVisible();
  100 |       await expect(mobileNav.getByRole("link", { name: "Chats" })).toBeVisible();
  101 |       await expect(mobileNav.getByRole("link", { name: "My spaces" })).toBeVisible();
  102 |     });
  103 | 
  104 |     test("[F.5, F.6, F.8, F.9, F.10] Edit a space from My spaces, update price, archive and restore", async ({
  105 |       page,
  106 |     }) => {
  107 |       // [F.9] Own listing offers Edit instead of Send inquiry
  108 |       await page.goto("/space/SP-0226");
  109 |       await expect(page.locator("aside").getByRole("link", { name: "Edit" })).toBeVisible();
  110 |       await expect(page.locator("aside").getByRole("button", { name: "Send inquiry" })).toHaveCount(0);
  111 | 
  112 |       // [F.5, F.6] Open Edit from /portfolio
  113 |       await page.goto("/portfolio");
  114 |       await page.locator('a[href="/list/SP-0226"]').click();
  115 |       await expect(page).toHaveURL(/\/list\/SP-0226$/);
  116 |       await expect(page.getByRole("heading", { name: "Edit space" })).toBeVisible();
  117 | 
  118 |       // Step through to Price (Step 6) and change price
  119 |       for (let i = 0; i < 5; i++) {
  120 |         await page.getByRole("button", { name: "Continue" }).click();
  121 |       }
  122 |       await page.getByLabel("Monthly rent").fill("19500");
  123 |       await page.getByRole("button", { name: "Continue" }).click();
  124 |       await page.getByRole("button", { name: "Save changes" }).click();
  125 | 
  126 |       await expect(page).toHaveURL(/\/space\/SP-0226$/);
  127 |       await expect(page.locator("aside").getByText("৳19,500").first()).toBeVisible();
  128 | 
  129 |       // [F.10] Archive removes from search but keeps in My spaces marked Archived, and restore puts it back
  130 |       await page.goto("/list/SP-0226");
  131 |       await page.getByRole("button", { name: "Archive" }).click();
  132 |       await expect(page).toHaveURL(/\/portfolio$/);
  133 |       await expect(page.getByText("Archived").first()).toBeVisible();
  134 | 
  135 |       // Restore
  136 |       await page.goto("/list/SP-0226");
  137 |       await page.getByRole("button", { name: "Put back in search" }).click();
  138 |       await expect(page).toHaveURL(/\/portfolio$/);
  139 |     });
  140 | 
  141 |     test("[F.7] Clicking a step marker in /list/:id jumps directly to that step without six screens", async ({
  142 |       page,
  143 |     }) => {
  144 |       await page.goto("/list/SP-0226");
  145 |       await expect(page.getByRole("heading", { name: "Edit space" })).toBeVisible();
  146 | 
  147 |       // TESTING.md Section F: "The step markers are clickable, so a price change doesn't need six screens"
  148 |       const progressList = page.getByRole("list", { name: "Progress" });
  149 |       await progressList.getByText("Price", { exact: true }).click();
> 150 |       await expect(page.getByRole("heading", { name: "Price and availability" })).toBeVisible();
      |                                                                                   ^ Error: expect(locator).toBeVisible() failed
  151 |     });
  152 | 
  153 |     test("[F.11, F.12, F.13] Settings page is reachable from header, switches language, and toggles notification switches", async ({
  154 |       page,
  155 |     }) => {
  156 |       await page.goto("/explore");
  157 |       await page.locator("header").getByRole("link", { name: "Settings" }).click();
  158 |       await expect(page).toHaveURL(/\/settings$/);
  159 |       await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  160 | 
  161 |       // Notification switch toggles
  162 |       const msgSwitch = page.getByRole("switch", { name: "New messages" });
  163 |       await expect(msgSwitch).toHaveAttribute("aria-checked", "true");
  164 |       await msgSwitch.click();
  165 |       await expect(msgSwitch).toHaveAttribute("aria-checked", "false");
  166 | 
  167 |       // Language toggle in Settings switches language
  168 |       await page.locator("main").getByRole("button", { name: "বাং" }).click();
  169 |       await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");
  170 |       await expect(page.getByRole("heading", { name: "সেটিংস" })).toBeVisible();
  171 |     });
  172 |   },
  173 | );
  174 | 
```