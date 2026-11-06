-- ============================================================================
-- HABITO — P0-01: personal contact details and the admin boundary
--
--   1. Phone and email on profiles are no longer readable by anyone through
--      the API. Listings used to embed the owner's whole profile row, which
--      put every owner's phone number in every public listing response.
--   2. A signed-in user can read their own full profile through one function.
--   3. Admin-controlled profile fields (role, trust, verification, suspension)
--      cannot be changed by the account itself. Before this, a user could
--      skip admin_set_trust() and simply update their own trust tier.
--   4. The review queue returns rows to admins only. A view runs with its
--      owner's rights, so the queue was readable by every signed-in account.
--   5. Phone numbers on a booking are exchanged only once it is confirmed —
--      requested by the renter and agreed by the owner — never at acceptance.
--      Until then the two sides talk through Messages.
-- ============================================================================

-- ── 1. Contact details are not public ───────────────────────────────────────
-- Column privileges, so it holds no matter which query or embed is used.
-- New profile columns are NOT granted automatically: add them to a grant in
-- the migration that creates them.

revoke select on table profiles from public, anon, authenticated;

do $$
declare
  cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'profiles'
    and column_name not in ('phone', 'email');

  execute format('grant select (%s) on table profiles to anon, authenticated', cols);
end $$;

-- ── 2. Your own profile, in full ────────────────────────────────────────────

create or replace function get_my_profile()
returns setof profiles language sql stable security definer set search_path = public as $$
  select * from profiles where id = auth.uid();
$$;

revoke all on function get_my_profile() from public, anon;
grant execute on function get_my_profile() to authenticated;

-- ── 3. Admin-controlled fields stay admin-controlled ────────────────────────
-- profiles_update_own still lets people edit their name, phone, language and
-- owner tools. Everything that says what Habito has checked about an account
-- can only move through an admin (or a migration / service role, where
-- auth.uid() is null).

create or replace function guard_profile_self_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;

  if new.role              is distinct from old.role
  or new.trust             is distinct from old.trust
  or new.verification      is distinct from old.verification
  or new.suspended         is distinct from old.suspended
  or new.is_seed           is distinct from old.is_seed
  or new.phone_verified_at is distinct from old.phone_verified_at
  or new.reviewed_at       is distinct from old.reviewed_at
  or new.review_note       is distinct from old.review_note
  then
    raise exception 'Only an administrator can change that.'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_self_update on profiles;
create trigger profiles_guard_self_update
  before update on profiles
  for each row execute function guard_profile_self_update();

-- ── 4. The review queue is for admins ───────────────────────────────────────
-- Same columns as 0008; the only change is `is_admin()` in the filter, so a
-- non-admin (or a signed-out visitor) gets zero rows rather than an error.

create or replace view review_queue as
  select
    s.id                as space_id,
    s.name              as space_name,
    s.status,
    s.completeness,
    s.flagged_duplicate,
    s.hidden_at,
    s.hidden_reason,
    s.created_at,
    p.id                as property_id,
    p.area,
    p.address,
    o.id                as owner_id,
    o.name              as owner_name,
    o.trust             as owner_trust,
    (select count(distinct r.reporter_id) from reports r where r.space_id = s.id) as report_count,
    (select count(*) from reports r where r.space_id = s.id and r.status = 'open') as open_reports,
    (case
       when s.hidden_at is not null then 0
       when (select count(*) from reports r where r.space_id = s.id and r.status = 'open') > 0 then 1
       when s.flagged_duplicate then 2
       when o.trust = 'unverified' then 3
       else 4
     end)               as priority
  from spaces s
  join properties p on p.id = s.property_id
  join profiles o on o.id = p.owner_id
  where is_admin()
    and s.is_seed is not true
    and (
      s.hidden_at is not null
      or s.flagged_duplicate
      or exists (select 1 from reports r where r.space_id = s.id and r.status = 'open')
      or o.trust = 'unverified'
    );

revoke all on review_queue from public, anon;
grant select on review_queue to authenticated;

-- ── 5. Phone numbers only after confirmation ────────────────────────────────

comment on column bookings.phone_shared is
  'Set true only when the booking is confirmed (renter requested, owner agreed). Numbers are copied in at that moment so a later profile edit does not rewrite history.';

create or replace function guard_booking_transition()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_owner boolean := old.owner_id = auth.uid() or can_manage_space(old.space_id);
  is_renter boolean := old.renter_id = auth.uid();
  -- True when another trigger moved the booking (a settled payment), rather
  -- than a client calling update directly.
  from_system boolean := pg_trigger_depth() > 1;
begin
  -- Contact columns are written by this function only. A participant who
  -- edits them directly has the edit quietly undone.
  if auth.uid() is not null and not is_admin() then
    new.phone_shared := old.phone_shared;
    new.renter_phone := old.renter_phone;
    new.owner_phone  := old.owner_phone;
  end if;

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

  -- Confirming is the owner agreeing to a renter's request. The only other
  -- route is a settled deposit/advance payment, which arrives via a trigger.
  if new.status = 'confirmed' and not (is_owner or is_admin() or (from_system and old.status = 'payment-pending')) then
    raise exception 'Only the owner can confirm a booking.'
      using errcode = 'insufficient_privilege';
  end if;

  if new.status = 'cancelled' and not (is_owner or is_renter or is_admin()) then
    raise exception 'Only the people in this booking can cancel it.'
      using errcode = 'insufficient_privilege';
  end if;

  if new.status in ('accepted', 'rejected') then
    new.decided_at := now();
  end if;

  -- Contact details are exchanged at confirmation and not a moment earlier.
  if new.status = 'confirmed' then
    new.phone_shared := true;
    new.renter_phone := coalesce(old.renter_phone, (select phone from profiles where id = old.renter_id));
    new.owner_phone  := coalesce(old.owner_phone,  (select phone from profiles where id = old.owner_id));
  end if;

  if new.status = 'cancelled' then
    new.cancelled_by := auth.uid();
  end if;

  return new;
end;
$$;

-- Bookings that exchanged numbers under the old rule (at acceptance) but were
-- never confirmed lose them now. Runs as the migration role, so the guard
-- above lets it through.
update bookings
   set phone_shared = false,
       renter_phone = null,
       owner_phone  = null
 where status not in ('confirmed', 'completed')
   and (phone_shared or renter_phone is not null or owner_phone is not null);

