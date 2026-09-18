-- ============================================================================
-- HABITO — stage 12: paying to list
--
-- The revenue model moves from rent to listings, which also happens to be the
-- better anti-spam measure: a fee per post costs a spammer more than it costs
-- a genuine owner with one room to let.
--
--   1. A listing fee. A space stays in draft until it is paid for.
--   2. A free allowance of 3 listings per property per month, then a plan.
--   3. Sponsored placement for developers, labelled as paid.
--   4. Partition rooms, which are a real and unlisted segment here.
-- ============================================================================

-- ── 1. Partition rooms ──────────────────────────────────────────────────────
-- A room divided by a partition and let separately — common in Dhaka for
-- bachelors and students, and absent from every property site because it does
-- not fit a "bedrooms" model.

-- space_type is a text column rather than an enum, so a new kind needs no
-- type change — only the application's own list of types.

alter table spaces
  add column if not exists partition_of uuid references spaces (id) on delete set null,
  add column if not exists partition_count integer check (partition_count between 2 and 8),
  add column if not exists shares_bathroom boolean,
  add column if not exists shares_kitchen boolean;

comment on column spaces.partition_of is
  'The room this partition was divided from, where the owner listed that too. Null when the partition is listed on its own.';

-- ── 2. Listing fees ─────────────────────────────────────────────────────────
-- Priced per category rather than flat: a garage slot and a commercial floor
-- are not worth the same to list, and a flat fee that a garage owner finds
-- steep is a fee a developer finds trivial.

create table if not exists listing_prices (
  category   space_category primary key,
  amount     integer not null check (amount >= 0),
  updated_at timestamptz not null default now()
);

insert into listing_prices (category, amount) values
  ('living',   200),
  ('business', 500),
  ('storage',  400),
  ('parking',  100),
  ('land',     500)
on conflict (category) do nothing;

alter table spaces
  add column if not exists listing_fee_paid boolean not null default false,
  add column if not exists listing_payment_id uuid references payments (id),
  add column if not exists published_at timestamptz;

-- Seed listings are demonstration data and were never paid for; marking them
-- otherwise would put a false record in the payments table.
update spaces set listing_fee_paid = true where is_seed;

/** What it costs to publish this space, before any allowance is applied. */
create or replace function listing_fee_for(target uuid)
returns integer language sql stable as $$
  select coalesce(lp.amount, 200)
  from spaces s
  left join listing_prices lp on lp.category = s.category
  where s.id = target;
$$;

-- ── 3. The free allowance, and plans ────────────────────────────────────────
-- Three listings per property per calendar month are free. That is deliberate:
-- a building with flats, a shop and a garage is exactly the owner Habito is
-- for, and they should be able to get going without paying. Beyond that the
-- owner buys a yearly plan for that property.

create table if not exists property_plans (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  owner_id    uuid not null references profiles (id) on delete cascade,
  starts_on   date not null default current_date,
  ends_on     date not null,
  amount      integer not null check (amount >= 0),
  payment_id  uuid references payments (id),
  created_at  timestamptz not null default now()
);

create index if not exists property_plans_active_idx on property_plans (property_id, ends_on);

alter table property_plans enable row level security;

drop policy if exists plans_owner_read on property_plans;
create policy plans_owner_read on property_plans for select
  using (owner_id = auth.uid() or is_admin());

create or replace function property_has_plan(target uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from property_plans
    where property_id = target and current_date between starts_on and ends_on
  );
$$;

/** Listings published from this property in the current calendar month. */
create or replace function listings_this_month(target uuid)
returns integer language sql stable as $$
  select count(*)::integer
  from spaces
  where property_id = target
    and is_seed is not true
    and published_at >= date_trunc('month', current_date);
$$;

/**
 * Whether this space can be published right now, and why not if it cannot.
 * Returned as text so the interface can say something useful rather than
 * "permission denied".
 */
