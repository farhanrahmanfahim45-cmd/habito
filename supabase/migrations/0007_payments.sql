-- ============================================================================
-- HABITO — stage 7: rent, payments and receipts
--
-- A note on what this is and is not.
--
-- SSLCommerz authenticates with a store id and store password. Those cannot
-- live in a browser bundle, so a real payment has to be initiated by something
-- server-side — a Supabase Edge Function — which then writes back here. Going
-- live also needs a trade licence and a company bank account, neither of which
-- a student project has.
--
-- So what this migration builds is everything that is *not* the gateway call:
-- the rent ledger, invoice generation, receipts, and the rules that keep them
-- honest. The gateway step is simulated in the app and clearly labelled. When
-- the Edge Function exists it writes to `payments` exactly as the simulation
-- does, and nothing else changes.
-- ============================================================================

do $$ begin
  create type invoice_status as enum ('due', 'paid', 'overdue', 'waived', 'cancelled');
exception when duplicate_object then null;
end $$;

-- ── 1. The rent ledger ──────────────────────────────────────────────────────
-- One row per month of a confirmed booking. A renter with no paper trail has
-- no proof of payment, which in Bangladesh is worth more than the automation.

create table if not exists rent_invoices (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references bookings (id) on delete cascade,
  space_id     uuid not null references spaces (id) on delete cascade,
  renter_id    uuid not null references profiles (id) on delete cascade,
  owner_id     uuid not null references profiles (id) on delete cascade,

  /** Which month this covers. */
  period_start date not null,
  period_end   date not null,
  due_date     date not null,

  amount       integer not null check (amount >= 0),
  status       invoice_status not null default 'due',

  /** Set when the invoice is settled. */
  paid_at      timestamptz,
  payment_id   uuid references payments (id),
  /** Human-readable, shown on the receipt. */
  receipt_no   text unique,
  note         text,

  created_at   timestamptz not null default now(),

  unique (booking_id, period_start)
);

create index if not exists rent_invoices_renter_idx on rent_invoices (renter_id, due_date);
create index if not exists rent_invoices_owner_idx on rent_invoices (owner_id, due_date);
create index if not exists rent_invoices_status_idx on rent_invoices (status, due_date);

alter table rent_invoices enable row level security;

drop policy if exists invoices_participant_read on rent_invoices;
create policy invoices_participant_read on rent_invoices for select
  using (renter_id = auth.uid() or owner_id = auth.uid() or can_manage_space(space_id) or is_admin());

-- Owners can adjust their own ledger — waive a month, correct an amount — but
-- nobody can mark an invoice paid by hand. That only happens through a
-- successful payment, so a receipt always has a payment behind it.
drop policy if exists invoices_owner_write on rent_invoices;
create policy invoices_owner_write on rent_invoices for update
  using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid() or is_admin());

create or replace function guard_invoice_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and old.status <> 'paid' then
    if new.payment_id is null then
      raise exception 'An invoice can only be marked paid by a successful payment.'
        using errcode = 'check_violation';
    end if;

    if not exists (
      select 1 from payments p
      where p.id = new.payment_id and p.status = 'successful' and p.amount >= new.amount
    ) then
      raise exception 'That payment did not succeed, or does not cover this invoice.'
        using errcode = 'check_violation';
    end if;

    new.paid_at := coalesce(new.paid_at, now());
    new.receipt_no := coalesce(new.receipt_no, next_receipt_no());
  end if;

  return new;
end;
$$;

-- ── 2. Receipt numbers ──────────────────────────────────────────────────────
-- Sequential and human-quotable: HAB-2026-000123.

create sequence if not exists receipt_seq start 1;

create or replace function next_receipt_no()
returns text language sql volatile as $$
  select 'HAB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('receipt_seq')::text, 6, '0');
$$;

drop trigger if exists invoices_guard on rent_invoices;
create trigger invoices_guard
  before update on rent_invoices
  for each row execute function guard_invoice_update();

-- ── 3. Invoices appear when a booking is confirmed ──────────────────────────

