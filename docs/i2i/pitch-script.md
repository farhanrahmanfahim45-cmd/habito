# Habito — 3-Minute i2i Pitch Script

> **Total Time:** 3:00 (approx. 420–450 spoken words at a clear, measured pace of 145 wpm)  
> **Timing Structure:**  
> - `0:00 – 0:20` (20s): Team & One-Line Hook  
> - `0:20 – 0:50` (30s): Specific User & Audited Problem  
> - `0:50 – 1:25` (35s): What Exists Today (Live Product & Architecture)  
> - `1:25 – 2:05` (40s): Primary Evidence & Honest Boundaries  
> - `2:05 – 3:00` (55s): Key Risks, 30-Day Pilot & The Ask  

---

## `[0:00 – 0:20]` 1. Team & Introduction (20 seconds)

**[SLIDE 1: Habito Title + Live URL `habito-live.vercel.app` + Team Names]**

> *(Note: Replace bracketed placeholders with exact team names/roles before speaking — see Evidence Register `E-17`.)*

"Good afternoon, panel. We are **[Team Member Names & Roles — e.g., Lead Developer / Product & Field Research]**, undergraduate students at **Independent University, Bangladesh (IUB)**, advised by **[Faculty Advisor Name, Department]**.

We built **Habito**—a bilingual space-rental marketplace for Bangladesh that asks property owners not *'what building do you own?'*, but *'what spaces do you have available?'*—from flats and partition rooms to ground-floor shops, godowns, and garage slots."

---

## `[0:20 – 0:50]` 2. Specific First User & The Problem (30 seconds)

**[SLIDE 2: The Dhaka To-Let Audit (109 Posts across 62 Facebook Groups, Aug–Sep 2026)]**

"Our first users are **student and bachelor renters** and **multi-unit building owners and caretakers** right here in **Bashundhara R/A and Badda**.

Today, they rely on Facebook to-let groups. Between August and September 2026, we audited **109 unique rental posts across 62 Dhaka Facebook to-let groups**. Here is what we found:
- **23.9%** did not state a rent amount at all—forcing 'inbox for price'.
- **24.8%** gave no move-in or availability date.
- **8.3%** gave no location detail beyond an area name, and **8.3%** omitted whether bachelors or students were even allowed.

For a student or bachelor, that means hours of wasted calls and rejected visits. For a building owner managing flats upstairs, a shop downstairs, and two garage slots, no single platform lets them manage all of those spaces under one roof."

---

## `[0:50 – 1:25]` 3. What Exists Today (35 seconds)

**[SLIDE 3: Live App Architecture — Property → Space Hierarchy, 50/100 Gate & Category Match Score]**

"Habito is not a mockup. It is live today at **habito-live.vercel.app**, built across 12 stages on React, TypeScript, and **Supabase PostgreSQL with Row-Level Security**.

Every feature maps directly to a gap in our audit:
1. **Property-to-Space Portfolio:** One owner or caretaker manages flats, partition rooms, shops, godowns, and parking under a single building.
2. **Database Completeness Gate:** Our PostgreSQL trigger scores every listing out of 100—30 points for full cost breakdown, 30 for address and neighbourhood, 20 for photos, 10 for description, and 10 for availability date. Below **50 out of 100**, the database refuses to publish it.
3. **Transparent Category Match Scoring:** Arithmetic weights—not black-box AI—score budget, location, capacity, and occupancy rules differently for a living space versus a shop, godown, or parking slot.
4. **Booking State Machine & Rent Ledger:** Phone numbers stay hidden until an owner accepts a booking request, and confirmed bookings generate monthly rent invoices and receipts in English and natural বাংলা."

---

## `[1:25 – 2:05]` 4. Evidence & Uncompromising Honesty (40 seconds)

**[SLIDE 4: Validation (65 Testers / 34 Task Completers) + What Is Real vs. Simulated]**

"Here is our evidence—and what is still simulated:
- **Primary Market Audit:** 109 coded Facebook to-let posts across 62 groups, with **40.4%** concentrated in Bashundhara R/A and Badda.
- **Usability Testing:** **65 people** tested Habito through our bilingual usability survey, and **34 of them completed an actual end-to-end renter or owner task** inside the app.
- **What is Simulated:** We want to be 100% transparent with the panel. First, the **237 spaces across 99 properties** currently on the live site are synthetic demonstration data, explicitly flagged `is_seed = true` and labelled `(demo)`. Second, our rent and listing-fee payment settlement is **simulated in-app** because live SSLCommerz integration requires a trade licence and corporate bank account. Third, because Bangladesh Bank restricts NID eKYC to licensed entities, we never show a fake 'ID Verified' badge—instead, our database enforces honest trust tiers (`unverified`, `phone-verified`, and `reviewed` via an append-only admin audit trail)."

---

## `[2:05 – 3:00]` 5. Risks, 30-Day Pilot & The Ask (55 seconds)

**[SLIDE 5: Revenue Model Assumption, Key Risks & 30-Day Bashundhara/Badda Pilot Ask]**

"Our revenue model is built into the database: **3 free listings per property per month** so small landlords join for free, followed by category fees of **৳100 to ৳500 per space** or a **৳5,000 yearly property plan**. Right now, those price points are **assumptions** that we must validate in the field.

Our three main risks are:
1. **Cold-start supply:** Moving from synthetic seed data to real landlords.
2. **No legal entity yet:** Blocking live SSLCommerz merchant settlement and bulk SMS OTP.
3. **Caretaker gatekeeping:** Ensuring on-site caretakers have landlord permission.

**Our Ask from the i2i Panel:**
We are launching a focused **30-day field pilot in Bashundhara R/A and Badda** to onboard **20 real multi-unit buildings (35 to 50 real spaces)** and **100 IUB student and bachelor seekers**. We ask for:
1. **Mentorship from i2i marketplace and telecom leaders** on structuring our caretaker onboarding and SMS OTP flow.
2. **Guidance on trade-licence formation** so we can connect our existing PostgreSQL payment ledger to a live SSLCommerz Edge Function via a Supabase server endpoint.

Thank you—we welcome your questions and have the live database and audit data ready."
