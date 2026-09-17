-- ============================================================================
-- HABITO — schema v1
--
-- Covers every entity the product will need through the booking and payment
-- stages, so later work adds behaviour rather than migrating tables again.
-- Row-level security is on for every table: authorisation lives in the
-- database, not in the frontend.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────

create type user_role as enum ('renter', 'owner', 'admin');
create type verification_state as enum ('unverified', 'pending', 'verified');

create type space_category as enum ('living', 'business', 'storage', 'parking', 'land');
create type transaction_type as enum ('rent', 'sale');
create type geography_kind as enum ('urban', 'suburban', 'rural');
create type availability_status as enum (
  'available', 'partially-available', 'available-soon', 'occupied', 'maintenance'
);
create type listing_status as enum ('draft', 'published', 'archived');

create type booking_status as enum (
  'requested', 'accepted', 'payment-pending', 'confirmed', 'completed',
  'rejected', 'cancelled', 'payment-failed'
);
create type payment_status as enum ('pending', 'successful', 'failed', 'cancelled', 'refunded');
create type maintenance_status as enum ('new', 'in-progress', 'resolved');
create type report_status as enum ('open', 'reviewing', 'actioned', 'dismissed');

-- ── Profiles ────────────────────────────────────────────────────────────────
-- Deliberately no foreign key to auth.users: seed listings need owner profiles
-- that nobody logs into. A trigger links real sign-ups by sharing the id.

