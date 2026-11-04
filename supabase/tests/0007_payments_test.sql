begin;
create extension if not exists pgtap;

select plan(15);

-- ============================================================================
-- Fixtures: owner, renter, rental space, and sale space
-- ============================================================================
insert into profiles (id, name, phone, role, is_seed) values
  ('00000000-0000-0000-0000-000000000201', 'Ledger Owner',  '01811111111', 'owner',  true),
  ('00000000-0000-0000-0000-000000000202', 'Ledger Renter', '01822222222', 'renter', true);

insert into properties (id, owner_id, name, area, neighborhood, address, district, geography, is_seed) values
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000201', 'Ledger Villa', 'Banani', 'Banani 11', 'Road 11, Banani', 'Dhaka', 'urban', true);

insert into spaces (id, property_id, name, category, space_type, transaction, status, price, availability, is_seed) values
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000402', 'Rental Flat', 'living', 'apartment', 'rent', 'published', 15000, 'available', true),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000402', 'Sale Plot',   'land',   'farmland',  'sale', 'published', 900000, 'available', true);

insert into bookings (id, space_id, renter_id, owner_id, move_in_date, months, amount) values
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000201', '2026-01-01', 3, 15000),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000201', '2026-01-01', 1, 900000);

-- Authenticate as owner to accept and confirm both bookings
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}', true);

update bookings set status = 'accepted'  where id in ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000702');
update bookings set status = 'confirmed' where id in ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000702');

-- ============================================================================
-- 1. Rent schedule generation (generate_rent_schedule)
-- ============================================================================
select is(
  (select count(*)::integer from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701'),
  3,
  'Confirming a 3-month rental booking generates 3 monthly rent invoices'
);

select is(
  (select count(*)::integer from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000702'),
  0,
  'Confirming a sale listing booking generates 0 rent invoices'
);

-- ============================================================================
-- 2. Payment insert guard (guard_payment_insert)
-- ============================================================================
select throws_ok(
  $$
    insert into payments (booking_id, user_id, amount, status)
    values ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000202', 15000, 'successful')
  $$,
  '23514',
  'A payment starts as pending; only the gateway can settle it.',
  'A payment cannot be inserted as already successful'
);

-- ============================================================================
-- 3. Invoice update guard (guard_invoice_update)
-- ============================================================================
select throws_ok(
  $$
    update rent_invoices
       set status = 'paid'
     where booking_id = '00000000-0000-0000-0000-000000000701'
       and period_start = '2026-01-01'
  $$,
  '23514',
  'An invoice can only be marked paid by a successful payment.',
  'An invoice cannot be marked paid without a payment_id'
);

-- Insert a pending payment and verify it cannot mark an invoice paid before settling
insert into payments (id, booking_id, user_id, invoice_id, amount, status)
values (
  '00000000-0000-0000-0000-000000000801',
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000202',
  (select id from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701' and period_start = '2026-01-01'),
  15000,
  'pending'
);

select throws_ok(
  $$
    update rent_invoices
       set status = 'paid',
           payment_id = '00000000-0000-0000-0000-000000000801'
     where booking_id = '00000000-0000-0000-0000-000000000701'
       and period_start = '2026-01-01'
  $$,
  '23514',
  'That payment did not succeed, or does not cover this invoice.',
  'An invoice cannot be marked paid using a payment that is still pending'
);

-- Insert an underpaid payment, settle it, and verify it cannot settle the full invoice
insert into payments (id, booking_id, user_id, amount, status)
values (
  '00000000-0000-0000-0000-000000000802',
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000202',
  5000,
  'pending'
);
update payments set status = 'successful' where id = '00000000-0000-0000-0000-000000000802';

select throws_ok(
  $$
    update rent_invoices
       set status = 'paid',
           payment_id = '00000000-0000-0000-0000-000000000802'
     where booking_id = '00000000-0000-0000-0000-000000000701'
       and period_start = '2026-01-01'
  $$,
  '23514',
  'That payment did not succeed, or does not cover this invoice.',
  'A successful payment for less than the invoice amount cannot mark the invoice paid'
);

-- ============================================================================
-- 4. Failed vs successful payment settlement (settle_payment) & owner waive
-- ============================================================================
update payments set status = 'failed' where id = '00000000-0000-0000-0000-000000000801';

select is(
  (select status from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701' and period_start = '2026-01-01'),
  'due'::invoice_status,
  'A failed payment does not settle the invoice'
);

-- Settle a valid full-amount payment for Month 1
insert into payments (id, booking_id, user_id, invoice_id, amount, status)
values (
  '00000000-0000-0000-0000-000000000803',
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000202',
  (select id from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701' and period_start = '2026-01-01'),
  15000,
  'pending'
);
update payments set status = 'successful' where id = '00000000-0000-0000-0000-000000000803';

select is(
  (select status from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701' and period_start = '2026-01-01'),
  'paid'::invoice_status,
  'A successful payment automatically settles its linked invoice'
);

select ok(
  (select receipt_no ~ '^HAB-\d{4}-\d{6}$' from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701' and period_start = '2026-01-01'),
  'Settling an invoice issues a formatted sequential receipt number (HAB-YYYY-NNNNNN)'
);

-- Owner can waive Month 2 without a payment
select lives_ok(
  $$
    update rent_invoices
       set status = 'waived'
     where booking_id = '00000000-0000-0000-0000-000000000701'
       and period_start = '2026-02-01'
  $$,
  'An owner can waive a month without a payment'
);

-- ============================================================================
-- 5. Extending rent schedule (extend_rent_schedule in 0011_extend_rent.sql)
-- ============================================================================
-- Authenticate as Renter
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000202","role":"authenticated"}', true);

select throws_ok(
  $$ select extend_rent_schedule('00000000-0000-0000-0000-000000000701', 12) $$,
  '42501',
  'Only the owner can extend a rent schedule.',
  'A renter cannot extend the rent schedule'
);

-- Authenticate as Owner and extend twice
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}', true);

select is(
  extend_rent_schedule('00000000-0000-0000-0000-000000000701', 12),
  12,
  'Owner can extend the rent schedule by 12 months'
);

select is(
  extend_rent_schedule('00000000-0000-0000-0000-000000000701', 6),
  6,
  'Owner can extend the rent schedule a second time by 6 months'
);

select is(
  (select count(*)::integer from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701'),
  21,
  'Extending twice (3 + 12 + 6) produces 21 distinct monthly invoices with no duplicates'
);

select is(
  (select max(period_start) from rent_invoices where booking_id = '00000000-0000-0000-0000-000000000701'),
  '2027-09-01'::date,
  '21 consecutive monthly periods starting 2026-01-01 end on 2027-09-01 with no gaps'
);

select * from finish();
rollback;
