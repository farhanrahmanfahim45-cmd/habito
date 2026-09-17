# Habito

**Find the space that fits.**

A prototype for discovering and managing available spaces across Bangladesh — homes, rooms,
shops, offices, godowns, parking and land. Built for the IUB Innovation to Impact initiative.

> **Prototype.** Every listing, owner and image is synthetic seed data. Habito performs no real
> identity or ownership verification, and match scores are transparent arithmetic — not AI.

## The idea

Most property sites ask *"what property do you own?"* Habito asks *"what spaces do you have
available?"* A building isn't one listing — it's flats, a ground-floor shop, a godown and a
garage, each rentable to a different person. Owners manage all of it from one portfolio.

```
PROPERTY  Rahman Building, Mirpur
  ├── Flat 3A        Available soon
  ├── Flat 7B        For sale
  ├── Shop 01        Available
  ├── Godown 01      Available soon
  └── Garage         2 car slots free
```

## What works

**Seeker**
- Category-first discovery on the homepage, plus an Explore page of themed rails
- Requirement intake at `/find` driving a transparent match score with per-factor reasons
- Search across 237 spaces with ten filters and five sort orders
- "Nothing perfect yet" — nearby alternatives that explain how each one differs
- Space detail with gallery, lightbox, adaptive specs, cost breakdown and sibling spaces
- Save, compare up to four spaces, send a structured inquiry

**Owner**
- Portfolio with the property → space hierarchy, availability control and an inquiry inbox
- Six-step listing flow whose fields change with the category — a garage is never asked
  how many bedrooms it has
- Space requests from the demand side

**Platform**
- Everything persists across refresh, including spaces you create
- Responsive from 360px up; no horizontal overflow, no console errors

## Running it

```bash
npm install
npm run dev
```

Runs with no configuration. Add Supabase credentials to get real accounts —
see [SETUP.md](SETUP.md).

## Where the data lives

Habito has two interchangeable storage backends behind one interface
(`src/lib/api/types.ts`):

| | Without credentials | With Supabase configured |
|---|---|---|
| Storage | This browser | Postgres |
| Accounts | None — a demo role switch | Real sign-up and sign-in |
| Authorisation | Not enforced | Row-level security in the database |
| Sharing | Nothing is shared | Two accounts genuinely interact |

The app picks one at startup and no component knows the difference. A missing
environment variable degrades to browsing rather than breaking.

## Regenerating the dataset

```bash
node scripts/generate-habito-data.mjs
```

Writes 96 owners, 99 properties and 237 spaces to `src/data/seed.json`. Deterministic, so reruns
produce the same data. Roughly a quarter of listings deliberately withhold part of their cost and
a minority are stale — the filters and trust features need imperfect data to act on.

## Data layer

`src/lib/db.ts` is a repository with an async interface, backed today by browser storage. Every
component talks to it through domain objects, so replacing it with a FastAPI + PostgreSQL backend
means rewriting that one module and nothing else. It carries a seed fingerprint: when a new build
ships fresh seed data, returning visitors are re-seeded while anything they created is preserved.

## Stack

Vite · React 18 · TypeScript · Tailwind v4 · React Router. Bricolage Grotesque for display,
Manrope for everything else.

## Build stages

- **Stage 1 (done)** — Postgres schema for every entity, row-level security,
  real authentication with roles, guarded routes, and listings, favourites,
  portfolio and inquiries moved onto the database.
- **Stage 2** — messaging: conversation list, threads, unread counts.
- **Stage 3** — bookings: the request → accept → confirm → complete machine,
  with availability enforced.
- **Stage 4** — payments against a sandbox gateway, then rent records and receipts.
- **Stage 5** — admin panel, reports, reviews, maintenance requests.

The schema already holds tables for all of it, so later stages add behaviour
rather than migrating data.

## Not built yet

Map view, photo upload, and everything from Stage 2 onward.
