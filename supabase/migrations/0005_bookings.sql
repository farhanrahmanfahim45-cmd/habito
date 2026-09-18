-- ============================================================================
-- HABITO — stage 5: bookings
--
--   1. A booking state machine the database enforces, not just the interface.
--   2. Availability that actually blocks: an occupied space cannot be booked.
--   3. Phone numbers revealed on acceptance, never before.
--   4. Caretakers, who in practice are the people who show the room.
-- ============================================================================

-- ── 1. Caretakers ───────────────────────────────────────────────────────────
-- In Bangladesh the caretaker, not the owner, usually answers the phone and
-- shows the space. Modelling it now costs a table; adding it after bookings
-- exist would mean rewriting who is allowed to accept one.

create table if not exists property_managers (
  property_id uuid not null references properties (id) on delete cascade,
  manager_id  uuid not null references profiles (id) on delete cascade,
  role        text not null default 'caretaker' check (role in ('caretaker', 'agent')),
  can_accept  boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (property_id, manager_id)
);

alter table property_managers enable row level security;

create or replace function manages_property(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from property_managers
    where property_id = target and manager_id = auth.uid()
  );
$$;

/** True for the owner of the space, or anyone they've asked to manage it. */
create or replace function can_manage_space(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from spaces s
    join properties p on p.id = s.property_id
    where s.id = target
      and (p.owner_id = auth.uid() or manages_property(p.id))
  );
$$;

drop policy if exists managers_read on property_managers;
create policy managers_read on property_managers for select
  using (
    manager_id = auth.uid()
    or exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
    or is_admin()
  );

drop policy if exists managers_write on property_managers;
create policy managers_write on property_managers for all
  using (exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()));

-- ── 2. Booking columns ──────────────────────────────────────────────────────

alter table bookings
  add column if not exists phone_shared boolean not null default false,
  add column if not exists renter_phone text,
  add column if not exists owner_phone text,
  add column if not exists decline_reason text,
  add column if not exists cancelled_by uuid references profiles (id);

comment on column bookings.phone_shared is
  'Set true only when the owner accepts. Numbers are copied in at that moment so a later profile edit does not rewrite history.';

-- ── 3. The state machine ────────────────────────────────────────────────────
-- Enforced in the database so an unexpected client cannot move a booking
-- somewhere it should not go.

create or replace function booking_transition_allowed(old_status booking_status, new_status booking_status)
returns boolean language sql immutable as $$
  select case old_status
    when 'requested'       then new_status in ('accepted', 'rejected', 'cancelled')
    when 'accepted'        then new_status in ('payment-pending', 'confirmed', 'rejected', 'cancelled')
    when 'payment-pending' then new_status in ('confirmed', 'payment-failed', 'cancelled')
    when 'payment-failed'  then new_status in ('payment-pending', 'cancelled')
    when 'confirmed'       then new_status in ('completed', 'cancelled')
    -- Terminal states stay put.
    when 'completed'       then false
    when 'rejected'        then false
    when 'cancelled'       then false
    else false
  end;
$$;

create or replace function guard_booking_transition()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_owner boolean := old.owner_id = auth.uid() or can_manage_space(old.space_id);
  is_renter boolean := old.renter_id = auth.uid();
begin
  if new.status = old.status then
    return new;
  end if;

  if not booking_transition_allowed(old.status, new.status) then
    raise exception 'A booking cannot go from % to %.', old.status, new.status
      using errcode = 'check_violation';
  end if;

  -- Who may make which move. Accepting and rejecting belong to the owner
  -- side; a renter may only withdraw.
  if new.status in ('accepted', 'rejected', 'completed') and not (is_owner or is_admin()) then
    raise exception 'Only the owner can do that to a booking.'
      using errcode = 'insufficient_privilege';
  end if;

  if new.status = 'cancelled' and not (is_owner or is_renter or is_admin()) then
    raise exception 'Only the people in this booking can cancel it.'
      using errcode = 'insufficient_privilege';
  end if;

  -- Contact details are exchanged at acceptance and not a moment earlier.
  if new.status = 'accepted' then
    new.phone_shared := true;
    new.decided_at := now();
    new.renter_phone := coalesce(new.renter_phone, (select phone from profiles where id = old.renter_id));
    new.owner_phone := coalesce(new.owner_phone, (select phone from profiles where id = old.owner_id));
  end if;

  if new.status = 'rejected' then
    new.decided_at := now();
  end if;

  if new.status = 'cancelled' then
    new.cancelled_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_guard_transition on bookings;
