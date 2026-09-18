-- ============================================================================
-- HABITO — stage 8: the review queue
--
-- Stage 6 built the machinery that flags things: reports that hide a listing,
-- duplicate detection, trust tiers. None of it could be acted on, so a flagged
-- listing stayed flagged and nobody could clear it. This adds the actions, and
-- an audit trail — because moderation without a record of who did what is how
-- a platform loses an argument it should win.
-- ============================================================================

-- ── 1. Audit trail ──────────────────────────────────────────────────────────
-- Append-only. Even an admin cannot edit or delete a past action; the whole
-- value of the record is that it cannot be tidied afterwards.

create table if not exists moderation_actions (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references profiles (id),
  action      text not null check (action in (
                'listing-approved', 'listing-hidden', 'listing-restored',
                'owner-reviewed', 'owner-phone-verified', 'owner-tier-reset',
                'report-resolved', 'report-dismissed', 'duplicate-cleared'
              )),
  subject_type text not null check (subject_type in ('space', 'profile', 'report')),
  subject_id   uuid not null,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists moderation_subject_idx on moderation_actions (subject_type, subject_id, created_at desc);

alter table moderation_actions enable row level security;

drop policy if exists moderation_admin_read on moderation_actions;
create policy moderation_admin_read on moderation_actions for select using (is_admin());

drop policy if exists moderation_admin_insert on moderation_actions;
create policy moderation_admin_insert on moderation_actions for insert
  with check (is_admin() and actor_id = auth.uid());

-- No update or delete policy exists, so neither is possible for anyone.

-- ── 2. What the queue needs to show ─────────────────────────────────────────
-- A view rather than a query in the client, so the definition of "needs
-- attention" lives in one place.

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
    -- Ordering: something hidden by reports is more urgent than a listing that
    -- merely looks thin.
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
  where s.is_seed is not true
    and (
      s.hidden_at is not null
      or s.flagged_duplicate
      or exists (select 1 from reports r where r.space_id = s.id and r.status = 'open')
      or o.trust = 'unverified'
    );

-- ── 3. The actions ──────────────────────────────────────────────────────────
-- Each one writes its own audit row, so the record cannot be skipped by
-- forgetting to write it separately.

create or replace function admin_set_listing_visible(target uuid, visible boolean, why text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Only an administrator can do that.' using errcode = 'insufficient_privilege';
  end if;

  if visible then
    update spaces set hidden_at = null, hidden_reason = null where id = target;
  else
    update spaces
       set hidden_at = coalesce(hidden_at, now()),
           hidden_reason = coalesce(why, 'Hidden by a reviewer.')
     where id = target;
  end if;

  insert into moderation_actions (actor_id, action, subject_type, subject_id, note)
  values (auth.uid(), case when visible then 'listing-restored' else 'listing-hidden' end,
          'space', target, why);
end;
$$;

create or replace function admin_set_trust(target uuid, tier trust_tier, why text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Only an administrator can do that.' using errcode = 'insufficient_privilege';
  end if;

  -- id-verified is reserved for real eKYC, which is unavailable to us. Setting
  -- it by hand would make the badge a lie, which is the one thing the tiers
  -- exist to prevent.
  if tier = 'id-verified' then
    raise exception 'id-verified is reserved for formal identity verification, which Habito cannot perform.'
      using errcode = 'check_violation';
  end if;

  update profiles
     set trust = tier,
         reviewed_at = case when tier = 'reviewed' then now() else reviewed_at end,
         phone_verified_at = case when tier = 'phone-verified' then now() else phone_verified_at end,
         review_note = why
   where id = target;

  insert into moderation_actions (actor_id, action, subject_type, subject_id, note)
  values (auth.uid(),
          case tier
            when 'reviewed' then 'owner-reviewed'
            when 'phone-verified' then 'owner-phone-verified'
            else 'owner-tier-reset'
          end,
          'profile', target, why);
end;
$$;

create or replace function admin_resolve_reports(target uuid, dismiss boolean, why text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Only an administrator can do that.' using errcode = 'insufficient_privilege';
  end if;

  update reports
     set status = case when dismiss then 'dismissed' else 'actioned' end
   where space_id = target and status = 'open';

  -- Dismissing means the reports were wrong, so the listing goes back up.
  if dismiss then
    update spaces set hidden_at = null, hidden_reason = null where id = target;
  end if;

  insert into moderation_actions (actor_id, action, subject_type, subject_id, note)
  values (auth.uid(), case when dismiss then 'report-dismissed' else 'report-resolved' end,
          'space', target, why);
end;
$$;

create or replace function admin_clear_duplicate(target uuid, why text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Only an administrator can do that.' using errcode = 'insufficient_privilege';
  end if;

  update spaces set flagged_duplicate = false where id = target;

  insert into moderation_actions (actor_id, action, subject_type, subject_id, note)
  values (auth.uid(), 'duplicate-cleared', 'space', target, why);
end;
$$;

-- ── 4. Admins can see what they are reviewing ───────────────────────────────

drop policy if exists spaces_admin_read on spaces;
create policy spaces_admin_read on spaces for select using (is_admin());

drop policy if exists reports_admin_read on reports;
create policy reports_admin_read on reports for select using (is_admin());

drop policy if exists reports_admin_update on reports;
create policy reports_admin_update on reports for update using (is_admin());

-- Anyone signed in can file a report; nobody can file one as someone else.
drop policy if exists reports_insert_own on reports;
create policy reports_insert_own on reports for insert
  with check (reporter_id = auth.uid());

grant select on review_queue to authenticated;
