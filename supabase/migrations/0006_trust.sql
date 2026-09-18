-- ============================================================================
-- HABITO — stage 6: trust without identity verification
--
-- Bangladesh's NID verification service is licensed to Bangladesh Bank-
-- regulated entities. A student project cannot get it, and pretending
-- otherwise would be worse than not having it. So instead of one hard check
-- this is a set of soft ones, each cheap, each honest about what it proves:
--
--   1. Trust tiers that state what was actually checked, not a vague badge.
--   2. A completeness gate: a listing missing cost or location cannot publish.
--   3. Rate limits on new accounts, to slow bulk posting.
--   4. Duplicate detection, because scam listings are copy-pasted at scale.
--   5. Reports that hide a listing once several people flag it.
-- ============================================================================

-- ── 1. Trust tiers ──────────────────────────────────────────────────────────
-- Deliberately ordered and named for what was checked. "Verified" on its own
-- implies more than we can deliver.

do $$ begin
  create type trust_tier as enum (
    'unverified',      -- signed up, nothing checked
    'phone-verified',  -- OTP confirmed; proves a working number, not an identity
    'reviewed',        -- a person looked at the listing and the ownership claim
    'id-verified'      -- reserved: real eKYC, once a legal entity exists
  );
exception when duplicate_object then null;
end $$;

alter table profiles
  add column if not exists trust trust_tier not null default 'unverified',
  add column if not exists phone_verified_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

comment on column profiles.trust is
  'What has actually been checked about this account. Never implies NID verification, which is unavailable to us.';

-- Seed owners are demo data and should not appear to have been checked.
update profiles set trust = 'unverified' where is_seed;

-- ── 2. Completeness gating ──────────────────────────────────────────────────
-- The low-effort spam pattern is a vague area, no cost breakdown and one
-- blurry photo. Requiring the opposite blocks it structurally, without
-- needing to judge anyone's identity.

create or replace function listing_completeness(target uuid)
returns integer language sql stable as $$
  select
      -- Cost is fully disclosed
      (case when s.service_charge is not null and s.utilities is not null then 30 else 0 end)
      -- Located to something more precise than an area
    + (case when coalesce(nullif(trim(p.address), ''), null) is not null then 20 else 0 end)
    + (case when coalesce(nullif(trim(p.neighborhood), ''), null) is not null then 10 else 0 end)
      -- Has photographs
    + (case when jsonb_array_length(s.images) >= 2 then 20
            when jsonb_array_length(s.images) = 1 then 10 else 0 end)
      -- Says something about itself
    + (case when length(coalesce(s.description, '')) >= 60 then 10 else 0 end)
      -- Says when it is free
    + (case when s.available_from is not null then 10 else 0 end)
  from spaces s join properties p on p.id = s.property_id
  where s.id = target;
$$;

comment on function listing_completeness is
  'Score out of 100. Below 50 a listing cannot be published — that threshold blocks the low-effort spam pattern without judging identity.';

alter table spaces
  add column if not exists completeness integer not null default 0,
  add column if not exists flagged_duplicate boolean not null default false,
  add column if not exists hidden_at timestamptz,
  add column if not exists hidden_reason text;

-- ── 3. Rate limits on new accounts ──────────────────────────────────────────
-- A genuine first-time owner posts one or two spaces. A spam farm posts
-- twenty. Three in the first 48 hours leaves the real owner unblocked — a
-- limit of one would catch the landlord with a building full of flats, which
-- is exactly the user Habito is for.

create or replace function guard_listing_rate()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  account_age interval;
  recent integer;
  owner uuid;
begin
  select p.owner_id into owner from properties p where p.id = new.property_id;
  if owner is null then return new; end if;

  select now() - created_at into account_age from profiles where id = owner;

  select count(*) into recent
  from spaces s join properties p on p.id = s.property_id
  where p.owner_id = owner and s.created_at > now() - interval '24 hours';

  if account_age < interval '48 hours' and recent >= 3 then
    raise exception 'New accounts can list up to 3 spaces a day. This limit lifts after your first couple of days.'
      using errcode = 'check_violation';
  end if;

  -- A settled account still should not be able to post a hundred overnight.
  if recent >= 20 then
    raise exception 'That is a lot of listings in one day. Get in touch and we will lift the limit.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists spaces_rate_limit on spaces;
create trigger spaces_rate_limit
  before insert on spaces
  for each row when (new.is_seed is not true)
  execute function guard_listing_rate();

-- ── 4. Completeness enforced on publish ─────────────────────────────────────

create or replace function guard_listing_quality()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  score integer;
begin
  if new.is_seed then return new; end if;

  score := listing_completeness(new.id);
  new.completeness := coalesce(score, 0);

  -- Only when a listing is being *put* live. Firing on every update would
  -- block ordinary changes to an existing listing — including the availability
  -- change a confirmed booking makes, which would break booking entirely.
  if new.status = 'published' and old.status <> 'published' and new.completeness < 50 then
    raise exception 'This listing needs more detail before it can go live: add the full cost, a precise location and at least one photo.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists spaces_quality on spaces;
create trigger spaces_quality
  before update on spaces
  for each row execute function guard_listing_quality();

-- ── 5. Duplicate detection ──────────────────────────────────────────────────
-- Scam and spam listings are copy-pasted. Identical descriptions across
-- different owners are the cheapest signal available.

create or replace function flag_duplicate_listing()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  twins integer;
begin
  if new.description is null or length(new.description) < 40 or new.is_seed then
    return new;
  end if;

  select count(*) into twins
  from spaces s join properties p on p.id = s.property_id
  where s.id <> new.id
    and md5(lower(trim(s.description))) = md5(lower(trim(new.description)))
    and p.owner_id <> (select owner_id from properties where id = new.property_id);

  if twins > 0 then
    new.flagged_duplicate := true;
  end if;

  return new;
end;
$$;

drop trigger if exists spaces_duplicate on spaces;
create trigger spaces_duplicate
  before insert or update of description on spaces
  for each row execute function flag_duplicate_listing();

-- ── 6. Reports hide a listing ───────────────────────────────────────────────
-- Three separate people is enough to take something down pending review. One
-- angry person is not.

create or replace function hide_on_reports()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  reporters integer;
begin
  if new.space_id is null then return new; end if;

  -- Distinct people, so one person filing three reports achieves nothing.
  select count(distinct reporter_id) into reporters
  from reports where space_id = new.space_id;

  if reporters >= 3 then
    update spaces
       set hidden_at = now(),
           hidden_reason = 'Hidden automatically after several reports, pending review.'
     where id = new.space_id and hidden_at is null;
  end if;

  return new;
end;
$$;

drop trigger if exists reports_hide on reports;
create trigger reports_hide
  after insert on reports
  for each row execute function hide_on_reports();

-- Hidden listings leave public view but stay visible to their owner.
drop policy if exists spaces_public_read on spaces;
create policy spaces_public_read on spaces for select
  using (
    (status = 'published' and hidden_at is null)
    or can_manage_space(id)
    or is_admin()
  );

create index if not exists spaces_hidden_idx on spaces (hidden_at) where hidden_at is not null;