create or replace function publish_blocker(target uuid)
returns text language plpgsql stable as $$
declare
  s record;
begin
  select sp.*, p.id as prop_id into s
  from spaces sp join properties p on p.id = sp.property_id
  where sp.id = target;

  if s is null then return 'missing'; end if;
  if s.is_seed then return null; end if;

  if coalesce(listing_completeness(target), 0) < 50 then return 'incomplete'; end if;
  if not s.listing_fee_paid then return 'fee-unpaid'; end if;

  if listings_this_month(s.prop_id) >= 3 and not property_has_plan(s.prop_id) then
    return 'allowance-used';
  end if;

  return null;
end;
$$;

-- ── 4. Enforced on publish ──────────────────────────────────────────────────

create or replace function guard_publish()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  blocker text;
begin
  if new.status <> 'published' or old.status = 'published' or new.is_seed then
    return new;
  end if;

  blocker := publish_blocker(new.id);

  if blocker = 'fee-unpaid' then
    raise exception 'This listing has not been paid for yet.' using errcode = 'check_violation';
  elsif blocker = 'allowance-used' then
    raise exception 'This property has used its 3 free listings this month. A yearly plan covers the rest.'
      using errcode = 'check_violation';
  elsif blocker = 'incomplete' then
    raise exception 'This listing needs more detail before it can go live.'
      using errcode = 'check_violation';
  end if;

  new.published_at := now();
  return new;
end;
$$;

drop trigger if exists spaces_guard_publish on spaces;
create trigger spaces_guard_publish
  before update on spaces
  for each row execute function guard_publish();

-- A successful listing payment marks the space paid for.
create or replace function settle_listing_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'successful' and old.status <> 'successful' and new.kind = 'listing' then
    update spaces set listing_fee_paid = true, listing_payment_id = new.id
     where id = new.space_id;
  end if;

  if new.status = 'successful' and old.status <> 'successful' and new.kind = 'plan' then
    update property_plans set payment_id = new.id where id = new.plan_id;
  end if;

  return new;
end;
$$;

alter table payments
  add column if not exists space_id uuid references spaces (id) on delete set null,
  add column if not exists plan_id uuid references property_plans (id) on delete set null;

alter table payments drop constraint if exists payments_kind_check;
alter table payments add constraint payments_kind_check
  check (kind in ('rent', 'deposit', 'advance', 'fee', 'listing', 'plan', 'sponsorship'));

-- A listing or plan payment has no booking, so that column has to allow null.
alter table payments alter column booking_id drop not null;

drop trigger if exists payments_settle_listing on payments;
create trigger payments_settle_listing
  after update on payments
  for each row execute function settle_listing_payment();

-- ── 5. Sponsored placement ──────────────────────────────────────────────────
-- Developers and agencies paying for position in search. Labelled as paid
-- wherever it appears: an advertisement that looks like a result is the thing
-- that makes a listing site untrustworthy, and Habito's whole argument is
-- that it is more honest than what people use today.

alter table profiles
  add column if not exists account_kind text not null default 'individual'
    check (account_kind in ('individual', 'agency', 'developer')),
  add column if not exists organisation text;

alter table spaces
  add column if not exists sponsored_until date,
  add column if not exists sponsor_name text;

comment on column spaces.sponsored_until is
  'Paid placement. Anything with this set must be labelled as sponsored wherever it is shown.';

create index if not exists spaces_sponsored_idx on spaces (sponsored_until)
  where sponsored_until is not null;

/** Sponsored listings for a search, capped so results stay usable. */
create or replace function sponsored_spaces(in_area text default null, limit_to integer default 2)
returns setof spaces language sql stable as $$
  select s.*
  from spaces s
  join properties p on p.id = s.property_id
  where s.status = 'published'
    and s.hidden_at is null
    and s.sponsored_until >= current_date
    and (in_area is null or p.area = in_area)
  order by random()
  limit limit_to;
$$;
