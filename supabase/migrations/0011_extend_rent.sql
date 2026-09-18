-- ============================================================================
-- HABITO — extending a rent schedule
--
-- The booking form caps the schedule at 24 months, and someone staying longer
-- than that is normal rather than exceptional. The answer is not a longer
-- dropdown: a tenancy here is open-ended, and raising 60 invoices on day one
-- would be pretending to know something nobody knows.
--
-- So the schedule is extended as it runs out, by the owner, a year at a time.
-- ============================================================================

create or replace function extend_rent_schedule(target_booking uuid, add_months integer default 12)
returns integer language plpgsql security definer set search_path = public as $$
declare
  b record;
  last_period date;
  i integer;
  made integer := 0;
  start_date date;
begin
  select * into b from bookings where id = target_booking;

  if b is null then
    raise exception 'That booking no longer exists.';
  end if;

  if not (b.owner_id = auth.uid() or can_manage_space(b.space_id) or is_admin()) then
    raise exception 'Only the owner can extend a rent schedule.'
      using errcode = 'insufficient_privilege';
  end if;

  if b.status <> 'confirmed' then
    raise exception 'Only a confirmed booking has a rent schedule to extend.'
      using errcode = 'check_violation';
  end if;

  if add_months < 1 or add_months > 24 then
    raise exception 'Extend by between 1 and 24 months at a time.'
      using errcode = 'check_violation';
  end if;

  -- Carry on from the last month already scheduled, so extending twice does
  -- not overlap or leave a gap.
  select max(period_start) into last_period from rent_invoices where booking_id = target_booking;
  if last_period is null then
    last_period := b.move_in_date;
  end if;

  for i in 1 .. add_months loop
    start_date := (last_period + (i || ' months')::interval)::date;

    insert into rent_invoices (
      booking_id, space_id, renter_id, owner_id,
      period_start, period_end, due_date, amount
    )
    values (
      b.id, b.space_id, b.renter_id, b.owner_id,
      start_date,
      (start_date + interval '1 month' - interval '1 day')::date,
      start_date,
      b.amount
    )
    on conflict (booking_id, period_start) do nothing;

    made := made + 1;
  end loop;

  -- Keep the booking's own count honest about what has been raised.
  update bookings
     set months = (select count(*) from rent_invoices where booking_id = target_booking)
   where id = target_booking;

  return made;
end;
$$;
