# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-e-f-n-stage3-4-bangla.spec.ts >> Section E, F & N — Stage 3, Stage 4 (Navigation, Editing, Settings) & Bangla >> [F.5, F.6, F.8, F.9, F.10] Edit a space from My spaces, update price, archive and restore
- Location: e2e\section-e-f-n-stage3-4-bangla.spec.ts:104:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('aside').getByRole('link', { name: 'Edit' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('aside').getByRole('link', { name: 'Edit' }) with timeout 5000ms
  - waiting for locator('aside').getByRole('link', { name: 'Edit' })

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
  - link "Back to results":
    - /url: /search
  - button "Illustrative demo image representing the exterior of Flat 7C at Rahman Building Exterior · view all":
    - img "Illustrative demo image representing the exterior of Flat 7C at Rahman Building"
    - text: Exterior · view all
  - button "Show Exterior"
  - button "Show Living area"
  - button "Show Bedroom"
  - paragraph: Illustrative demo images. These are not photographs of a real space.
  - text: Apartment Available Verified (demo)
  - heading "Flat 7C" [level=1]
  - link "Rahman Building · House 12, Road 3, Mirpur 1":
    - /url: /property/PR-D1
  - paragraph: Mirpur Model, Dhaka · urban
  - paragraph: 3 bedroom flat of 1200 sqft on floor 4.
  - heading "The space" [level=2]
  - term: Bedrooms
  - definition: "3"
  - term: Bathrooms
  - definition: "2"
  - term: Size
  - definition: 1200 sqft
  - term: Floor
  - definition: "4"
  - term: Furnishing
  - definition: furnished
  - term: Balcony
  - definition: "Yes"
  - heading "What's included" [level=2]
  - list:
    - listitem: Lift
    - listitem: Gas line
    - listitem: Furnished
    - listitem: Attached bathroom
    - listitem: CCTV
  - heading "Who this is for" [level=2]
  - list:
    - listitem: Families welcome
    - listitem: No bachelors
  - heading "Getting around" [level=2]
  - list:
    - listitem: Bus stop 0.6 km
    - listitem: Grocery 0.4 km
    - listitem: Hospital 1 km
  - heading "More at Rahman Building" [level=2]
  - list:
    - listitem:
      - link "Flat 7B Apartment ৳16,000":
        - /url: /space/SP-0227
        - paragraph: Flat 7B
        - paragraph: Apartment
        - text: ৳16,000
    - listitem:
      - link "Shop 01 Shop ৳32,000":
        - /url: /space/SP-0228
        - paragraph: Shop 01
        - paragraph: Shop
        - text: ৳32,000
    - listitem:
      - link "Godown 01 Godown ৳36,500":
        - /url: /space/SP-0229
        - paragraph: Godown 01
        - paragraph: Godown
        - text: ৳36,500
    - listitem:
      - link "Garage Garage ৳3,700":
        - /url: /space/SP-0230
        - paragraph: Garage
        - paragraph: Garage
        - text: ৳3,700
  - heading "Owner" [level=2]
  - text: R
  - paragraph: Rahman Chowdhury
  - paragraph: caretaker
  - paragraph: Replies to 94% of inquiries · usually within 3h
  - paragraph: "Owner state: verified (demo). Habito has not carried out a real identity or ownership check."
  - button "Report this listing"
  - complementary:
    - paragraph: ৳19,500/month
    - paragraph: Available now
    - heading "Monthly cost" [level=2]
    - term: Rent
    - definition: ৳19,500
    - term: Service charge
    - definition: Not listed
    - term: Utilities
    - definition: Not listed
    - paragraph: This owner hasn't listed every cost, so a monthly total can't be shown.
    - complementary:
      - paragraph: Why some listings show no total
      - paragraph: When an owner lists every cost we show what you would really pay each month. When they leave some out, we say so rather than showing a tempting rent.
      - button "Got it"
      - button "Got it"
    - term: Advance
    - definition: 3 months
    - term: Deposit
    - definition: Not listed
    - button "Request to book"
    - button "Send inquiry"
    - button "Save"
    - button "Compare"
    - paragraph: Updated 1 month ago · 181 views · 16 inquiries
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
  9   |       await bypassOnboarding(page);
  10  |     });
  11  | 
  12  |     test("[E.1, E.2, E.3, F.15, N.1, N.2, N.3, N.4] Language toggle switches interface to Bangla, renders Bengali digits in prices, translates seed listings, and survives refresh", async ({
  13  |       page,
  14  |     }) => {
  15  |       await page.setViewportSize({ width: 1280, height: 800 });
  16  |       await page.goto("/space/SP-0226");
  17  |       await expect(page.getByRole("heading", { name: "Flat 7C" })).toBeVisible();
  18  | 
  19  |       // Switch to Bangla via header toggle
  20  |       const langGroup = page.locator("header").getByRole("group", { name: /Language/i });
  21  |       await langGroup.getByRole("button", { name: "বাং" }).click();
  22  | 
  23  |       await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");
  24  | 
  25  |       // [F.15] Saved reads সেভ করা, Messages reads মেসেজ
  26  |       await expect(page.locator("header").getByRole("link", { name: "সেভ করা" })).toBeVisible();
  27  |       await expect(page.locator("header").getByRole("link", { name: "মেসেজ" })).toBeVisible();
  28  | 
  29  |       // [N.1, N.2] Seed listing name and description render in Bangla with Bengali numerals
  30  |       await expect(page.getByRole("heading", { name: "ফ্ল্যাট ৭C" })).toBeVisible();
  31  |       await expect(page.getByText(/৪ তলায় ১২০০ বর্গফুটের ৩ রুমের ফ্ল্যাট।/)).toBeVisible();
  32  | 
  33  |       // [E.2] Bengali digits appear in prices (৳ + Bengali numerals)
  34  |       await expect(page.locator("aside").getByText(/৳[০-৯,]+/).first()).toBeVisible();
  35  | 
  36  |       // [E.3] Language choice survives a refresh
  37  |       await page.reload();
  38  |       await expect(page.locator("html")).toHaveAttribute("data-lang", "bn");
  39  |       await expect(page.getByRole("heading", { name: "ফ্ল্যাট ৭C" })).toBeVisible();
  40  | 
  41  |       // [N.3] Filter labels in /search and footer are Bangla
  42  |       await page.goto("/search");
  43  |       await expect(page.locator("aside").getByText("ধরন")).toBeVisible();
  44  |       await expect(page.locator("aside").getByText("এলাকা")).toBeVisible();
  45  |     });
  46  | 
  47  |     test("[E.9, E.10, E.11, E.12] Occupancy rules filter in search, detail page rules, and listing flow living-only rules", async ({
  48  |       page,
  49  |     }) => {
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
> 109 |       await expect(page.locator("aside").getByRole("link", { name: "Edit" })).toBeVisible();
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
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
  150 |       await expect(page.getByRole("heading", { name: "Price and availability" })).toBeVisible();
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