create or replace function generate_rent_schedule()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  i integer;
  start_date date;
begin
  if new.status <> 'confirmed' or old.status = 'confirmed' then
    return new;
  end if;

  -- A sale is a single transaction, not a monthly ledger.
  if exists (select 1 from spaces where id = new.space_id and transaction = 'sale') then
    return new;
  end if;

  for i in 0 .. greatest(new.months, 1) - 1 loop
    start_date := (new.move_in_date + (i || ' months')::interval)::date;

    insert into rent_invoices (
      booking_id, space_id, renter_id, owner_id,
      period_start, period_end, due_date, amount
    )
    values (
      new.id, new.space_id, new.renter_id, new.owner_id,
      start_date,
      (start_date + interval '1 month' - interval '1 day')::date,
      -- Rent here is due on the day the month starts, which is the common
      -- arrangement. Owners can move a due date afterwards.
      start_date,
      new.amount
    )
    on conflict (booking_id, period_start) do nothing;
  end loop;

  return new;
end;
$$;

drop trigger if exists bookings_generate_schedule on bookings;
create trigger bookings_generate_schedule
  after update on bookings
  for each row execute function generate_rent_schedule();

-- ── 4. Payments ─────────────────────────────────────────────────────────────

alter table payments
  add column if not exists invoice_id uuid references rent_invoices (id) on delete set null,
  add column if not exists kind text not null default 'rent'
    check (kind in ('rent', 'deposit', 'advance', 'fee')),
  add column if not exists simulated boolean not null default false;

comment on column payments.simulated is
  'True for payments made through the in-app sandbox rather than a real gateway. Never clear this by hand — a real payment is one a gateway confirmed.';

create index if not exists payments_booking_idx on payments (booking_id, created_at desc);

drop policy if exists payments_participant_read on payments;
create policy payments_participant_read on payments for select
  using (
    user_id = auth.uid()
    or exists (select 1 from bookings b where b.id = booking_id and (b.owner_id = auth.uid() or b.renter_id = auth.uid()))
    or is_admin()
  );

drop policy if exists payments_renter_insert on payments;
create policy payments_renter_insert on payments for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from bookings b where b.id = booking_id and b.renter_id = auth.uid())
  );

-- A payment is raised as pending and only a gateway result settles it. The
-- client cannot declare its own payment successful.
create or replace function guard_payment_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'pending' then
    raise exception 'A payment starts as pending; only the gateway can settle it.'
      using errcode = 'check_violation';
  end if;

  if new.amount <= 0 then
    raise exception 'A payment must be for more than zero.' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_guard_insert on payments;
create trigger payments_guard_insert
  before insert on payments
  for each row execute function guard_payment_insert();

-- ── 5. A settled payment moves everything else along ────────────────────────

create or replace function settle_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'successful' then
    -- Mark the invoice paid. The guard above re-checks the payment, so this
    -- cannot be used to settle an invoice the payment doesn't cover.
    if new.invoice_id is not null then
      update rent_invoices
         set status = 'paid', payment_id = new.id
       where id = new.invoice_id and status <> 'paid';
    end if;

    -- A deposit or advance paid against a booking awaiting payment confirms it.
    update bookings
       set status = 'confirmed'
     where id = new.booking_id and status = 'payment-pending';
  end if;

  if new.status = 'failed' then
    update bookings
       set status = 'payment-failed'
     where id = new.booking_id and status = 'payment-pending';
  end if;

  return new;
end;
$$;

drop trigger if exists payments_settle on payments;
create trigger payments_settle
  after update on payments
  for each row execute function settle_payment();

-- ── 6. Overdue is a fact, not a status someone sets ─────────────────────────

create or replace function mark_overdue_invoices()
returns integer language sql volatile security definer set search_path = public as $$
  with updated as (
    update rent_invoices
       set status = 'overdue'
     where status = 'due' and due_date < current_date
     returning 1
  )
  select count(*)::integer from updated;
$$;

comment on function mark_overdue_invoices is
  'Run on a schedule, or called by the app on load. Kept as a function so the rule lives in one place.';
