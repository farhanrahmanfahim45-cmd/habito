# Habito — 30-Day Field Pilot Plan (Bashundhara R/A & Badda)

> **Purpose:** Replace synthetic demonstration data (`is_seed = true`) in one bounded geographic corridor with real building owners, caretakers, and student/bachelor renters to generate verifiable transaction and willingness-to-pay evidence for the i2i panel.  
> **Status:** Planned field validation (all target numbers below are **explicit pilot targets/hypotheses**, not past results).

---

## 1. Pilot Scope & Why This Area

- **Geographic Boundary:** **Bashundhara Residential Area (Blocks A–I) and adjacent Badda (Middle/North Badda)**, Dhaka.
- **Evidence Basis for Selection:**
  1. In our primary audit of 109 Dhaka Facebook to-let posts (4 Aug – 19 Sep 2026), **Bashundhara R/A (23.9%)** and **Badda (16.5%)** were the #1 and #2 highest-volume rental areas in the sample (combined **40.4%** of all audited posts).
  2. Independent University, Bangladesh (IUB) is located directly inside Bashundhara R/A, giving the founding team immediate, zero-transit access to both the demand side (IUB students and young staff) and the supply side (local building caretakers and house owners within walking distance).

---

## 2. Named First-User Segments

| Side | Specific First User | Why They Need Habito Now | Pilot Recruitment Target (30 Days) |
|---|---|---|---|
| **Supply (Owners & Caretakers)** | **On-site building caretakers (`property_managers`) and resident landlords** in Bashundhara R/A & Badda managing buildings with 2+ rentable space types (e.g., residential flats/single rooms/partition rooms upstairs + garage parking slots or ground-floor shutter shops). | Caretakers currently field repetitive phone calls asking for rent, service charge, and whether bachelors/students are allowed. Habito's **3 free listings per property per month** (`0012_listing_fees.sql`) lets them list their current vacancies at zero upfront cost. | **20 real properties** onboarded (`is_seed = false`), yielding **35–50 real spaces** across Living (flats, single rooms, partitions), Parking, and Business. |
| **Demand (Seekers)** | **IUB undergraduate/graduate students and early-career bachelors** looking for single rooms, shared seats/partitions, or shared flats in Bashundhara R/A and Badda for the upcoming semester cycle. | Students face high rejection rates on phone calls ("no bachelors") and surprise service/utility charges. Habito's occupancy filter (`0003_stage3.sql`) and mandatory full-cost breakdown (`0006_trust.sql`) filter out incompatible spaces upfront. | **100 signed-up student/bachelor seekers** completing `/find` requirement intake and initiating inquiries or booking requests on non-seed listings. |

---

## 3. Pilot Operations & Step-by-Step Protocol

### Week 1: Preparation & Seed Isolation
1. **Isolate or Clearly Toggle Demo Listings:** Ensure pilot testers filtering for Bashundhara R/A and Badda can distinguish real owner listings (`is_seed = false`, `trust = 'reviewed'`) from synthetic `(demo)` listings (`is_seed = true`), or provide a "Real Pilot Listings Only" filter toggle.
2. **Prepare Field Kit:** Print bilingual (English / বাংলা) 1-page caretaker onboarding sheets and Informed Consent forms (see Section 6).

### Weeks 2–3: Supply Onboarding (Door-to-Door in Bashundhara R/A & Badda)
1. **Field Walk:** Team members walk Blocks A–F in Bashundhara R/A and adjoining Badda lanes, identifying buildings with physical "To-Let" / "বাসা ভাড়া" / "দোকান ভাড়া" / "গ্যারেজ ভাড়া" signboards.
2. **Guided Onboarding:** Sit with the building owner or authorised caretaker for 10 minutes to create an account on `https://habito-live.vercel.app`, register the `Property`, and list 1–3 available `Spaces` using phone photos compressed in-browser (`0003_stage3.sql`).
3. **Manual Trust Review (`reviewed` tier):** Following the exact protocol in `MODERATION.md` (lines 64–70), inspect one proof of ownership/management (utility bill, holding tax receipt, or deed cover page matching the address), log the review in `/admin` (`0008_admin.sql`), and **never store or retain a copy of the document**.

### Weeks 3–4: Demand Activation & Inquiry Tracking
1. **Campus Seeker Drive:** Share direct links to the verified Bashundhara/Badda listings in IUB student housing groups and campus noticeboards.
2. **Observation & Follow-Up:** Track real-time inquiries (`conversations`), booking requests (`bookings`), and phone-reveal events (`phone_shared = true` upon owner acceptance). Conduct 10-minute exit calls with both sides after an inquiry or visit.

---

## 4. Pilot Metrics & Success Thresholds

