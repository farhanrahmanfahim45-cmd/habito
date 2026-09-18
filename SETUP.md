# Setting Habito up

Two paths. The first needs nothing; the second gives you real accounts.

---

## 1. Run it without a database

```bash
npm install
npm run dev
```

Habito detects that Supabase isn't configured and falls back to browser storage.
Everything is browsable and the owner tools work, but there are no accounts and
nothing is shared between devices. Good for design work and for demos.

---

## 2. Connect the database

### Create the project

1. Go to supabase.com and create a project. Choose the region closest to your users
   (Singapore is the nearest to Bangladesh).
2. Save the database password somewhere safe.

### Run the migration

In the dashboard, open **SQL Editor → New query**, paste the whole of
`supabase/migrations/0001_schema.sql`, and run it.

This creates every table, the row-level security policies, and the trigger that
gives each new sign-up a profile.

### Turn on live messages

Run `supabase/migrations/0002_realtime.sql` as a third query. Without it
messages still arrive, but on a twenty-second poll rather than instantly.

### Run the stage 3 migration

`supabase/migrations/0003_stage3.sql` adds dual-role accounts, occupancy rules,
the language preference and the photo storage bucket. Run it as another query.

### Run the stage 4 migration

`supabase/migrations/0004_stage4.sql` removes the owner/renter gate, adds
notification preferences, and installs a guard that refuses to delete a space
with conversations attached — archiving is the safe path.

### Run the stage 4 migration

`supabase/migrations/0004_stage4.sql` adds the archive state and the rule that
a space carrying conversations cannot be deleted, only archived — enforced by
the database, not just the interface.

### Run the stage 5 migration

`supabase/migrations/0005_bookings.sql` adds the booking state machine, the
availability guard, phone-number reveal on acceptance, and the caretaker table.

### Run the stage 6 migration

`supabase/migrations/0006_trust.sql` adds trust tiers, the listing
completeness gate, posting rate limits, duplicate detection and the report
threshold. `MODERATION.md` explains the reasoning.

### Run the stage 7 migration

`supabase/migrations/0007_payments.sql` adds the rent ledger, receipts and the
payment guards.

### Run the stage 8 migration

`supabase/migrations/0008_admin.sql` adds the review queue, the moderation
actions and an append-only audit trail.

**Making yourself an administrator.** There is deliberately no way to do this
from the app. In the SQL editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and back in. A **Review** link appears in the header, and `/admin`
becomes reachable. Everyone else gets nothing — the database refuses the
underlying calls regardless of what the interface shows.

### Run the stage 10 migration

`supabase/migrations/0010_map.sql` adds coordinates and the location source to
properties, plus a bounding-box lookup for the map.

### Run the stage 11 migration

`supabase/migrations/0011_extend_rent.sql` lets an owner add more months to a
rent schedule that has run out.

### Load the seed listings

Open another query, paste `supabase/seed.sql`, and run it. That's 96 owners,
99 properties and 237 spaces of synthetic demo supply.

Re-running it is safe — it clears the previous seed rows first and leaves
anything real users created untouched.

To regenerate the file after changing the dataset:

```bash
node scripts/generate-habito-data.mjs   # rebuilds src/data/seed.json
node scripts/generate-seed-sql.mjs      # rebuilds supabase/seed.sql
```

### Point the app at it

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
**Project settings → API**. Restart `npm run dev`.

The account menu in the header replaces the demo role switch — that's how you
know it connected.

### Email confirmation

By default Supabase emails a confirmation link before a new account can sign in.
While testing, **Authentication → Providers → Email** lets you switch
"Confirm email" off so accounts work immediately. Turn it back on before you let
real people in.

---

## Deploying to Vercel

Add both variables under **Settings → Environment Variables**, for Preview and
Production, then redeploy. Without them the deployed app silently falls back to
browser storage, which looks like "my data isn't saving".

---

## Making yourself an admin

Roles are set by the database, and the sign-up form can only ever choose renter
or owner. To grant yourself admin, run this once in the SQL editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## Taking over the demo portfolio

The showcase property (Rahman Building and its five spaces) belongs to a seed
profile nobody can log into. To manage it from your own owner account:

```sql
update properties
set owner_id = (select id from profiles where email = 'you@example.com')
where name in ('Rahman Building', 'Rahman Annex', 'Rahman Bari');
```

---

## Security notes

- The anon key is public by design. Safety comes from row-level security, not
  from hiding it.
- The `service_role` key bypasses every policy. Never put it in this project.
- `.env` and `.env.local` are gitignored. Keep it that way.
