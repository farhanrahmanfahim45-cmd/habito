# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-a-renter.spec.ts >> Section A — Renter >> [A.6] Open a space: images, cost breakdown, availability, owner, sibling spaces
- Location: e2e\section-a-renter.spec.ts:82:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Owner' })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: 'Owner' }) resolved to 2 elements:
    1) <h2 class="mb-3 font-display text-xl font-bold text-ink">Owner</h2> aka getByRole('heading', { name: 'Owner', exact: true })
    2) <h2 class="mb-3 font-display text-sm font-bold text-ink">For owners</h2> aka getByRole('heading', { name: 'For owners' })

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Owner' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Owner' })

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
        - link "Back to results" [ref=e51] [cursor=pointer]:
          - /url: /search
        - generic [ref=e54]:
          - button "Illustrative demo image representing the exterior of Flat 7C at Rahman Building Exterior · view all" [ref=e55]:
            - img "Illustrative demo image representing the exterior of Flat 7C at Rahman Building" [ref=e58]
            - generic [ref=e59]: Exterior · view all
          - generic [ref=e60]:
            - button "Show Exterior" [ref=e61]
            - button "Show Living area" [ref=e64]
            - button "Show Bedroom" [ref=e67]
        - paragraph [ref=e70]: Illustrative demo images. These are not photographs of a real space.
      - generic [ref=e71]:
        - generic [ref=e72]:
          - generic [ref=e73]:
            - generic [ref=e74]: Apartment
            - generic [ref=e75]: Available
            - generic [ref=e76]:
              - text: Verified
              - generic [ref=e80]: (demo)
          - heading "Flat 7C" [level=1] [ref=e81]
          - link "Rahman Building · House 12, Road 3, Mirpur 1" [ref=e82] [cursor=pointer]:
            - /url: /property/PR-D1
            - text: Rahman Building
            - generic [ref=e87]: · House 12, Road 3, Mirpur 1
          - paragraph [ref=e88]: Mirpur Model, Dhaka · urban
          - paragraph [ref=e92]: 3 bedroom flat of 1200 sqft on floor 4.
          - generic [ref=e93]:
            - heading "The space" [level=2] [ref=e94]
            - generic [ref=e95]:
              - generic [ref=e96]:
                - term [ref=e97]: Bedrooms
                - definition [ref=e98]: "3"
              - generic [ref=e99]:
                - term [ref=e100]: Bathrooms
                - definition [ref=e101]: "2"
              - generic [ref=e102]:
                - term [ref=e103]: Size
                - definition [ref=e104]: 1200 sqft
              - generic [ref=e105]:
                - term [ref=e106]: Floor
                - definition [ref=e107]: "4"
              - generic [ref=e108]:
                - term [ref=e109]: Furnishing
                - definition [ref=e110]: furnished
              - generic [ref=e111]:
                - term [ref=e112]: Balcony
                - definition [ref=e113]: "Yes"
          - generic [ref=e114]:
            - heading "What's included" [level=2] [ref=e115]
            - list [ref=e116]:
              - listitem [ref=e117]: Lift
              - listitem [ref=e121]: Gas line
              - listitem [ref=e124]: Furnished
              - listitem [ref=e128]: Attached bathroom
              - listitem [ref=e133]: CCTV
          - generic [ref=e138]:
            - heading "Who this is for" [level=2] [ref=e139]
            - list [ref=e140]:
              - listitem [ref=e141]: Families welcome
              - listitem [ref=e144]: No bachelors
          - generic [ref=e148]:
            - heading "Getting around" [level=2] [ref=e149]
            - list [ref=e150]:
              - listitem [ref=e151]:
                - generic [ref=e152]: Bus stop
                - generic [ref=e153]: 0.6 km
              - listitem [ref=e154]:
                - generic [ref=e155]: Grocery
                - generic [ref=e156]: 0.4 km
              - listitem [ref=e157]:
                - generic [ref=e158]: Hospital
                - generic [ref=e159]: 1 km
          - generic [ref=e160]:
            - heading "More at Rahman Building" [level=2] [ref=e161]
            - list [ref=e162]:
              - listitem [ref=e163]:
                - link "Flat 7B Apartment ৳16,000" [ref=e164] [cursor=pointer]:
                  - /url: /space/SP-0227
                  - generic [ref=e165]:
                    - paragraph [ref=e166]: Flat 7B
                    - paragraph [ref=e167]: Apartment
                  - generic [ref=e168]: ৳16,000
              - listitem [ref=e171]:
                - link "Shop 01 Shop ৳32,000" [ref=e172] [cursor=pointer]:
                  - /url: /space/SP-0228
                  - generic [ref=e173]:
                    - paragraph [ref=e174]: Shop 01
                    - paragraph [ref=e175]: Shop
                  - generic [ref=e176]: ৳32,000
              - listitem [ref=e179]:
                - link "Godown 01 Godown ৳36,500" [ref=e180] [cursor=pointer]:
                  - /url: /space/SP-0229
                  - generic [ref=e181]:
                    - paragraph [ref=e182]: Godown 01
                    - paragraph [ref=e183]: Godown
                  - generic [ref=e184]: ৳36,500
              - listitem [ref=e187]:
                - link "Garage Garage ৳3,700" [ref=e188] [cursor=pointer]:
                  - /url: /space/SP-0230
                  - generic [ref=e189]:
                    - paragraph [ref=e190]: Garage
                    - paragraph [ref=e191]: Garage
                  - generic [ref=e192]: ৳3,700
          - generic [ref=e195]:
            - heading "Owner" [level=2] [ref=e196]
            - generic [ref=e197]:
              - generic [ref=e198]: R
              - generic [ref=e199]:
                - paragraph [ref=e200]: Rahman Chowdhury
                - paragraph [ref=e201]: caretaker
                - paragraph [ref=e202]: Replies to 94% of inquiries · usually within 3h
                - paragraph [ref=e203]: "Owner state: verified (demo). Habito has not carried out a real identity or ownership check."
            - button "Report this listing" [ref=e204]
        - complementary [ref=e207]:
          - generic [ref=e208]:
            - paragraph [ref=e209]: ৳19,500/month
            - paragraph [ref=e210]: Available now
            - heading "Monthly cost" [level=2] [ref=e211]
            - generic [ref=e212]:
              - generic [ref=e213]:
                - term [ref=e214]: Rent
                - definition [ref=e215]: ৳19,500
              - generic [ref=e216]:
                - term [ref=e217]: Service charge
                - definition [ref=e218]: Not listed
              - generic [ref=e219]:
                - term [ref=e220]: Utilities
                - definition [ref=e221]: Not listed
            - generic [ref=e222]:
              - paragraph [ref=e223]: This owner hasn't listed every cost, so a monthly total can't be shown.
              - complementary [ref=e224]:
                - generic [ref=e227]:
                  - paragraph [ref=e228]: Why some listings show no total
                  - paragraph [ref=e229]: When an owner lists every cost we show what you would really pay each month. When they leave some out, we say so rather than showing a tempting rent.
                  - button "Got it" [ref=e230]
                - button "Got it" [ref=e231]
            - generic [ref=e235]:
              - generic [ref=e236]:
                - term [ref=e237]: Advance
                - definition [ref=e238]: 3 months
              - generic [ref=e239]:
                - term [ref=e240]: Deposit
                - definition [ref=e241]: Not listed
            - generic [ref=e242]:
              - button "Request to book" [ref=e243]
              - button "Send inquiry" [ref=e247]
              - generic [ref=e248]:
                - button "Save" [ref=e249]
                - button "Compare" [ref=e252]
            - paragraph [ref=e257]: Updated 1 month ago · 181 views · 16 inquiries
  - contentinfo [ref=e258]:
    - generic [ref=e259]:
      - generic [ref=e260]:
        - link "Habito" [ref=e261] [cursor=pointer]:
          - /url: /
        - paragraph [ref=e266]: Habito makes every kind of usable space discoverable — homes, rooms, shops, offices, storage, parking and land, across Bangladesh.
      - navigation "Find a space" [ref=e267]:
        - heading "Find a space" [level=2] [ref=e268]
        - list [ref=e269]:
          - listitem [ref=e270]:
            - link "Explore" [ref=e271] [cursor=pointer]:
              - /url: /explore
          - listitem [ref=e272]:
            - link "Search" [ref=e273] [cursor=pointer]:
              - /url: /search
          - listitem [ref=e274]:
            - link "Find my space" [ref=e275] [cursor=pointer]:
              - /url: /find
          - listitem [ref=e276]:
            - link "Saved" [ref=e277] [cursor=pointer]:
              - /url: /saved
          - listitem [ref=e278]:
            - link "Messages" [ref=e279] [cursor=pointer]:
              - /url: /messages
      - navigation "For owners" [ref=e280]:
        - heading "For owners" [level=2] [ref=e281]
        - list [ref=e282]:
          - listitem [ref=e283]:
            - link "List a space" [ref=e284] [cursor=pointer]:
              - /url: /list
          - listitem [ref=e285]:
            - link "My spaces" [ref=e286] [cursor=pointer]:
              - /url: /portfolio
          - listitem [ref=e287]:
            - link "Create your account." [ref=e288] [cursor=pointer]:
              - /url: /signup
          - listitem [ref=e289]:
            - link "Requests" [ref=e290] [cursor=pointer]:
              - /url: /requests
    - generic [ref=e292]:
      - paragraph [ref=e293]: Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.
      - paragraph [ref=e294]: All seed data is synthetic. No real identity or ownership verification is performed.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import {
  3   |   bypassOnboarding,
  4   |   hasRenterAccount,
  5   |   MISSING_AUTH_REASON,
  6   |   signInWithEmail,
  7   |   STAGING_ACCOUNTS,
  8   | } from "./helpers";
  9   | 
  10  | test.describe("Section A — Renter", { tag: "@section-A" }, () => {
  11  |   test.beforeEach(async ({ page }) => {
  12  |     await bypassOnboarding(page);
  13  |   });
  14  | 
  15  |   test("[A.3] Browse listings without signing in", async ({ page }) => {
  16  |     await page.goto("/explore");
  17  |     await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  18  |     await expect(page.locator("article").first()).toBeVisible();
  19  | 
  20  |     await page.goto("/search");
  21  |     await expect(page.getByRole("heading", { name: "Find a space" })).toBeVisible();
  22  |     await expect(page.locator("article").first()).toBeVisible();
  23  |   });
  24  | 
  25  |   test("[A.4] Filter by category, area, price; sort each way", async ({ page }) => {
  26  |     await page.goto("/search");
  27  |     await expect(page.locator("article").first()).toBeVisible();
  28  | 
  29  |     // Filter by category: Living
  30  |     const aside = page.locator("aside");
  31  |     await aside.getByRole("button", { name: "Living", exact: true }).click();
  32  |     await expect(page.getByRole("heading", { name: "Living" })).toBeVisible();
  33  | 
  34  |     // Filter by area using AreaPicker
  35  |     await aside.getByRole("button", { name: "Everywhere" }).click();
  36  |     const dialog = page.getByRole("dialog");
  37  |     await expect(dialog).toBeVisible();
  38  |     await dialog.getByPlaceholder("Search an area or neighbourhood").fill("Dhanmondi");
  39  |     await dialog.getByRole("button", { name: /Dhanmondi/i }).first().click();
  40  |     await expect(dialog).toBeHidden();
  41  | 
  42  |     // Reset area to Everywhere so we have plenty of results to sort
  43  |     await aside.getByRole("button", { name: /Dhanmondi/i }).click();
  44  |     await page.getByRole("dialog").getByRole("button", { name: "Everywhere" }).click();
  45  | 
  46  |     // Filter by price slider
  47  |     const slider = aside.getByRole("slider", { name: "Maximum monthly price" });
  48  |     await slider.fill("30000");
  49  |     await expect(aside.getByText(/Rent up to ৳30,000/)).toBeVisible();
  50  | 
  51  |     // Sort each way
  52  |     const sortSelect = page.getByLabel("Sort");
  53  |     for (const sortValue of ["price-low", "price-high", "recent", "size", "best-match"]) {
  54  |       await sortSelect.selectOption(sortValue);
  55  |       await expect(page.locator("article").first()).toBeVisible();
  56  |     }
  57  |   });
  58  | 
  59  |   test("[A.5] Enter requirements at /find; matches are scored with reasons", async ({ page }) => {
  60  |     await page.goto("/find");
  61  |     await expect(page.getByRole("heading", { name: "Tell us what you need." })).toBeVisible();
  62  | 
  63  |     await page.getByRole("button", { name: "Living" }).click();
  64  |     await page.getByLabel("Minimum").fill("8000");
  65  |     await page.getByLabel("Maximum").fill("25000");
  66  |     await page.getByRole("button", { name: "Show my matches" }).click();
  67  | 
  68  |     await expect(page).toHaveURL(/\/search$/);
  69  |     await expect(page.getByText(/Scored against your needs:/)).toBeVisible();
  70  | 
  71  |     // Cards show percentage match pills
  72  |     const firstCard = page.locator("article").first();
  73  |     await expect(firstCard.getByText(/%/)).toBeVisible();
  74  | 
  75  |     // Open the space and verify match breakdown with reasons
  76  |     await firstCard.getByRole("link").first().click();
  77  |     await expect(page.getByRole("heading", { name: "Why this scores as it does" })).toBeVisible();
  78  |     await expect(page.getByText("Budget", { exact: true })).toBeVisible();
  79  |     await expect(page.getByText("Location", { exact: true })).toBeVisible();
  80  |   });
  81  | 
  82  |   test("[A.6] Open a space: images, cost breakdown, availability, owner, sibling spaces", async ({
  83  |     page,
  84  |   }) => {
  85  |     // SP-0226 (Flat 7C in PR-D1) has sibling spaces in PR-D1
  86  |     await page.goto("/space/SP-0226");
  87  |     await expect(page.getByRole("heading", { name: "Flat 7C" })).toBeVisible();
  88  | 
  89  |     // Images gallery + view all trigger
  90  |     await expect(page.getByText(/view all/i)).toBeVisible();
  91  | 
  92  |     // Cost breakdown
  93  |     await expect(page.getByRole("heading", { name: "Monthly cost" })).toBeVisible();
  94  |     await expect(page.getByText("Service charge")).toBeVisible();
  95  |     await expect(page.getByText("Utilities")).toBeVisible();
  96  | 
  97  |     // Availability
  98  |     await expect(page.getByText(/Available/i).first()).toBeVisible();
  99  | 
  100 |     // Owner section
> 101 |     await expect(page.getByRole("heading", { name: "Owner" })).toBeVisible();
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  102 |     await expect(page.getByText(/Replies to \d+% of inquiries/)).toBeVisible();
  103 | 
  104 |     // Sibling spaces at the same property
  105 |     await expect(page.getByRole("heading", { name: /More at/i })).toBeVisible();
  106 |   });
  107 | 
  108 |   test("[A.7] Save a space — persists across reload", async ({ page }) => {
  109 |     await page.goto("/space/SP-0226");
  110 |     const saveBtn = page.locator("aside").getByRole("button", { name: /^Save$/i });
  111 |     await saveBtn.click();
  112 |     await expect(page.locator("aside").getByRole("button", { name: /^Saved$/i })).toBeVisible();
  113 | 
  114 |     await page.reload();
  115 |     await expect(page.locator("aside").getByRole("button", { name: /^Saved$/i })).toBeVisible();
  116 | 
  117 |     await page.goto("/saved");
  118 |     await expect(page.getByRole("heading", { name: "Saved spaces" })).toBeVisible();
  119 |     await expect(page.getByRole("link", { name: "Flat 7C" })).toBeVisible();
  120 |   });
  121 | 
  122 |   test("[A.8] Compare two spaces", async ({ page }) => {
  123 |     await page.goto("/search");
  124 |     const compareButtons = page.getByRole("button", { name: /Add .* to compare/i });
  125 |     await compareButtons.nth(0).click();
  126 |     await compareButtons.nth(1).click();
  127 | 
  128 |     // Compare tray appears at the bottom
  129 |     await expect(page.getByText("Compare 2")).toBeVisible();
  130 |     await page.getByRole("link", { name: /Compare/i }).last().click();
  131 | 
  132 |     await expect(page).toHaveURL(/\/compare$/);
  133 |     await expect(page.getByText(/2 spaces side by side/)).toBeVisible();
  134 |     const table = page.getByRole("table", {
  135 |       name: /Side-by-side comparison of the spaces you selected/i,
  136 |     });
  137 |     await expect(table).toBeVisible();
  138 |     await expect(table.getByRole("rowheader", { name: "Price", exact: true })).toBeVisible();
  139 |     await expect(table.getByRole("rowheader", { name: "Total monthly", exact: true })).toBeVisible();
  140 |     await expect(table.getByRole("rowheader", { name: "Availability", exact: true })).toBeVisible();
  141 |   });
  142 | 
  143 |   test("[A.9] Send an inquiry on an owner's listing", async ({ page }) => {
  144 |     // SP-0003 belongs to a non-DEMO_OWNER_ID owner so Send inquiry is shown
  145 |     await page.goto("/space/SP-0003");
  146 |     await page.locator("aside").getByRole("button", { name: "Send inquiry" }).click();
  147 | 
  148 |     const modal = page.getByRole("dialog");
  149 |     await expect(modal).toBeVisible();
  150 |     await modal.getByLabel("Your name").fill("Nadia Islam");
  151 |     await modal.getByLabel("Phone").fill("01711223344");
  152 |     await modal.getByLabel("Message").fill("Is this space still available from next month?");
  153 |     await modal.getByRole("button", { name: "Send inquiry" }).click();
  154 | 
  155 |     await expect(modal.getByText("Inquiry sent")).toBeVisible();
  156 |     await expect(modal.getByRole("button", { name: "Open conversation" })).toBeVisible();
  157 |   });
  158 | 
  159 |   test("[A.10] Post a space request — persists across reload", async ({ page }) => {
  160 |     await page.goto("/requests");
  161 |     await page.getByRole("button", { name: "Post a request" }).first().click();
  162 | 
  163 |     const modal = page.getByRole("dialog");
  164 |     await expect(modal).toBeVisible();
  165 |     await modal.getByLabel("Anything else").fill("Need ground floor with generator backup");
  166 |     await modal.getByRole("button", { name: "Post", exact: true }).click();
  167 | 
  168 |     await expect(modal).toBeHidden();
  169 |     await expect(page.getByText("Need ground floor with generator backup")).toBeVisible();
  170 | 
  171 |     await page.reload();
  172 |     await expect(page.getByText("Need ground floor with generator backup")).toBeVisible();
  173 |   });
  174 | 
  175 |   test("[A.1, A.2, A.11] Register/sign in, session survives refresh, edit name and phone on /account", async ({
  176 |     page,
  177 |   }) => {
  178 |     test.skip(!hasRenterAccount, MISSING_AUTH_REASON);
  179 | 
  180 |     await signInWithEmail(page, STAGING_ACCOUNTS.renterEmail, STAGING_ACCOUNTS.renterPassword);
  181 |     await expect(page).toHaveURL(/\/(explore|portfolio)/);
  182 | 
  183 |     // Session survives a refresh
  184 |     await page.reload();
  185 |     await page.goto("/account");
  186 |     await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
  187 | 
  188 |     // Edit name and phone on /account — persists
  189 |     const nameInput = page.getByLabel("Name");
  190 |     await nameInput.fill("Renter E2E Updated");
  191 |     await page.getByRole("button", { name: /Save/i }).click();
  192 |     await page.reload();
  193 |     await expect(page.getByLabel("Name")).toHaveValue("Renter E2E Updated");
  194 |   });
  195 | });
  196 | 
```