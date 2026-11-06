# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-a-renter.spec.ts >> Section A — Renter >> [A.9] Send an inquiry on an owner's listing
- Location: e2e\section-a-renter.spec.ts:143:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByLabel('Phone')

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - button "Illustrative demo image representing the frontage of Shop 01 at Mannan Plaza Frontage · view all" [ref=e55]:
              - img "Illustrative demo image representing the frontage of Shop 01 at Mannan Plaza" [ref=e58]
              - generic [ref=e59]: Frontage · view all
            - generic [ref=e60]:
              - button "Show Frontage" [ref=e61]
              - button "Show Interior" [ref=e64]
              - button "Show Floor" [ref=e67]
          - paragraph [ref=e70]: Illustrative demo images. These are not photographs of a real space.
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - generic [ref=e74]: Shop
              - generic [ref=e75]: Available
              - generic [ref=e76]:
                - text: Verified
                - generic [ref=e80]: (demo)
            - heading "Shop 01" [level=1] [ref=e81]
            - link "Mannan Plaza · House 112, Road 4, Taltola" [ref=e82] [cursor=pointer]:
              - /url: /property/PR-002
              - text: Mannan Plaza
              - generic [ref=e87]: · House 112, Road 4, Taltola
            - paragraph [ref=e88]: Khilgaon, Dhaka · urban
            - paragraph [ref=e92]: 450 sqft shop with 22 ft frontage. Suits electronics.
            - generic [ref=e93]:
              - heading "The space" [level=2] [ref=e94]
              - generic [ref=e95]:
                - generic [ref=e96]:
                  - term [ref=e97]: Size
                  - definition [ref=e98]: 450 sqft
                - generic [ref=e99]:
                  - term [ref=e100]: Floor
                  - definition [ref=e101]: Ground
                - generic [ref=e102]:
                  - term [ref=e103]: Frontage
                  - definition [ref=e104]: 22 ft
                - generic [ref=e105]:
                  - term [ref=e106]: Suits
                  - definition [ref=e107]: Electronics
            - generic [ref=e108]:
              - heading "What's included" [level=2] [ref=e109]
              - list [ref=e110]:
                - listitem [ref=e111]: Air conditioning
                - listitem [ref=e117]: Roller shutter
                - listitem [ref=e120]: Lift
                - listitem [ref=e124]: Generator
                - listitem [ref=e127]: CCTV
            - generic [ref=e132]:
              - heading "Getting around" [level=2] [ref=e133]
              - list [ref=e134]:
                - listitem [ref=e135]:
                  - generic [ref=e136]: University
                  - generic [ref=e137]: 1.6 km
                - listitem [ref=e138]:
                  - generic [ref=e139]: Bus stop
                  - generic [ref=e140]: 0.3 km
                - listitem [ref=e141]:
                  - generic [ref=e142]: Hospital
                  - generic [ref=e143]: 1.7 km
                - listitem [ref=e144]:
                  - generic [ref=e145]: Grocery
                  - generic [ref=e146]: 0.7 km
                - listitem [ref=e147]:
                  - generic [ref=e148]: Metro station
                  - generic [ref=e149]: 3.9 km
                - listitem [ref=e150]:
                  - generic [ref=e151]: Bazar
                  - generic [ref=e152]: 1.6 km
            - generic [ref=e153]:
              - heading "Owner" [level=2] [ref=e154]
              - generic [ref=e155]:
                - generic [ref=e156]: F
                - generic [ref=e157]:
                  - paragraph [ref=e158]: Farhana Mannan
                  - paragraph [ref=e159]: owner
                  - paragraph [ref=e160]: Replies to 72% of inquiries · usually within 4h
                  - paragraph [ref=e161]: "Owner state: verified (demo). Habito has not carried out a real identity or ownership check."
              - button "Report this listing" [ref=e162]
          - complementary [ref=e165]:
            - generic [ref=e166]:
              - paragraph [ref=e167]: ৳29,500/month
              - paragraph [ref=e168]: Available now
              - heading "Monthly cost" [level=2] [ref=e169]
              - generic [ref=e170]:
                - generic [ref=e171]:
                  - term [ref=e172]: Rent
                  - definition [ref=e173]: ৳29,500
                - generic [ref=e174]:
                  - term [ref=e175]: Service charge
                  - definition [ref=e176]: Not listed
                - generic [ref=e177]:
                  - term [ref=e178]: Utilities
                  - definition [ref=e179]: Not listed
              - generic [ref=e180]:
                - paragraph [ref=e181]: This owner hasn't listed every cost, so a monthly total can't be shown.
                - complementary [ref=e182]:
                  - generic [ref=e185]:
                    - paragraph [ref=e186]: Why some listings show no total
                    - paragraph [ref=e187]: When an owner lists every cost we show what you would really pay each month. When they leave some out, we say so rather than showing a tempting rent.
                    - button "Got it" [ref=e188]
                  - button "Got it" [ref=e189]
              - generic [ref=e193]:
                - generic [ref=e194]:
                  - term [ref=e195]: Advance
                  - definition [ref=e196]: 2 months
                - generic [ref=e197]:
                  - term [ref=e198]: Deposit
                  - definition [ref=e199]: Not listed
              - generic [ref=e200]:
                - button "Request to book" [ref=e201]
                - button "Send inquiry" [ref=e205]
                - generic [ref=e206]:
                  - button "Save" [ref=e207]
                  - button "Compare" [ref=e210]
              - paragraph [ref=e215]: Updated 1 month ago · 191 views · 11 inquiries
    - contentinfo [ref=e216]:
      - generic [ref=e217]:
        - generic [ref=e218]:
          - link "Habito" [ref=e219] [cursor=pointer]:
            - /url: /
          - paragraph [ref=e224]: Habito makes every kind of usable space discoverable — homes, rooms, shops, offices, storage, parking and land, across Bangladesh.
        - navigation "Find a space" [ref=e225]:
          - heading "Find a space" [level=2] [ref=e226]
          - list [ref=e227]:
            - listitem [ref=e228]:
              - link "Explore" [ref=e229] [cursor=pointer]:
                - /url: /explore
            - listitem [ref=e230]:
              - link "Search" [ref=e231] [cursor=pointer]:
                - /url: /search
            - listitem [ref=e232]:
              - link "Find my space" [ref=e233] [cursor=pointer]:
                - /url: /find
            - listitem [ref=e234]:
              - link "Saved" [ref=e235] [cursor=pointer]:
                - /url: /saved
            - listitem [ref=e236]:
              - link "Messages" [ref=e237] [cursor=pointer]:
                - /url: /messages
        - navigation "For owners" [ref=e238]:
          - heading "For owners" [level=2] [ref=e239]
          - list [ref=e240]:
            - listitem [ref=e241]:
              - link "List a space" [ref=e242] [cursor=pointer]:
                - /url: /list
            - listitem [ref=e243]:
              - link "My spaces" [ref=e244] [cursor=pointer]:
                - /url: /portfolio
            - listitem [ref=e245]:
              - link "Create your account." [ref=e246] [cursor=pointer]:
                - /url: /signup
            - listitem [ref=e247]:
              - link "Requests" [ref=e248] [cursor=pointer]:
                - /url: /requests
      - generic [ref=e250]:
        - paragraph [ref=e251]: Prototype built for the Innovation to Impact initiative, Independent University, Bangladesh.
        - paragraph [ref=e252]: All seed data is synthetic. No real identity or ownership verification is performed.
  - dialog "Send an inquiry" [active] [ref=e255]:
    - generic [ref=e256]:
      - heading "Send an inquiry" [level=2] [ref=e257]
      - button "Close" [ref=e258]
    - generic [ref=e263]:
      - generic [ref=e265]:
        - paragraph [ref=e266]: Shop 01
        - paragraph [ref=e267]: Khilgaon · ৳29,500/month
      - generic [ref=e268]:
        - generic [ref=e269]: Your name
        - textbox "Your name" [ref=e270]:
          - /placeholder: So the owner knows who's asking
          - text: Nadia Islam
      - generic [ref=e271]:
        - generic [ref=e272]: Message
        - textbox "Message" [ref=e273]: Hi, I'm interested in this space. Is it still available?
      - generic [ref=e274]:
        - generic [ref=e275]: When you'd move in
        - textbox "When you'd move in" [ref=e276]: 2026-11-27
      - generic [ref=e277]:
        - paragraph [ref=e278]: Sent with your inquiry
        - list [ref=e279]:
          - listitem [ref=e280]: Budget ৳6,000–৳14,000
          - listitem [ref=e281]: Moving 27 November 2026
        - paragraph [ref=e282]: Your phone number isn't shared until you choose to.
    - generic [ref=e284]:
      - button "Cancel" [ref=e285]
      - button "Send" [ref=e286]
```

# Test source

```ts
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
  101 |     await expect(page.getByRole("heading", { name: "Owner" })).toBeVisible();
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
> 151 |     await modal.getByLabel("Phone").fill("01711223344");
      |                                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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