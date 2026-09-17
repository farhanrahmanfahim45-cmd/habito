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

## Known gaps at this stage

Bookings, payments, reviews, maintenance requests and the admin panel have
database tables but no interface yet. Messaging is done.
