# Habito — Risk Register (IP, Data Privacy, Legal Entity, Payment Licence & Continuity)

> **Purpose:** A transparent assessment of legal, regulatory, technical, and operational risks facing Habito as an IUB i2i student incubation project in Bangladesh, alongside the concrete database and operational mitigations already implemented or planned.

---

## Executive Risk Summary

| # | Risk Category | Current Exposure | Concrete Mitigation Built / Planned | Primary Reference |
|---|---|---|---|---|
| **R-01** | **No Registered Legal Entity** | **High** (Student project; cannot sign merchant contracts or assume corporate liability) | Operate strictly as a non-custodial listing and workflow pilot during i2i incubation; register a proprietorship/private limited company only upon Gold/Platinum tier graduation. | `PAYMENTS.md` (lines 16–18), `MODERATION.md` (lines 8–10) |
| **R-02** | **Payment Licensing & Gateway Security** | **High if mismanaged / Low in current design** (No PSO/PSP licence; SPA client cannot hold merchant secrets) | All payments are explicitly simulated (`simulated = true`) and labelled in 3 UI locations; when live, Habito will charge **direct service fees for listings** (via server-side Supabase Edge Function + SSLCommerz) rather than holding third-party rent in escrow. | `PAYMENTS.md` (lines 6–79), `0007_payments.sql`, `0012_listing_fees.sql` |
| **R-03** | **Identity Verification (NID / eKYC) & Misrepresentation** | **Medium** (No access to Bangladesh Election Commission NID API; risk of fake/scam listings) | Database refuses `id-verified` (`0008_admin.sql`); uses honest named tiers (`unverified`, `phone-verified`, `reviewed`), 50/100 completeness gate, rate limits, duplicate detection, 3-report auto-hide, and append-only `moderation_actions`. | `MODERATION.md` (lines 6–91), `0006_trust.sql`, `0008_admin.sql` |
| **R-04** | **Data Privacy & Document Handling** | **Medium** (Phone numbers, rental inquiries, and ownership proof checks) | Row-Level Security (RLS) on every table (`0001_schema.sql`); phone numbers hidden until booking acceptance (`0005_bookings.sql`); utility bills/tax receipts inspected for `reviewed` tier are **deleted immediately after review** (`MODERATION.md`). | `0001_schema.sql`, `0005_bookings.sql`, `MODERATION.md` (lines 64–70) |
| **R-05** | **Intellectual Property (IP) & Third-Party Assets** | **Low** (Student team code ownership, map tiles, and demo images) | 100% original TypeScript/SQL codebase; OpenStreetMap + Leaflet used with attribution (`TESTING.md`); demo listings ship in `"illustration"` mode (`src/data/photos.ts`) to avoid unattributed scraping of third-party property photos. | `TESTING.md` (lines 342–375), `package.json` |
| **R-06** | **Project Continuity & Bus Factor** | **Medium** (Academic calendar, graduation, and single-maintainer dependencies) | Deterministic seed generators (`scripts/generate-habito-data.mjs`), 12 sequential self-documented SQL migrations (`0001`–`0012`), zero-config browser-storage fallback (`SETUP.md`), and complete internal handover docs (`TESTING.md`, `PAYMENTS.md`, `MODERATION.md`). | `SETUP.md`, `TESTING.md`, `supabase/migrations/` |

---

## Detailed Analysis & Mitigations

### 1. Intellectual Property (IP) & Licensing Risk
- **Code & Architecture Ownership:** Habito's frontend (Vite, React 18, TypeScript, Tailwind v4) and backend schema (12 PostgreSQL migrations) were written specifically for the IUB Innovation to Impact (i2i) initiative (`README.md`, lines 5–6). All dependencies in `package.json` (`react`, `lucide-react`, `leaflet`, `@supabase/supabase-js`) use permissive open-source licences (MIT / BSD-2-Clause).
- **Team & University IP Agreement (`ACTION NEEDED`):** Because the team Roster is not yet recorded in the repository (`evidence-register.md`, `E-17`), the co-founders must sign a simple 1-page Founder IP Assignment & Collaboration Agreement clarifying shared ownership and confirming compliance with IUB's i2i student IP policy.
- **Photographic & Map Assets:**
  - *Risk:* Scraping photos from Facebook to-let groups or using unlicensed Google Maps APIs violates copyright and terms of service.
  - *Mitigation Built:* Our 109-post Facebook audit stored only coded metadata and zero scraped photographs or phone numbers (*Habito — Rental Listing Audit* PDF). The app ships with `PHOTO_MODE = "illustration"` (`TESTING.md`, lines 344–351), and maps run on open-data **OpenStreetMap** tiles via Leaflet (`TESTING.md`, lines 369–374).

### 2. Data Privacy & Personal Data Protection
- **Phone Number Harvesting Risk:** On public classified sites and Facebook groups, posting a listing exposes the owner's or female renter's phone number to spam and harassment.
  - *Mitigation Built (`0005_bookings.sql`):* Phone numbers are never publicly displayed on listings or inquiries. The PostgreSQL trigger `guard_booking_transition()` copies `renter_phone` and `owner_phone` into the booking row and sets `phone_shared = true` **only when the owner explicitly accepts a booking request**.