Every metric below is captured automatically in Supabase PostgreSQL or in the structured pilot interview sheet:

| Metric | How It Is Measured (Exact Table / Source) | 30-Day Pilot Target (Hypothesis) |
|---|---|---|
| **1. Real Supply Onboarded** | `SELECT count(*) FROM spaces WHERE is_seed = false AND status = 'published';` | ≥ 35 real spaces across ≥ 20 properties |
| **2. Completeness Gate Pass Rate** | `SELECT avg(completeness) FROM spaces WHERE is_seed = false;` (`0006_trust.sql`) | 100% ≥ 50/100 (enforced by DB trigger); target average ≥ 75/100 |
| **3. Reviewed Owner Ratio** | `SELECT count(*) FROM profiles WHERE is_seed = false AND trust = 'reviewed';` (`0008_admin.sql`) | ≥ 70% of onboarded pilot owners/caretakers |
| **4. Multi-Unit Adoption** | Percentage of pilot `properties` listing ≥ 2 distinct `spaces` (e.g., flat + garage or multiple rooms) | ≥ 40% of onboarded properties |
| **5. Seeker Inquiry & Booking Funnel** | Count of non-seed `inquiries`, `conversations`, and `bookings` transitioning `requested → accepted` (`0005_bookings.sql`) | ≥ 50 real inquiries; ≥ 15 accepted booking requests (`phone_shared = true`) |
| **6. Wasted-Call Reduction (Qualitative + Survey)** | Post-inquiry seeker pulse question: *"Did the listing already answer rent, service charge, and bachelor eligibility before you contacted the owner?"* | ≥ 80% "Yes" |
| **7. Willingness-to-Pay (WTP) Validation** | Structured pricing interview with all 20 owners/caretakers testing the `0012_listing_fees.sql` schedule (৳100–৳500/space after 3 free/month, or ৳5,000/yr plan) | Document exact price sensitivity curve and % willing to pay ৳200 for a 4th residential listing or commercial shop |

---

## 5. Data Collection Methods

1. **Automated Database Telemetry (Zero Manual Entry Bias):**
   - SQL read-only queries against `properties`, `spaces`, `inquiries`, `conversations`, `bookings`, and `moderation_actions` filtering `WHERE is_seed = false`.
2. **Caretaker / Owner Field Log (`docs/i2i/data/pilot-owner-log.csv`):**
   - Records date, thana/block, role (owner vs. caretaker), number of spaces in building, time taken to complete the 6-step listing flow, friction points in Bangla/English UI, and verbatim responses to the listing-fee WTP questions.
3. **Seeker Post-Task Feedback (`docs/i2i/data/pilot-seeker-log.csv`):**
   - Captures whether the Match Score breakdown (`/find`) and full-cost filter accurately reflected the space when they spoke to or visited the owner.

---

## 6. Informed Consent, Privacy & Ethics Protocol

Because Habito operates in a student incubation environment without a formal corporate entity or Bangladesh Bank eKYC licence, strict ethical guardrails apply throughout the pilot:

1. **Voluntary Informed Consent (Bangla & English):**
   - Every participating owner, caretaker, and student seeker reads and signs/acknowledges a plain-language Bangla/English consent statement explaining that Habito is an **IUB i2i student incubation prototype**, participation is voluntary, and they can archive or delete their listing or account at any time.
2. **Zero Retention of Ownership Documents (`MODERATION.md` Rule):**
   - When verifying a property for the `reviewed` tier, the reviewer visually checks that the name and address on the utility bill or holding tax receipt match the account and listing, records `reviewed` in `/admin`, and **immediately deletes any uploaded file** (`MODERATION.md`, lines 64–70). No NID numbers, deed scans, or tax receipts are ever stored in Supabase Storage or shown to renters.
3. **Phone Number Protection (`0005_bookings.sql` Rule):**
   - Unlike Facebook to-let posts where phone numbers are scraped publicly, pilot owners' and seekers' phone numbers remain hidden in the database and are revealed **only** inside a specific booking record after the owner explicitly clicks **Accept** (`phone_shared = true`).
4. **Honest Labelling of Simulated Payments & Demo Data:**
   - No real money will be collected through the app during the 30-day pilot. All pilot listings fall within the **3 free listings per property per month** allowance (`0012_listing_fees.sql`) or have fees waived during testing, and the Rent Ledger explicitly labels all receipts as simulated (`simulated = true`).
5. **Caretaker Authority Check:**
   - If a caretaker (`property_managers`) lists a space on behalf of a building owner, the field team requires verbal phone confirmation from the landlord before setting the `reviewed` trust tier, preventing unauthorized sub-letting or intermediary fee scams.
