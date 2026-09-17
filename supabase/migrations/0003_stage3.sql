-- ============================================================================
-- HABITO — stage 3
--
--   1. One account can both rent and own.
--   2. Occupancy rules back on spaces (bachelor / family / student / gender),
--      which is the filter Dhaka renters actually use.
--   3. A storage bucket for real property photographs.
--   4. Language preference on the profile.
-- ============================================================================

-- ── 1. Dual-role accounts ───────────────────────────────────────────────────
-- Plenty of people here are both: a renter who sublets a room, a shopkeeper
-- renting a flat. Forcing two accounts is friction, and the data model never
-- needed it — ownership was always decided by properties.owner_id, not by a
-- label on the profile.

alter table profiles add column if not exists can_own boolean not null default false;

comment on column profiles.can_own is
  'Whether this account may use owner tools. Everyone may rent. Admin is still carried by role.';

-- Anyone who signed up as an owner keeps that ability.
update profiles set can_own = true where role = 'owner';

-- Registration can set it; admin remains unassignable from the client.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  chosen text := coalesce(new.raw_user_meta_data ->> 'role', 'renter');
begin
  if chosen not in ('renter', 'owner') then
    chosen := 'renter';
  end if;

  insert into profiles (id, name, email, phone, role, can_own)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    chosen::user_role,
    chosen = 'owner'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Switching on owner tools is a normal profile update, but role must stay put:
-- a renter cannot make themselves an owner in the privileged sense, and nobody
-- can make themselves an admin.
drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from profiles p where p.id = auth.uid())
  );

-- ── 2. Occupancy rules ──────────────────────────────────────────────────────
-- "Bachelor allowed" decides whether a listing is worth opening at all here.

create type gender_preference as enum ('any', 'male', 'female');

alter table spaces
  add column if not exists family_allowed   boolean not null default true,
  add column if not exists bachelor_allowed boolean not null default true,
  add column if not exists student_friendly boolean not null default true,
  add column if not exists gender_pref      gender_preference not null default 'any',
  add column if not exists max_occupants    integer check (max_occupants > 0);

create index if not exists spaces_rules_idx
  on spaces (bachelor_allowed, family_allowed, student_friendly);

-- Only living spaces carry these. A godown has no opinion about bachelors.
comment on column spaces.bachelor_allowed is
  'Living spaces only. Ignored for business, storage, parking and land.';

-- ── 3. Language preference ──────────────────────────────────────────────────

alter table profiles
  add column if not exists language text not null default 'en'
  check (language in ('en', 'bn'));

-- ── 4. Photo storage ────────────────────────────────────────────────────────
-- Public read so listing images load without a signed URL; writes restricted
-- to the owner of the property the photo belongs to.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'space-photos',
  'space-photos',
  true,
  5242880,                                    -- 5 MB, after client-side compression
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Photos are stored as <user id>/<space id>/<file>, so ownership is the first
-- path segment and can be checked without a database lookup.
drop policy if exists space_photos_read on storage.objects;
create policy space_photos_read on storage.objects for select
  using (bucket_id = 'space-photos');

drop policy if exists space_photos_insert on storage.objects;
create policy space_photos_insert on storage.objects for insert
  with check (
    bucket_id = 'space-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists space_photos_update on storage.objects;
create policy space_photos_update on storage.objects for update
  using (
    bucket_id = 'space-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists space_photos_delete on storage.objects;
create policy space_photos_delete on storage.objects for delete
  using (
    bucket_id = 'space-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