- **Sensitive Property Document Storage Risk:** Storing scans of National IDs (NID), land deeds, or utility bills on a student-run cloud database creates severe data-breach liability under Bangladesh's Cyber Security / Data Protection norms.
  - *Mitigation Built (`MODERATION.md`, lines 64–70):* Habito **never collects NIDs**. For the `reviewed` trust tier, an owner shows one document (utility bill, municipal holding tax receipt, or first page of ownership deed). The admin checks that the name and address match, logs `owner-reviewed` in `moderation_actions`, and **immediately deletes the file**. No ownership document is retained in storage or shown to renters.
- **Database Access Control:** Every table in `0001_schema.sql` through `0012_listing_fees.sql` enforces PostgreSQL **Row-Level Security (RLS)** so users cannot read private conversations, saved spaces, bookings, or rent invoices belonging to others, even if calling the Supabase REST API directly (`TESTING.md`, lines 37–48).

### 3. Absence of a Registered Legal Entity
- **Current Constraint:** Habito is currently an unincorporated student incubation project at IUB (`PAYMENTS.md`, lines 16–17; `MODERATION.md`, lines 8–10). Without a Trade Licence, TIN/BIN, and corporate bank account, Habito cannot:
  1. Sign a live production merchant agreement with SSLCommerz or bKash.
  2. Contract with regulated bulk SMS gateways requiring trade documentation for mask/sender IDs.
  3. Enter binding commercial leases or act as a licensed real-estate broker.
- **Mitigation & Pathway:**
  - During the i2i Bronze → Silver → Gold stages, Habito operates strictly as an **information and workflow platform** where all listings fall within the free pilot allowance and payment steps are transparently simulated.
  - If selected for the **startup pathway** at the i2i Launch pitch, the first milestone is obtaining a municipal Trade Licence and opening a company bank account to unlock live SSLCommerz merchant onboarding (`PAYMENTS.md`, lines 16–18).

### 4. Payment Licensing & Financial Regulatory Risk (Bangladesh Bank)
- **Escrow / PSO Risk:** Under Bangladesh Bank's *Bangladesh Payment and Settlement Systems Regulations (BPSSR)*, holding third-party funds (collecting rent from a tenant and holding it before disbursing to a landlord) requires a Payment System Operator (PSO) or Payment Service Provider (PSP) licence, or a tri-party escrow arrangement with a licensed bank.
- **Client-Side Secret Exposure Risk:** Putting SSLCommerz `store_id` and `store_passwd` inside a Vite React frontend bundle would expose merchant credentials to anyone inspecting browser network traffic (`PAYMENTS.md`, lines 8–11).
- **Mitigation Built & Planned:**
  1. **Revenue Pivot from Rent Commission to Listing Fees (`0012_listing_fees.sql`):** Habito shifted its core monetisation from taking a cut of rent to charging **direct listing fees** (৳100–৳500 per space after 3 free listings/month, or ৳5,000/yr property plan). Charging a fee for Habito's own publishing service is a standard merchant transaction and does **not** involve holding third-party escrow funds.
  2. **Honest Simulation Today (`0007_payments.sql`):** Until a server-side Edge Function and trade licence are in place, `payInvoice` sets `simulated = true` and labels the simulation on the rent page, payment dialog, and receipt (`HAB-2026-xxxxxx`). Database triggers (`guard_invoice_update`) prevent any manual tampering with payment states.
  3. **Server-Side Architecture Contract (`PAYMENTS.md`, lines 54–78):** When transitioning to live payments, credentials will live exclusively in a **Supabase Edge Function** that initiates `/gwprocess/v4/api.php` and verifies IPN callbacks against SSLCommerz's validation API using `val_id`.

### 5. Operational & Technical Continuity Risk
- **Single-Maintainer / Academic Turnover Risk:** Student projects often stall when a developer graduates or midterms/finals arrive, or when cloud free-tier databases pause after inactivity.
- **Mitigation Built:**
  1. **Graceful Dual-Backend Degradation (`README.md`, lines 56–70; `SETUP.md`):** If Supabase credentials are absent or the cloud instance is unreachable, Habito automatically degrades to its deterministic browser-storage repository (`src/lib/db.ts`) seeded with all 237 spaces—ensuring live demos for i2i judges never fail due to Wi-Fi or cloud downtime.
  2. **Reproducible Infrastructure (`SETUP.md`):** The entire backend can be rebuilt from scratch in under 10 minutes on any new Supabase instance by running `0001_schema.sql` through `0012_listing_fees.sql` and `node scripts/generate-seed-sql.mjs`.
  3. **Self-Documenting Handover Guides:** `TESTING.md` (396 lines of step-by-step verification checklists), `PAYMENTS.md`, and `MODERATION.md` document not just *what* the code does, but *why* each constraint exists.
