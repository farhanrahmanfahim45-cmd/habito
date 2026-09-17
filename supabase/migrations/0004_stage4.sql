-- ============================================================================
-- HABITO — stage 4
--
-- One account, one navigation. `can_own` is no longer consulted by the
-- interface: everyone sees owner tools, and whether a write succeeds is
-- decided by row-level security, which was always the honest place for it.
--
-- The column stays for now so nothing breaks mid-deploy, but it is no longer
-- a gate. It becomes a hint only: "has this person ever listed anything".
-- ============================================================================

comment on column profiles.can_own is
  'Legacy hint. Not an authorisation check — ownership is properties.owner_id.';

-- Everyone gets owner tools. There is nothing to grant.
update profiles set can_own = true where not is_seed;

-- Notification preferences. Email is out of scope for now, so these govern
-- in-app notifications only; the shape leaves room for channels later.
alter table profiles
  add column if not exists notify jsonb not null default
    '{"messages": true, "inquiries": true, "availability": true}'::jsonb;

-- ── Archiving ───────────────────────────────────────────────────────────────
-- A space that is let but may come back should disappear from search without
-- taking its conversations with it. Deleting a listing cascades to messages,
-- so archiving is the default and deletion is reserved for listings nobody
-- has ever contacted.

create or replace function space_has_history(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from conversations where space_id = target)
      or exists (select 1 from bookings where space_id = target);
$$;

comment on function space_has_history is
  'True when a space carries conversations or bookings. Such a space is archived, never deleted.';

-- Refuse the destructive path in the database rather than only in the UI.
create or replace function guard_space_deletion()
returns trigger language plpgsql as $$
begin
  if space_has_history(old.id) then
    raise exception 'This space has conversations attached. Archive it instead of deleting it.'
      using errcode = 'restrict_violation';
  end if;
  return old;
end;
$$;

drop trigger if exists spaces_guard_delete on spaces;
create trigger spaces_guard_delete
  before delete on spaces
  for each row execute function guard_space_deletion();

-- Archived listings stay readable to their owner and to anyone already in a
-- conversation about them, so old threads keep their context.
drop policy if exists spaces_read on spaces;
create policy spaces_read on spaces for select
  using (
    status = 'published'
    or owns_space(id)
    or is_admin()
    or exists (
      select 1 from conversations c
      where c.space_id = spaces.id
        and (c.renter_id = auth.uid() or c.owner_id = auth.uid())
    )
  );
