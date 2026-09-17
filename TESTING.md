# Testing Habito

Run these against a Supabase-connected build. Anything that says *persists*
means: do it, refresh, sign out, sign back in, and check it's still there.

## Setup

Create two accounts in separate browsers (or one normal window and one private
window — not two tabs, since they share a session):

- **Renter** — sign up choosing "I need a space"
- **Owner** — sign up choosing "I have a space"

## A — Renter

- [ ] Register, then sign in
- [ ] Session survives a refresh
- [ ] Browse listings without signing in
- [ ] Filter by category, area, price; sort each way
- [ ] Enter requirements at `/find`; matches are scored with reasons
- [ ] Open a space: images, cost breakdown, availability, owner, sibling spaces
- [ ] Save a space — **persists**
- [ ] Compare two spaces
- [ ] Send an inquiry on the owner's listing
- [ ] Post a space request — **persists**
- [ ] Edit name and phone on `/account` — **persists**

## B — Owner

- [ ] Register as an owner, sign in
- [ ] `/portfolio` starts empty with a clear next step
- [ ] Create a property and a space through `/list` — **persists**
- [ ] The new space appears in search for the renter account
- [ ] Change a space's availability — **persists**
- [ ] The renter's inquiry appears

## C — Access control

Each of these should be refused, not merely hidden:

- [ ] Signed out, open `/portfolio` → redirected to sign-in
- [ ] As a renter, open `/portfolio` → told the page isn't for this account
- [ ] As a renter, open `/list` → same
- [ ] Renter A cannot see Renter B's saved spaces
- [ ] An owner cannot edit another owner's listing

The last two are enforced by the database, so they hold even if someone calls
the API directly rather than using the interface.

## D — Failure states

- [ ] Sign in with the wrong password → a clear message, not a blank screen
- [ ] Sign up with an existing email → a clear message
- [ ] Remove the environment variables and restart → the app still browses,
      and the sign-up page says accounts aren't available

## D2 — Messaging (Stage 2)

With both accounts signed in, side by side:

- [ ] As the renter, send an inquiry on the owner's listing
- [ ] Click "Open conversation" — the thread opens with your message in it
- [ ] The owner sees an unread badge on Messages within a few seconds
- [ ] The owner opens the thread and replies
- [ ] The renter sees the reply arrive without refreshing
- [ ] The renter's sent messages show two ticks once the owner has read them
- [ ] Both sides survive a refresh — **persists**
- [ ] Signed out, `/messages` redirects to sign-in
- [ ] Neither account can see a thread they aren't part of

If replies take up to twenty seconds to appear, live delivery is off and the
polling fallback is doing the work. Run `supabase/migrations/0002_realtime.sql`
to switch it on.

## E — Stage 3

**Language**
- [ ] The EN / বাং toggle in the header switches the interface
- [ ] Bengali digits appear in prices (৳১২,০০০)
- [ ] The choice survives a refresh, and follows your account to another browser
- [ ] Headings still fit — Bengali sets longer than English

**One account, both sides**
- [ ] A renter account sees an offer to turn on owner tools under Account
- [ ] Turning it on adds the Renting / My spaces switch to the header
- [ ] Switching to My spaces shows an empty portfolio with a clear next step
- [ ] Switching back returns the renter navigation
- [ ] A renter who has *not* turned it on still cannot reach `/portfolio`

**Photos**
- [ ] Listing a space offers a Photos step
- [ ] Uploading a large phone photo works and is noticeably quicker than the raw file
- [ ] The first photo is marked Cover; another can be promoted
- [ ] A published listing shows the real photographs
- [ ] A listing with no photos falls back to illustration, and the caption says so

**Occupancy rules**
- [ ] Search has a "Who can live here" filter
- [ ] Choosing Bachelors removes listings that exclude them
- [ ] A living space's detail page shows who it is for
- [ ] The listing flow asks about it for living spaces and not for a garage

## F — Stage 4

**One account**
- [ ] The header shows the same navigation whoever you are — no mode switch
- [ ] My spaces is reachable from the header and the mobile tab bar
- [ ] With no properties, My spaces explains what to do instead of showing an empty dashboard
- [ ] Signed out, My spaces sends you to sign-in

**Editing**
- [ ] A pencil icon appears beside each space in My spaces
- [ ] Opening it fills the form with the current values
- [ ] The step markers are clickable, so a price change doesn't need six screens
- [ ] Saving updates the listing — check the detail page
- [ ] Your own listing offers Edit instead of Send inquiry
- [ ] Archiving removes it from search but keeps it in My spaces, marked Archived
- [ ] Deleting a space that has a conversation is refused, with an explanation
- [ ] Deleting a space nobody has contacted works

**Settings**
- [ ] Reachable from the header gear and the mobile tab bar
- [ ] Language switches from there and sticks
- [ ] Notification toggles move and stay
- [ ] Sign out works from Settings

**Bangla**
- [ ] The wording reads like speech, not translation — flag anything that doesn't

## F — Stage 4

**One navigation**
- [ ] No renter/owner switch anywhere in the header
- [ ] Explore, Search and My spaces are visible to every signed-in account
- [ ] A renter who has never listed anything can open My spaces and sees a prompt
- [ ] Mobile bottom bar shows Home, Search, Saved, Messages, My spaces

**Editing a space**
- [ ] My spaces shows an Edit button on each space
- [ ] Edit opens the same six steps with the values already filled in
- [ ] Changing the price and saving updates the listing — **persists**
- [ ] Archive removes it from search but keeps it in My spaces, marked
- [ ] Restoring puts it back in search
- [ ] Delete warns that conversations go with it, and suggests archiving instead
- [ ] Another owner's space cannot be edited by URL — the database refuses

**Settings**
- [ ] `/settings` is reachable from the header and holds language, notifications and sign-out
- [ ] Language changed here matches the toggle elsewhere
- [ ] Notification switches persist across a refresh
- [ ] Change password sends a reset email

**Bangla**
- [ ] Saved reads সেভ করা, Messages reads মেসেজ
- [ ] Nothing reads like a dictionary translation — flag anything that does

## G — Onboarding

Clear the flag first: DevTools → Application → Local Storage → delete
`habito.onboarded`, or use a private window.

- [ ] A first visit to `/` shows three questions: language, intent, area
- [ ] Choosing বাংলা switches the rest of onboarding immediately
- [ ] "I need a place" then an area lands you in Search, already filtered
- [ ] "I have a space" lands you in the listing flow
- [ ] "Just looking around" drops you on the homepage
- [ ] Skip works at every step
- [ ] It does not reappear on the next visit
- [ ] A deep link — opening `/space/<id>` directly — is **not** interrupted
- [ ] Search shows a one-time note explaining the match percentage
- [ ] My spaces shows a one-time note explaining property vs space
- [ ] A listing with undisclosed costs shows a one-time note explaining why
- [ ] Each note disappears for good once dismissed

## Known gaps at this stage

Bookings, payments, reviews, maintenance requests and the admin panel have
database tables but no interface yet.

**Translation is still partial.** Done: shell, navigation, homepage, cards,
badges, settings, and a register pass over the existing strings. Not yet:
search filter labels, headings on the inner screens, amenity names, and the
seed listings themselves — those carry English names and descriptions because
the generator writes them that way. Making the dataset bilingual is its own
task and is worth doing before real testers see it.

Notification toggles in Settings store a preference but nothing sends yet.
Email is deliberately out of scope until there is something worth emailing.
