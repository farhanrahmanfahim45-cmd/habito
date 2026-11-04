# Habito — Built vs. Planned Feature Inventory

> **Purpose:** An uncompromisingly honest inventory separating what is **genuinely built and enforced in code/database**, what is **simulated for prototype demonstration**, and what is **not yet built**. Every claim links to its exact source file or migration in `d:\I2I Project - Habito\App Folder\habito`.

---

## Summary Matrix

| Subsystem | Status | Where It Lives | Notes for i2i Evaluators |
|---|---|---|---|
| **Property → Space Hierarchy & Partition Rooms** | **REAL (Built)** | `0001_schema.sql`, `0012_listing_fees.sql` | Supports multi-unit buildings (flats, rooms, shops, godowns, parking, land) + partition rooms (`partition_of`). |
| **Dual Storage Backend (Browser + Supabase Postgres)** | **REAL (Built)** | `src/lib/api/types.ts`, `src/lib/db.ts` | Works offline in browser storage or live with PostgreSQL + Row-Level Security (RLS). |
| **Category-Specific Match Scoring (out of 100)** | **REAL (Built)** | `src/lib/`, `/find` route | Transparent arithmetic (not AI). Different weight profiles for Living, Business, Storage, Parking, Land. |
| **Dhaka Geography & Neighbourhood Picker** | **REAL (Built)** | `TESTING.md` (Section H) | All 50 DMP thanas + neighbourhoods, Greater Dhaka, and divisional cities; matches sub-areas (e.g., "Kazipara" → Mirpur Model). |
| **Bilingual Interface & Seed Content (EN / বাংলা)** | **REAL (Partial)** | `0003_stage3.sql`, `0009_bilingual.sql` | Full UI shell, Bengali numerals (`৳১২,০০০`), and seed listing translations (`name_bn`, `description_bn`). User-entered text stays in the language written. |
| **Client-Side Photo Upload & Compression** | **REAL (Built)** | `0003_stage3.sql` | Compresses large phone photos before upload to Supabase Storage; falls back to labelled illustrations when no photo exists. |
| **Interactive Leaflet + OpenStreetMap View** | **REAL (Built)** | `0010_map.sql`, `SpaceMap.tsx` | Lazy-loaded map, price markers, grid clustering, draggable owner pin-drop, and honest labelling of `area` (approximate) vs. `pinned` coordinates. |
| **Real-Time Messaging & Inquiry Threads** | **REAL (Built)** | `0001_schema.sql`, `0002_realtime.sql` | Per-space threads, unread badges, read receipts (double-tick), Supabase Realtime with 20s polling fallback. |
| **Database Booking State Machine & Caretakers** | **REAL (Built)** | `0005_bookings.sql` | Enforces `requested → accepted → confirmed → completed`; reveals phone numbers only on acceptance; supports `property_managers` (caretakers/agents). |
| **Listing Completeness Gate (50/100 minimum)** | **REAL (Built)** | `0006_trust.sql` | Database refuses to publish listings below 50/100 completeness (`listing_completeness()`). |
| **Anti-Spam Rate Limits, Duplicates & Reporting** | **REAL (Built)** | `0006_trust.sql`, `0008_admin.sql` | 3/day cap for accounts <48h old (20/day max); cross-owner duplicate description flag; auto-hide on 3 distinct reports; append-only `moderation_actions` audit trail. |
| **Rent Ledger, Invoices, Overdue & Extensions** | **REAL (Built)** | `0007_payments.sql`, `0011_extend_rent.sql` | Auto-generates monthly `rent_invoices` on booking confirmation; derives overdue state from date; allows owner to waive or extend by 12 months. |
| **Listing Fee Gate, Free Allowance & Plans** | **REAL (Built in DB)** | `0012_listing_fees.sql` | Enforces 3 free listings/property/calendar month, per-category fees (৳100–৳500), ৳5,000/yr property plan, and labelled sponsored placement. |
| **237 Live Listings, 99 Properties, 96 Owners** | **SIMULATED (Seed Data)** | `scripts/generate-habito-data.mjs`, `src/data/seed.json` | 100% synthetic demonstration data flagged `is_seed = true` and labelled `(demo)`. Roughly a quarter intentionally omit cost breakdown to demonstrate filters. |
| **Payment Gateway Settlement (SSLCommerz)** | **SIMULATED** | `0007_payments.sql`, `PAYMENTS.md` | `payInvoice` creates a pending payment and immediately marks it settled with `simulated = true`. Labelled on rent page, dialog, and receipt (`HAB-2026-xxxxxx`). |
| **Phone OTP SMS Delivery (`phone-verified`)** | **NOT BUILT** | `0006_trust.sql`, `MODERATION.md` | Trust tier column exists (`phone-verified`), but no bulk SMS vendor is wired up (requires trade licence). |
| **NID / eKYC Identity Verification (`id-verified`)** | **NOT BUILT (Blocked)** | `0006_trust.sql`, `0008_admin.sql` | Blocked by Bangladesh Bank licensing rules for student projects. Database explicitly refuses setting `id-verified` manually. |
| **Email / Push Notification Delivery** | **NOT BUILT** | `0004_stage4.sql`, `TESTING.md` | Toggles in `/settings` persist preferences to the database, but no email/push sender is connected. |
| **Saved Searches with Alerts, Post-Booking Reviews, Maintenance UI** | **NOT BUILT (Schema Only)** | `0001_schema.sql`, `README.md` | Database tables (`reviews`, `maintenance_requests`) exist in `0001_schema.sql`, but no frontend screens are built yet. |
| **Image Perceptual Hashing for Duplicate Photos** | **NOT BUILT** | `MODERATION.md` | Duplicate detection currently checks description text across owners; image hashing is planned once real photo volume grows. |