create trigger bookings_guard_transition
  before update on bookings
  for each row execute function guard_booking_transition();

-- ── 4. Availability actually blocks ─────────────────────────────────────────

create or replace function guard_booking_request()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  space_status availability_status;
  listing listing_status;
  space_owner uuid;
begin
  select s.availability, s.status, p.owner_id
    into space_status, listing, space_owner
  from spaces s join properties p on p.id = s.property_id
  where s.id = new.space_id;

  if space_owner is null then
    raise exception 'That space no longer exists.';
  end if;

  if space_owner = new.renter_id then
    raise exception 'You cannot book your own space.' using errcode = 'check_violation';
  end if;

  if listing <> 'published' then
    raise exception 'That space is not currently listed.' using errcode = 'check_violation';
  end if;

  if space_status in ('occupied', 'maintenance') then
    raise exception 'That space is not available to book.' using errcode = 'check_violation';
  end if;

  -- Fill the owner in from the property rather than trusting the client.
  new.owner_id := space_owner;
  return new;
end;
$$;

drop trigger if exists bookings_guard_request on bookings;
create trigger bookings_guard_request
  before insert on bookings
  for each row execute function guard_booking_request();

-- Only a confirmed booking takes the space off the market — never an accepted
-- one. Accepting exchanges numbers so the two of you can talk and visit; an
-- owner will often accept several people before agreeing with one, and until
-- that moment the space stays listed and other requests stay open.
create or replace function sync_space_on_booking()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'confirmed' and old.status <> 'confirmed' then
    update spaces set availability = 'occupied' where id = new.space_id;

    -- Agreeing with one person settles it for the others. Declining them here
    -- is kinder than leaving them waiting on a space that is gone.
    update bookings
       set status = 'rejected',
           decline_reason = coalesce(decline_reason, 'The space has been taken by someone else.'),
           decided_at = now()
     where space_id = new.space_id
       and id <> new.id
       and status in ('requested', 'accepted');
  end if;

  -- Freed again when the stay ends or the booking falls through.
  if new.status in ('completed', 'cancelled') and old.status = 'confirmed' then
    update spaces set availability = 'available' where id = new.space_id;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_sync_space on bookings;
create trigger bookings_sync_space
  after update on bookings
  for each row execute function sync_space_on_booking();

-- ── 5. Notifications ────────────────────────────────────────────────────────
-- Raised by the database so they cannot be forgotten by a client.

create or replace function notify_booking_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  space_name text;
begin
  select name into space_name from spaces where id = new.space_id;

  if tg_op = 'INSERT' then
    insert into notifications (user_id, kind, title, body, entity_type, entity_id)
    values (new.owner_id, 'booking-request', 'New booking request',
            coalesce(space_name, 'A space') || ' — someone wants to book it', 'booking', new.id);
    return new;
  end if;

  if new.status <> old.status then
    insert into notifications (user_id, kind, title, body, entity_type, entity_id)
    values (
      case when new.status in ('accepted', 'rejected', 'confirmed') then new.renter_id else new.owner_id end,
      'booking-' || new.status,
      case new.status
        when 'accepted'  then 'Booking accepted'
        when 'rejected'  then 'Booking declined'
        when 'confirmed' then 'Booking confirmed'
        when 'cancelled' then 'Booking cancelled'
        when 'completed' then 'Stay completed'
        else 'Booking updated'
      end,
      coalesce(space_name, 'A space'),
      'booking',
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_notify on bookings;
create trigger bookings_notify
  after insert or update on bookings
  for each row execute function notify_booking_change();

-- ── 6. Caretakers can act on bookings ───────────────────────────────────────

drop policy if exists bookings_participant on bookings;
create policy bookings_participant on bookings for select
  using (
    renter_id = auth.uid()
    or owner_id = auth.uid()
    or can_manage_space(space_id)
    or is_admin()
  );

drop policy if exists bookings_update_participant on bookings;
create policy bookings_update_participant on bookings for update
  using (renter_id = auth.uid() or owner_id = auth.uid() or can_manage_space(space_id));

create index if not exists bookings_status_idx on bookings (status, created_at desc);
