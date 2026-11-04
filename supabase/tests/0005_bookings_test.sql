begin;
create extension if not exists pgtap;

select plan(19);

-- ============================================================================
-- Fixtures: owner, two renters, and a third-party user
-- ============================================================================
insert into profiles (id, name, phone, role, is_seed) values
  ('00000000-0000-0000-0000-000000000101', 'Owner One',   '01711111111', 'owner',  true),
  ('00000000-0000-0000-0000-000000000102', 'Renter One',  '01722222222', 'renter', true),
  ('00000000-0000-0000-0000-000000000103', 'Renter Two',  '01733333333', 'renter', true),
  ('00000000-0000-0000-0000-000000000104', 'Stranger',    '01744444444', 'renter', true);

insert into properties (id, owner_id, name, area, neighborhood, address, district, geography, is_seed) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', 'Test House', 'Dhanmondi', 'Dhanmondi 27', 'House 12, Road 27', 'Dhaka', 'urban', true);

insert into spaces (id, property_id, name, category, space_type, transaction, status, price, availability, is_seed) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000401', 'Flat 3B', 'living', 'apartment', 'rent', 'published', 18000, 'available', true);

-- ============================================================================
-- 1. Pure state machine function checks
-- ============================================================================
select ok(
  booking_transition_allowed('requested', 'accepted'),
  'State machine allows requested -> accepted'
);

select ok(
  not booking_transition_allowed('requested', 'confirmed'),
  'State machine forbids jumping from requested -> confirmed'
);

select ok(
  not booking_transition_allowed('completed', 'cancelled'),
  'State machine forbids leaving terminal completed state'
);

-- ============================================================================
-- 2. Request guards (guard_booking_request)
-- ============================================================================
select throws_ok(
  $$
    insert into bookings (space_id, renter_id, owner_id, move_in_date, months, amount)
    values (
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000101',
      current_date + 7, 12, 18000
    )
  $$,
  '23514',
  'You cannot book your own space.',
  'An owner cannot request a booking on their own space'
);

-- Insert two valid booking requests from Renter One and Renter Two
insert into bookings (id, space_id, renter_id, owner_id, move_in_date, months, amount) values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000104', current_date + 7, 12, 18000),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000101', current_date + 10, 6, 18000);

select is(
  (select owner_id from bookings where id = '00000000-0000-0000-0000-000000000601'),
  '00000000-0000-0000-0000-000000000101'::uuid,
  'guard_booking_request overwrites client-supplied owner_id with the true property owner'
);

select is(
  (select phone_shared from bookings where id = '00000000-0000-0000-0000-000000000601'),
  false,
  'Phone numbers are not shared while booking is only requested'
);

-- ============================================================================
-- 3. Transition & privilege guards (guard_booking_transition)
-- ============================================================================
-- Authenticate as Renter One
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000102","role":"authenticated"}', true);

select throws_ok(
  $$ update bookings set status = 'accepted' where id = '00000000-0000-0000-0000-000000000601' $$,
  '42501',
  'Only the owner can do that to a booking.',
  'A renter cannot accept their own booking request'
);

select throws_ok(
  $$ update bookings set status = 'rejected' where id = '00000000-0000-0000-0000-000000000601' $$,
  '42501',
  'Only the owner can do that to a booking.',
  'A renter cannot reject their own booking request'
);

-- Authenticate as Stranger (neither renter nor owner)
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000104', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000104","role":"authenticated"}', true);

select throws_ok(
  $$ update bookings set status = 'cancelled' where id = '00000000-0000-0000-0000-000000000601' $$,
  '42501',
  'Only the people in this booking can cancel it.',
  'An unrelated user cannot cancel someone else''s booking'
);

-- Authenticate as Owner One
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated"}', true);

select throws_ok(
  $$ update bookings set status = 'confirmed' where id = '00000000-0000-0000-0000-000000000601' $$,
  '23514',
  'A booking cannot go from requested to confirmed.',
  'Even the owner cannot skip from requested directly to confirmed'
);

-- Owner accepts booking 601
select lives_ok(
  $$ update bookings set status = 'accepted' where id = '00000000-0000-0000-0000-000000000601' $$,
  'Owner can accept a requested booking'
);

select is(
  (select phone_shared from bookings where id = '00000000-0000-0000-0000-000000000601'),
  true,
  'Accepting a booking sets phone_shared = true'
);

select is(
  (select renter_phone from bookings where id = '00000000-0000-0000-0000-000000000601'),
  '01722222222',
  'Accepting a booking copies the renter phone number from profiles'
);

select is(
  (select availability from spaces where id = '00000000-0000-0000-0000-000000000501'),
  'available'::availability_status,
  'Accepting a booking does NOT take the space off the market'
);

-- ============================================================================
-- 4. Confirming takes the space off the market and declines competing requests
-- ============================================================================
update bookings set status = 'confirmed' where id = '00000000-0000-0000-0000-000000000601';

select is(
  (select availability from spaces where id = '00000000-0000-0000-0000-000000000501'),
  'occupied'::availability_status,
  'Confirming a booking marks the space as occupied'
);

select is(
  (select status from bookings where id = '00000000-0000-0000-0000-000000000602'),
  'rejected'::booking_status,
  'Confirming a booking automatically rejects competing requests on the same space'
);

select throws_ok(
  $$
    insert into bookings (space_id, renter_id, owner_id, move_in_date, months, amount)
    values (
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000104',
      '00000000-0000-0000-0000-000000000101',
      current_date + 30, 6, 18000
    )
  $$,
  '23514',
  'That space is not available to book.',
  'An occupied space cannot be booked by another renter'
);

-- ============================================================================
-- 5. Completing frees the space and locks the booking in a terminal state
-- ============================================================================
update bookings set status = 'completed' where id = '00000000-0000-0000-0000-000000000501' or id = '00000000-0000-0000-0000-000000000601';

select is(
  (select availability from spaces where id = '00000000-0000-0000-0000-000000000501'),
  'available'::availability_status,
  'Marking a confirmed booking completed returns the space to available'
);

select throws_ok(
  $$ update bookings set status = 'cancelled' where id = '00000000-0000-0000-0000-000000000601' $$,
  '23514',
  'A booking cannot go from completed to cancelled.',
  'A completed booking is terminal and refuses further status changes'
);

select * from finish();
rollback;
