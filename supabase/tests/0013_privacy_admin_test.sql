begin;
create extension if not exists pgtap;

select plan(14);

-- ============================================================================
-- P0-01: personal contact details and the admin boundary
-- ============================================================================

insert into profiles (id, name, email, phone, role, trust, is_seed) values
  ('00000000-0000-0000-0000-000000000701', 'Moderator Two', 'mod@example.test',   'test-phone-701', 'admin',  'reviewed',   false),
  ('00000000-0000-0000-0000-000000000702', 'Plain Owner',   'owner@example.test', 'test-phone-702', 'owner',  'unverified', false);

insert into properties (id, owner_id, name, area, neighborhood, address, district, geography, is_seed) values
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000702', 'Queue House', 'Mirpur', 'Mirpur 10', 'Road 3, Mirpur 10', 'Dhaka', 'urban', false);

-- A real (non-seed) draft from an unverified owner: belongs in the queue.
insert into spaces (id, property_id, name, category, space_type, transaction, status, price, is_seed) values
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000703', 'Queue Flat', 'living', 'apartment', 'rent', 'draft', 15000, false);

-- ── 1. Phone and email are not readable through the API roles ──────────────
select ok(
  not has_column_privilege('anon', 'public.profiles', 'phone', 'SELECT'),
  'anon cannot read profiles.phone'
);
select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'phone', 'SELECT'),
  'authenticated cannot read profiles.phone'
);
select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'email', 'SELECT'),
  'authenticated cannot read profiles.email'
);
select ok(
  has_column_privilege('anon', 'public.profiles', 'name', 'SELECT'),
  'Public profile fields (name) are still readable'
);

-- ── 2. get_my_profile returns only your own row, with contact details ──────
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000702', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000702","role":"authenticated"}', true);

select is(
  (select phone from get_my_profile()),
  'test-phone-702',
  'get_my_profile returns the caller''s own phone'
);
select is(
  (select count(*)::integer from get_my_profile()),
  1,
  'get_my_profile returns exactly one row (the caller''s)'
);
select ok(
  not has_function_privilege('anon', 'get_my_profile()', 'EXECUTE'),
  'anon cannot call get_my_profile'
);

-- ── 3. A non-admin cannot change admin-controlled fields on themselves ─────
select throws_ok(
  $$ update profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000702' $$,
  '42501',
  'Only an administrator can change that.',
  'A user cannot make themselves an admin'
);
select throws_ok(
  $$ update profiles set trust = 'reviewed' where id = '00000000-0000-0000-0000-000000000702' $$,
  '42501',
  'Only an administrator can change that.',
  'A user cannot raise their own trust tier'
);
select throws_ok(
  $$ update profiles set suspended = true, verification = 'verified' where id = '00000000-0000-0000-0000-000000000702' $$,
  '42501',
  'Only an administrator can change that.',
  'A user cannot change their own verification or suspension'
);
select lives_ok(
  $$ update profiles set name = 'Plain Owner Renamed' where id = '00000000-0000-0000-0000-000000000702' $$,
  'A user can still edit their own name'
);

-- ── 4. Review queue: zero rows for non-admins, rows for admins ─────────────
select is(
  (select count(*)::integer from review_queue),
  0,
  'A non-admin sees nothing in review_queue'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000701', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000701","role":"authenticated"}', true);

select ok(
  exists (select 1 from review_queue where space_id = '00000000-0000-0000-0000-000000000704'),
  'An admin sees the unverified owner''s listing in review_queue'
);

select lives_ok(
  $$ select admin_set_trust('00000000-0000-0000-0000-000000000702', 'reviewed', 'Checked in person') $$,
  'An admin can still change another account''s trust tier'
);

select * from finish();
rollback;
