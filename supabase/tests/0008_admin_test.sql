begin;
create extension if not exists pgtap;

select plan(15);

-- ============================================================================
-- Fixtures: admin, owner, three distinct reporters, property, and space
-- ============================================================================
insert into profiles (id, name, role, trust, is_seed) values
  ('00000000-0000-0000-0000-000000000301', 'Moderator One', 'admin',  'reviewed',   false),
  ('00000000-0000-0000-0000-000000000302', 'Space Owner',   'owner',  'unverified', false),
  ('00000000-0000-0000-0000-000000000303', 'Reporter One',  'renter', 'unverified', false),
  ('00000000-0000-0000-0000-000000000304', 'Reporter Two',  'renter', 'unverified', false),
  ('00000000-0000-0000-0000-000000000305', 'Reporter Three','renter', 'unverified', false);

insert into properties (id, owner_id, name, area, neighborhood, address, district, geography, is_seed) values
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000302', 'Moderation House', 'Uttara East', 'Sector 4', 'Road 7, Sector 4', 'Dhaka', 'urban', true);

insert into spaces (id, property_id, name, category, space_type, transaction, status, price, flagged_duplicate, is_seed) values
  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000403', 'Flagged Flat', 'living', 'apartment', 'rent', 'published', 22000, true, true);

-- ============================================================================
-- 1. Non-admins calling admin functions directly are refused
-- ============================================================================
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000302', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000302","role":"authenticated"}', true);

select throws_ok(
  $$ select admin_set_listing_visible('00000000-0000-0000-0000-000000000504', false, 'Owner trying to hide') $$,
  '42501',
  'Only an administrator can do that.',
  'Non-admin cannot call admin_set_listing_visible'
);

select throws_ok(
  $$ select admin_set_trust('00000000-0000-0000-0000-000000000302', 'reviewed', 'Self review') $$,
  '42501',
  'Only an administrator can do that.',
  'Non-admin cannot call admin_set_trust'
);

select throws_ok(
  $$ select admin_resolve_reports('00000000-0000-0000-0000-000000000504', true, 'Self dismiss') $$,
  '42501',
  'Only an administrator can do that.',
  'Non-admin cannot call admin_resolve_reports'
);

select throws_ok(
  $$ select admin_clear_duplicate('00000000-0000-0000-0000-000000000504', 'Self clear') $$,
  '42501',
  'Only an administrator can do that.',
  'Non-admin cannot call admin_clear_duplicate'
);

-- ============================================================================
-- 2. Report threshold: 1 person x 3 reports does not hide; 3 distinct people do
-- ============================================================================
insert into reports (reporter_id, space_id, reason) values
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000504', 'Spam 1'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000504', 'Spam 2'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000504', 'Spam 3');

select is(
  (select hidden_at from spaces where id = '00000000-0000-0000-0000-000000000504'),
  null,
  'One reporter filing three reports does NOT hide the listing'
);

insert into reports (reporter_id, space_id, reason) values
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000504', 'Misleading price'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000504', 'Copied photos');

select ok(
  (select hidden_at is not null from spaces where id = '00000000-0000-0000-0000-000000000504'),
  'Three distinct reporters filing reports automatically hides the listing'
);

-- ============================================================================
-- 3. Admin actions, id-verified refusal, and audit trail creation
-- ============================================================================
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000301', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000301","role":"authenticated"}', true);

select throws_ok(
  $$ select admin_set_trust('00000000-0000-0000-0000-000000000302', 'id-verified', 'Try setting eKYC') $$,
  '23514',
  'id-verified is reserved for formal identity verification, which Habito cannot perform.',
  'Even an admin cannot set trust tier to id-verified'
);

select lives_ok(
  $$ select admin_resolve_reports('00000000-0000-0000-0000-000000000504', true, 'Checked with owner, listing is genuine') $$,
  'Admin can dismiss reports on a hidden listing'
);

select is(
  (select hidden_at from spaces where id = '00000000-0000-0000-0000-000000000504'),
  null,
  'Dismissing reports restores the hidden listing'
);

select lives_ok(
  $$ select admin_clear_duplicate('00000000-0000-0000-0000-000000000504', 'Owner owns two identical flats') $$,
  'Admin can clear duplicate flag'
);

select is(
  (select flagged_duplicate from spaces where id = '00000000-0000-0000-0000-000000000504'),
  false,
  'admin_clear_duplicate sets flagged_duplicate = false'
);

select lives_ok(
  $$ select admin_set_trust('00000000-0000-0000-0000-000000000302', 'reviewed', 'Utility bill inspected') $$,
  'Admin can set owner trust tier to reviewed with a note'
);

select is(
  (select count(*)::integer from moderation_actions where actor_id = '00000000-0000-0000-0000-000000000301'),
  3,
  'Every admin moderation action writes an audit row naming the acting admin'
);

-- ============================================================================
-- 4. Audit rows (moderation_actions) cannot be edited or deleted even by admin
-- ============================================================================
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'moderation_actions' and cmd in ('UPDATE', 'DELETE', 'ALL')),
  0,
  'No UPDATE or DELETE RLS policy exists on moderation_actions'
);

-- Switch into the authenticated Postgres role as the admin and attempt to tamper with audit rows
set local role authenticated;
update moderation_actions set note = 'tampered' where actor_id = '00000000-0000-0000-0000-000000000301';
delete from moderation_actions where actor_id = '00000000-0000-0000-0000-000000000301';
reset role;

select is(
  (select count(*)::integer from moderation_actions where actor_id = '00000000-0000-0000-0000-000000000301' and note <> 'tampered'),
  3,
  'An admin cannot edit or delete existing moderation_actions audit rows'
);

select * from finish();
rollback;