create table profiles (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text,
  phone               text,
  avatar_url          text,
  avatar_tone         text not null default 'aqua',
  role                user_role not null default 'renter',
  verification        verification_state not null default 'unverified',
  bio                 text,
  preferred_areas     text[] not null default '{}',
  budget_min          integer,
  budget_max          integer,
  response_rate       integer not null default 100 check (response_rate between 0 and 100),
  response_time_hours integer not null default 24,
  is_seed             boolean not null default false,
  suspended           boolean not null default false,
  created_at          timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- ── Properties ──────────────────────────────────────────────────────────────

create table properties (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references profiles (id) on delete cascade,
  name          text not null check (length(trim(name)) > 1),
  description   text,
  area          text not null,
  neighborhood  text not null,
  address       text not null,
  district      text not null,
  geography     geography_kind not null default 'urban',
  latitude      double precision,
  longitude     double precision,
  nearby        jsonb not null default '[]'::jsonb,
  cover_image   text,
  verification  verification_state not null default 'unverified',
  is_seed       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index properties_owner_idx on properties (owner_id);
create index properties_area_idx on properties (area);

-- ── Spaces ──────────────────────────────────────────────────────────────────
-- The rentable unit. A property holds many; each is priced and managed alone.

create table spaces (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid not null references properties (id) on delete cascade,
  name             text not null check (length(trim(name)) > 0),
  category         space_category not null,
  space_type       text not null,
  transaction      transaction_type not null default 'rent',
  status           listing_status not null default 'published',

  price            integer not null check (price >= 0),
  service_charge   integer check (service_charge >= 0),
  utilities        integer check (utilities >= 0),
  security_deposit integer check (security_deposit >= 0),
  advance_months   integer check (advance_months between 0 and 12),

  attributes       jsonb not null default '{}'::jsonb,
  amenities        text[] not null default '{}',

  availability     availability_status not null default 'available',
  available_from   date not null default current_date,
  availability_note text,
  total_units      integer,
  available_units  integer,

  images           jsonb not null default '[]'::jsonb,
  video_url        text,
  description      text,

  verification     verification_state not null default 'unverified',
  views            integer not null default 0,
  is_seed          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index spaces_property_idx on spaces (property_id);
create index spaces_category_idx on spaces (category);
create index spaces_status_idx on spaces (status, availability);
create index spaces_price_idx on spaces (price);

-- Total monthly cost, computed rather than stored, and null unless every
-- component is disclosed — a listing that hides its charges must not look cheap.
create or replace function space_estimated_monthly(s spaces)
returns integer language sql immutable as $$
  select case
    when s.transaction = 'rent' and s.service_charge is not null and s.utilities is not null
      then s.price + s.service_charge + s.utilities
    else null
  end;
$$;

-- ── Favorites ───────────────────────────────────────────────────────────────

create table favorites (
  user_id    uuid not null references profiles (id) on delete cascade,
  space_id   uuid not null references spaces (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, space_id)
);

-- ── Conversations & messages ────────────────────────────────────────────────

create table conversations (
  id               uuid primary key default gen_random_uuid(),
  space_id         uuid references spaces (id) on delete set null,
  renter_id        uuid not null references profiles (id) on delete cascade,
  owner_id         uuid not null references profiles (id) on delete cascade,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  unique (space_id, renter_id, owner_id)
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id       uuid not null references profiles (id) on delete cascade,
  body            text not null check (length(trim(body)) > 0),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on messages (conversation_id, created_at);

-- ── Bookings ────────────────────────────────────────────────────────────────

create table bookings (
  id             uuid primary key default gen_random_uuid(),
  space_id       uuid not null references spaces (id) on delete cascade,
  renter_id      uuid not null references profiles (id) on delete cascade,
  owner_id       uuid not null references profiles (id) on delete cascade,
  status         booking_status not null default 'requested',
  move_in_date   date not null,
  months         integer not null default 1 check (months > 0),
  amount         integer not null check (amount >= 0),
  message        text,
  budget_min     integer,
  budget_max     integer,
  decided_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index bookings_space_idx on bookings (space_id);
create index bookings_renter_idx on bookings (renter_id);
create index bookings_owner_idx on bookings (owner_id);

-- One live claim per person per space: stops duplicate requests and the
-- obvious double-booking case.
create unique index bookings_one_live_per_renter
  on bookings (space_id, renter_id)
  where status in ('requested', 'accepted', 'payment-pending', 'confirmed');

-- ── Payments ────────────────────────────────────────────────────────────────

create table payments (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null references bookings (id) on delete cascade,
  user_id        uuid not null references profiles (id) on delete cascade,
  amount         integer not null check (amount > 0),
  currency       text not null default 'BDT',
  gateway        text not null default 'sandbox',
  reference      text unique,
  status         payment_status not null default 'pending',
  gateway_payload jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index payments_booking_idx on payments (booking_id);

-- ── Reviews ─────────────────────────────────────────────────────────────────

create table reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null unique references bookings (id) on delete cascade,
  reviewer_id uuid not null references profiles (id) on delete cascade,
  space_id    uuid not null references spaces (id) on delete cascade,
  owner_id    uuid not null references profiles (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

create index reviews_space_idx on reviews (space_id);

-- ── Maintenance ─────────────────────────────────────────────────────────────

create table maintenance_requests (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid references bookings (id) on delete set null,
  space_id    uuid not null references spaces (id) on delete cascade,
  renter_id   uuid not null references profiles (id) on delete cascade,
  owner_id    uuid not null references profiles (id) on delete cascade,
  kind        text not null,
  detail      text not null,
  status      maintenance_status not null default 'new',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Space requests (demand side) ────────────────────────────────────────────

create table space_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  category    text not null default 'any',
  space_type  text not null default 'any',
  transaction transaction_type not null default 'rent',
  area        text not null,
  budget_min  integer not null,
  budget_max  integer not null,
  needed_by   date not null,
  note        text,
  open        boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Notifications ───────────────────────────────────────────────────────────

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text,
  entity_type text,
  entity_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on notifications (user_id, created_at desc);

-- ── Reports ─────────────────────────────────────────────────────────────────

create table reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references profiles (id) on delete set null,
  space_id     uuid references spaces (id) on delete cascade,
  reported_user uuid references profiles (id) on delete cascade,
  reason       text not null,
  detail       text,
  status       report_status not null default 'open',
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- Helpers
-- ============================================================================

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function owns_space(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from spaces s
    join properties p on p.id = s.property_id
    where s.id = target and p.owner_id = auth.uid()
  );
$$;

-- Keeps updated_at honest so "last updated" on a listing means something.
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_touch before update on properties
  for each row execute function touch_updated_at();
create trigger spaces_touch before update on spaces
  for each row execute function touch_updated_at();
create trigger bookings_touch before update on bookings
  for each row execute function touch_updated_at();
create trigger payments_touch before update on payments
  for each row execute function touch_updated_at();

-- A profile row is created for every sign-up, carrying the role chosen at
-- registration. Admin can never be self-assigned here.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  chosen text := coalesce(new.raw_user_meta_data ->> 'role', 'renter');
begin
  if chosen not in ('renter', 'owner') then
    chosen := 'renter';
  end if;

  insert into profiles (id, name, email, phone, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    chosen::user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table profiles             enable row level security;
alter table properties           enable row level security;
alter table spaces               enable row level security;
alter table favorites            enable row level security;
alter table conversations        enable row level security;
alter table messages             enable row level security;
alter table bookings             enable row level security;
alter table payments             enable row level security;
alter table reviews              enable row level security;
alter table maintenance_requests enable row level security;
alter table space_requests       enable row level security;
alter table notifications        enable row level security;
alter table reports              enable row level security;

-- Profiles: public to read (owner cards need a name), editable only by you.
create policy profiles_read on profiles for select using (true);
create policy profiles_update_own on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role <> 'admin');
create policy profiles_admin_all on profiles for all using (is_admin()) with check (is_admin());

-- Properties: anyone may browse; only the owner may change.
create policy properties_read on properties for select using (true);
create policy properties_insert_own on properties for insert
  with check (owner_id = auth.uid());
create policy properties_update_own on properties for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy properties_delete_own on properties for delete using (owner_id = auth.uid());
create policy properties_admin_all on properties for all using (is_admin()) with check (is_admin());

-- Spaces: published listings are public; drafts only to their owner.
create policy spaces_read on spaces for select
  using (status = 'published' or owns_space(id) or is_admin());
create policy spaces_insert_own on spaces for insert
  with check (exists (
    select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()
  ));
create policy spaces_update_own on spaces for update
  using (owns_space(id)) with check (owns_space(id));
create policy spaces_delete_own on spaces for delete using (owns_space(id));
create policy spaces_admin_all on spaces for all using (is_admin()) with check (is_admin());

-- Favorites: strictly your own.
create policy favorites_own on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Conversations and messages: participants only.
create policy conversations_participant on conversations for select
  using (renter_id = auth.uid() or owner_id = auth.uid() or is_admin());
create policy conversations_insert on conversations for insert
  with check (renter_id = auth.uid() or owner_id = auth.uid());
create policy conversations_update on conversations for update
  using (renter_id = auth.uid() or owner_id = auth.uid());

create policy messages_participant on messages for select
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id
      and (c.renter_id = auth.uid() or c.owner_id = auth.uid() or is_admin())
  ));
create policy messages_insert on messages for insert
  with check (
    sender_id = auth.uid() and exists (
      select 1 from conversations c
      where c.id = conversation_id and (c.renter_id = auth.uid() or c.owner_id = auth.uid())
    )
  );
create policy messages_mark_read on messages for update
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id and (c.renter_id = auth.uid() or c.owner_id = auth.uid())
  ));

-- Bookings: both sides see them; the renter creates, the owner decides.
create policy bookings_participant on bookings for select
  using (renter_id = auth.uid() or owner_id = auth.uid() or is_admin());
create policy bookings_insert_renter on bookings for insert
  with check (renter_id = auth.uid());
create policy bookings_update_participant on bookings for update
  using (renter_id = auth.uid() or owner_id = auth.uid());
create policy bookings_admin_all on bookings for all using (is_admin()) with check (is_admin());

-- Payments: the payer and the space owner.
create policy payments_participant on payments for select
  using (
    user_id = auth.uid() or is_admin() or exists (
      select 1 from bookings b where b.id = booking_id and b.owner_id = auth.uid()
    )
  );
create policy payments_insert_own on payments for insert with check (user_id = auth.uid());
create policy payments_update_own on payments for update using (user_id = auth.uid() or is_admin());

-- Reviews: readable by anyone, writable only off a completed booking.
create policy reviews_read on reviews for select using (true);
create policy reviews_insert_after_stay on reviews for insert
  with check (
    reviewer_id = auth.uid() and exists (
      select 1 from bookings b
      where b.id = booking_id and b.renter_id = auth.uid() and b.status = 'completed'
    )
  );
create policy reviews_update_own on reviews for update
  using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());

-- Maintenance: the tenant who raised it and the owner who must fix it.
create policy maintenance_participant on maintenance_requests for select
  using (renter_id = auth.uid() or owner_id = auth.uid() or is_admin());
create policy maintenance_insert_renter on maintenance_requests for insert
  with check (renter_id = auth.uid());
create policy maintenance_update_participant on maintenance_requests for update
  using (renter_id = auth.uid() or owner_id = auth.uid());

-- Space requests: public board, own rows editable.
create policy space_requests_read on space_requests for select using (true);
create policy space_requests_insert_own on space_requests for insert
  with check (user_id = auth.uid());
create policy space_requests_update_own on space_requests for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy space_requests_delete_own on space_requests for delete using (user_id = auth.uid());

-- Notifications: yours alone.
create policy notifications_own on notifications for select using (user_id = auth.uid());
create policy notifications_update_own on notifications for update using (user_id = auth.uid());
create policy notifications_insert on notifications for insert with check (true);

-- Reports: anyone signed in may file one; only admin reads them.
create policy reports_insert on reports for insert with check (auth.uid() is not null);
create policy reports_admin_read on reports for select using (is_admin());
create policy reports_admin_update on reports for update using (is_admin());