---

## Detailed Breakdown

### 1. Real & Enforced in Code and PostgreSQL

1. **Property → Space Architecture (`0001_schema.sql`, `0012_listing_fees.sql`)**
   - Unlike flat classified boards, Habito separates the physical building (`properties`) from its rentable units (`spaces`).
   - Supports five primary categories (`living`, `business`, `storage`, `parking`, `land`) plus Dhaka-specific **partition rooms** (`partition_of`, `partition_count` between 2 and 8, `shares_bathroom`, `shares_kitchen`).
   - Category-adaptive 6-step listing flow: fields adapt to the category (e.g., parking asks for vehicle slots, never bedrooms; living asks for occupancy rules: bachelor, family, student, gender).

2. **Transparent Category-Weighted Match Scoring (`README.md`, Product Overview PDF)**
   - Deterministic arithmetic scoring out of 100 points at `/find` with per-factor explanations and "Nothing perfect yet" nearby alternatives:
     - **Living:** Budget 30 · Location 24 · Space type 18 · Availability 12 · Size/Capacity 6 · Amenities 10
     - **Business:** Budget 24 · Location 30 · Space type 16 · Availability 10 · Size/Capacity 12 · Amenities 8
     - **Storage:** Budget 26 · Location 18 · Space type 14 · Availability 10 · Size/Capacity 20 · Amenities 12
     - **Parking:** Budget 22 · Location 34 · Space type 12 · Availability 20 · Size/Capacity — · Amenities 12
     - **Land:** Budget 28 · Location 18 · Space type 16 · Availability 8 · Size/Capacity 22 · Amenities 8

