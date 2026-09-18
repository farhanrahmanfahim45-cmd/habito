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

## H — Geography

- [ ] Choosing an area opens a searchable sheet, not a 72-item dropdown
- [ ] Areas are grouped: Dhaka Metro, Greater Dhaka, then the other divisions
- [ ] Typing a **neighbourhood** finds its thana — "kazipara" returns Mirpur Model,
      "banasree" returns Rampura, "sector 7" returns Uttara East
- [ ] The search filter has an "everywhere" option; the listing form does not
- [ ] Search results still appear after changing area
- [ ] The picker is usable one-handed on a phone

Supply is spread across 40 of the 72 areas, weighted the way it really is —
dense in Mirpur, Mohammadpur, Badda, thin in the divisional cities. Areas with
no listings are expected and correct: they show the empty state with nearby
alternatives.

## I — Category weighting

- [ ] Find asks a different capacity question per category: bedrooms for
      living, floor area for business, area + headroom for storage, vehicles
      for parking, decimals for land
- [ ] A parking listing's match breakdown has **no size row at all**
- [ ] A shop's breakdown gives location more weight than budget
- [ ] A godown's breakdown gives capacity 20 points
- [ ] Asking for 2 car slots and finding a garage with 1 free scores it down
      under Availability, with the free-slot note as the reason

## J — Bookings (Stage 5)

With two accounts, renter in one window and owner in a private window:

- [ ] A listing shows **Request to book** alongside Send inquiry
- [ ] An occupied or under-maintenance space cannot be booked — button disabled
- [ ] Requesting sends you to Bookings with the status **Requested**
- [ ] The renter sees "phone numbers are exchanged only if the owner accepts"
- [ ] The owner sees the request in their Bookings
- [ ] **The renter cannot accept their own request** — no button, and the
      database refuses if you try it directly
- [ ] On Accept, both sides see the other's phone number for the first time
- [ ] **Accepting does not take the space off the market** — it stays listed and
      other people can still ask
- [ ] The owner can accept several people at once and talk to all of them
- [ ] Confirm asks "have you agreed with them?" before doing anything
- [ ] On Confirm, the space becomes Occupied, leaves search, and everyone else
      who asked is declined with a reason
- [ ] A second person cannot book that space while it is occupied
- [ ] On Mark complete, the space returns to Available
- [ ] A completed booking is terminal — no further actions
- [ ] Declining asks for a reason, and the renter sees it
- [ ] Either side can cancel before completion

**The state machine is enforced in the database.** Legal moves, who may make
them, and the phone reveal are all in `0005_bookings.sql`, so a hidden button
is a courtesy rather than the protection.

### If listings stop loading after stage 5

The caretaker table gives PostgREST a second path from `properties` to
`profiles`, so an unqualified embed becomes ambiguous and the listings query
fails with *"more than one relationship was found"*. The query names the
foreign key explicitly (`profiles!properties_owner_id_fkey`). If you add
another table joining those two, expect to do the same.

### If your own listings vanish from search

Check whether a test booking took them off the market:

```sql
select s.name, s.availability, b.status
from spaces s left join bookings b on b.space_id = s.id
where s.property_id in (select id from properties where owner_id = auth.uid());
```

`occupied` is the Stage 5 trigger working as designed. Completing or
cancelling the booking puts the space back.

## K — Trust without identity verification (Stage 6)

- [ ] A listing missing cost, location or photos **cannot be published** — the
      database refuses with a message saying what's missing
- [ ] Filling those in lets it publish
- [ ] A brand-new account can list 3 spaces a day, not 1 and not 20
- [ ] The same description pasted under a different owner sets a duplicate flag
- [ ] Three **different** people reporting a listing hides it; one person
      reporting three times does not
- [ ] A hidden listing is still visible to its owner

### Fixed in this pass

- **Removing a photo didn't stick.** Saving fell back to the existing images
  whenever the list was empty, so deleting them all restored them. The form now
  tracks whether the photos were touched; if they were, what's there is what
  saves — and an emptied list falls back to the illustration, not to the
  photographs you deleted.
- **The area picker opened below the results.** The dialog used fixed
  positioning but was rendered inside the sticky, scrolling filter panel, so it
  positioned against that panel instead of the viewport. It's now portalled to
  `<body>`.

## L — Rent and payments (Stage 7)

- [ ] Confirming a booking raises one invoice per month, due on the day the
      month starts
- [ ] The rent page carries an unmissable sandbox warning
- [ ] A renter sees **Pay**; an owner sees **Waive**
- [ ] Paying issues a receipt with a sequential number
- [ ] The receipt says it was issued against a simulated payment
- [ ] An invoice past its due date shows as Overdue without anyone setting it
- [ ] A sale listing raises **no** rent schedule

Database guards, all verified against Postgres:

- [ ] A payment cannot be inserted as already successful
- [ ] An invoice cannot be marked paid without a successful payment
- [ ] A failed payment will not settle an invoice
- [ ] An owner can still waive a month

See `PAYMENTS.md` for what has to change to make the gateway real.

## M — The review queue (Stage 8)

Make yourself an admin first (see `SETUP.md`), then:

- [ ] A **Review** link appears in the header for admins and nobody else
- [ ] `/admin` typed directly by a non-admin shows a refusal, not the queue
- [ ] The queue lists reported, hidden, duplicate-flagged and unreviewed
      listings, most urgent first
- [ ] Dismissing reports puts a hidden listing back up
- [ ] Upholding reports keeps it down
- [ ] "Not a duplicate" clears the flag
- [ ] Reviewing an owner requires a note, and the note explains what was checked
- [ ] **id-verified cannot be set** — the database refuses it outright

Verified against Postgres:

- [ ] An owner calling the admin functions directly is refused
- [ ] Every action writes an audit row naming who did it
- [ ] An admin cannot edit or delete a past audit row

## N — Bangla listings

- [ ] In Bangla, listing names read as Bangla — ফ্ল্যাট ৩A, দোকান ০১, গুদাম ০১
- [ ] Descriptions are Bangla with Bengali numerals
- [ ] Amenity chips, filter labels and the footer are all Bangla
- [ ] Area names, property names and people's names stay as they are —
      proper nouns, correctly
- [ ] A listing **you** wrote is shown exactly as you wrote it in either mode

## O — Visual pass

- [ ] Cards lift on hover with a pointer, and do nothing on a touch screen
- [ ] Results fade up in sequence, and the sequence stops after seven cards
- [ ] Modals rise from the bottom on a phone, centre on a desktop
- [ ] Buttons shrink slightly on press
- [ ] Turning on "reduce motion" in the OS removes all of it
- [ ] Photos fade in over a shimmer rather than popping
- [ ] A broken image falls back to the illustration, not a broken icon
- [ ] Mobile cards carry two chips, not five
- [ ] No horizontal scroll on any page at 390px

### Photographs on demo listings

`src/data/photos.ts` holds `PHOTO_MODE`. It ships as `"illustration"`.

Switching it to `"photo"` uses the URLs in that file and puts a permanent
"Illustrative — not this property" band over every one. **Do not switch it on
with the placeholder URLs** — the placeholder service returns random
landscapes and objects, which looks worse than the illustration and makes a
property app look careless. Replace them with curated Unsplash property
photographs first; the file explains how.

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
