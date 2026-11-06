# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-d2-messaging.spec.ts >> Section D2 — Messaging (Stage 2) >> [D2.demo] In local demo mode, sending an inquiry creates a conversation thread in /messages that survives refresh
- Location: e2e\section-d2-messaging.spec.ts:15:3

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
          - text: Arif Renter
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
  1  | import { test, expect } from "@playwright/test";
  2  | import {
  3  |   bypassOnboarding,
  4  |   hasTwoAccounts,
  5  |   MISSING_AUTH_REASON,
  6  |   signInWithEmail,
  7  |   STAGING_ACCOUNTS,
  8  | } from "./helpers";
  9  | 
  10 | test.describe("Section D2 — Messaging (Stage 2)", { tag: "@section-D2" }, () => {
  11 |   test.beforeEach(async ({ page }) => {
  12 |     await bypassOnboarding(page);
  13 |   });
  14 | 
  15 |   test("[D2.demo] In local demo mode, sending an inquiry creates a conversation thread in /messages that survives refresh", async ({
  16 |     page,
  17 |   }) => {
  18 |     await page.goto("/space/SP-0003");
  19 |     await page.locator("aside").getByRole("button", { name: "Send inquiry" }).click();
  20 | 
  21 |     const modal = page.getByRole("dialog");
  22 |     await modal.getByLabel("Your name").fill("Arif Renter");
> 23 |     await modal.getByLabel("Phone").fill("01700000011");
     |                                     ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  24 |     await modal.getByLabel("Message").fill("Hello, I would like to view this space.");
  25 |     await modal.getByRole("button", { name: "Send inquiry" }).click();
  26 | 
  27 |     await modal.getByRole("button", { name: "Open conversation" }).click();
  28 |     await expect(page).toHaveURL(/\/messages\/.+/);
  29 |     await expect(page.getByText("Hello, I would like to view this space.")).toBeVisible();
  30 | 
  31 |     await page.reload();
  32 |     await expect(page.getByText("Hello, I would like to view this space.")).toBeVisible();
  33 |   });
  34 | 
  35 |   test("[D2.1-D2.9] Two-account real-time messaging, unread badge, read ticks, persistence, and auth guard", async ({
  36 |     browser,
  37 |   }) => {
  38 |     test.skip(!hasTwoAccounts, MISSING_AUTH_REASON);
  39 | 
  40 |     const renterCtx = await browser.newContext();
  41 |     const ownerCtx = await browser.newContext();
  42 |     const renterPage = await renterCtx.newPage();
  43 |     const ownerPage = await ownerCtx.newPage();
  44 | 
  45 |     await signInWithEmail(renterPage, STAGING_ACCOUNTS.renterEmail, STAGING_ACCOUNTS.renterPassword);
  46 |     await signInWithEmail(ownerPage, STAGING_ACCOUNTS.ownerEmail, STAGING_ACCOUNTS.ownerPassword);
  47 | 
  48 |     // Owner opens /messages
  49 |     await ownerPage.goto("/messages");
  50 |     await expect(ownerPage.getByRole("heading", { name: "Messages" })).toBeVisible();
  51 | 
  52 |     // Renter opens /messages
  53 |     await renterPage.goto("/messages");
  54 |     await expect(renterPage.getByRole("heading", { name: "Messages" })).toBeVisible();
  55 | 
  56 |     await renterCtx.close();
  57 |     await ownerCtx.close();
  58 |   });
  59 | });
  60 | 
```