3. **Trust Without Identity Verification (`0006_trust.sql`, `0008_admin.sql`, `MODERATION.md`)**
   - **Completeness Gate (`listing_completeness`):** Scores each space out of 100 (Full cost disclosed = 30, Address stated = 20, Neighbourhood stated = 10, 2+ photos = 20 [1 photo = 10], Description ≥60 chars = 10, Availability date = 10). Any space below **50/100** is rejected by a PostgreSQL trigger on publish.
   - **Honest Trust Tiers (`trust_tier`):** `unverified`, `phone-verified`, `reviewed` (admin checked a utility bill, municipal holding tax receipt, or deed first page against account name and address, then deleted the document), and `id-verified` (reserved and locked at DB level).
   - **Rate Limits (`guard_listing_rate`):** Accounts under 48 hours old can post at most 3 spaces per 24 hours; all accounts capped at 20 spaces per 24 hours.
   - **Duplicate & Report Guards:** Identical descriptions across different owners trigger `flagged_duplicate = true`. Three distinct user reports (`reports` table) automatically hide a listing (`hidden_at`).
   - **Append-Only Audit Trail (`moderation_actions`):** Every admin review action records `actor_id`, `action`, `subject_id`, and `note`. Neither users nor admins have `UPDATE` or `DELETE` permissions on this table.

4. **Booking State Machine & Privacy Guards (`0005_bookings.sql`)**
   - Enforces legal state transitions (`requested → accepted → payment-pending / confirmed → completed`, plus `rejected` / `cancelled`) inside PostgreSQL (`guard_booking_transition`).
   - **Phone Privacy:** Renter and owner phone numbers are hidden during inquiry and initial request; the database copies and reveals `renter_phone` and `owner_phone` only when the owner transitions the booking to `accepted`.
   - **Caretaker Support (`property_managers`):** Allows building owners to delegate space management and booking acceptance to a `caretaker` or `agent`.

5. **Rent Ledger, Invoices & Payment Guards (`0007_payments.sql`, `0011_extend_rent.sql`)**
   - Confirming a rental booking automatically generates monthly `rent_invoices` (capped at 24 months initially, extendable in 12-month blocks by the owner via `0011_extend_rent.sql`).
   - Database triggers prevent renters from inserting pre-settled payments and prevent owners from marking an invoice `paid` without a linked `successful` payment row (`guard_invoice_update`). Owners may explicitly `waive` a month.

---

### 2. Explicitly Simulated (And Labelled as Such in the UI)

1. **Demonstration Supply (`src/data/seed.json`, `supabase/seed.sql`)**
   - The 96 owners, 99 properties, and 237 spaces on `https://habito-live.vercel.app` are generated by `scripts/generate-habito-data.mjs`.
   - Every seed record has `is_seed = true` in PostgreSQL and is labelled `(demo)` in the interface.
   - Demo listings use illustration mode (`PHOTO_MODE = "illustration"` in `src/data/photos.ts`) so fake stock photos are never passed off as real Dhaka buildings.

2. **Payment Gateway Settlement (`PAYMENTS.md`, `0007_payments.sql`, `0012_listing_fees.sql`)**
   - Because SSLCommerz requires a server-side secret (`store_id` + `store_passwd`) and a registered business entity (trade licence + company bank account), the gateway call is simulated in `payInvoice`.
   - Every simulated transaction sets `payments.simulated = true` in the database and displays an explicit sandbox/simulation notice in three places:
     1. A banner on the Rent & Payments screen.
     2. A notice inside the payment confirmation dialog.
     3. A line printed directly on every generated receipt (`HAB-2026-xxxxxx`).

---

### 3. Planned / Not Yet Built

1. **Server-Side SSLCommerz Edge Function (`PAYMENTS.md`)**
   - Requires writing a Supabase Edge Function to initiate `/gwprocess/v4/api.php` and verify IPN callbacks via `val_id`, plus obtaining a trade licence and corporate bank account (or running strictly against SSLCommerz sandbox credentials).
2. **Bulk SMS OTP Integration (`MODERATION.md`)**
   - Needed to activate the `phone-verified` trust tier in production.
3. **Frontend Screens for Post-Booking Reviews, Maintenance Requests & Saved Search Alerts (`README.md`, `TESTING.md`)**
   - Underlying tables exist in `0001_schema.sql`, and notification preference toggles exist in `/settings`, but the UI workflows and email dispatchers are intentionally deferred until post-pilot.
4. **Formal eKYC / NID Verification (`MODERATION.md`)**
   - Requires a registered legal entity and partnership with a Bangladesh Bank-regulated eKYC provider.
