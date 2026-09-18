-- ============================================================================
-- HABITO — stage 10: putting listings on a map
--
-- Until now a property knew its area ("Badda") and neighbourhood, which is
-- enough to rank by distance but not to place a pin: every listing in Badda
-- would stack on the same point. So properties get their own coordinates.
--
-- They come from the owner dropping a pin, not from parsing an address.
-- Address parsing in Dhaka is unreliable — plot numbering is inconsistent and
-- the same road name repeats across thanas — and an owner moving a marker to
-- their own gate takes five seconds and is correct by construction.
-- ============================================================================

alter table properties
  add column if not exists latitude numeric(9, 6),
  add column if not exists longitude numeric(9, 6),
  -- How the point was arrived at. A pin an owner placed is worth more than a
  -- point scattered around an area centre, and the map should be able to say
  -- so rather than implying a precision it does not have.
  add column if not exists location_source text not null default 'area'
    check (location_source in ('area', 'pinned', 'verified'));

comment on column properties.location_source is
  'area = approximate, derived from the area centre. pinned = the owner placed it. verified = a reviewer confirmed it on the ground.';

create index if not exists properties_latlng_idx on properties (latitude, longitude)
  where latitude is not null;

-- Coordinates are part of the public listing, so no extra policy is needed —
-- the existing property read policy covers them.

-- Bounding-box lookup for the map. Doing this in the database keeps the client
-- from downloading every listing in the country to show one neighbourhood.
create or replace function spaces_in_bounds(
  min_lat numeric, min_lng numeric, max_lat numeric, max_lng numeric, limit_to integer default 300
)
returns table (
  space_id uuid,
  name text,
  category space_category,
  price integer,
  transaction transaction_type,
  availability availability_status,
  latitude numeric,
  longitude numeric,
  location_source text,
  area text
)
language sql stable as $$
  select s.id, s.name, s.category, s.price, s.transaction, s.availability,
         p.latitude, p.longitude, p.location_source, p.area
  from spaces s
  join properties p on p.id = s.property_id
  where s.status = 'published'
    and s.hidden_at is null
    and p.latitude between min_lat and max_lat
    and p.longitude between min_lng and max_lng
  order by s.updated_at desc
  limit limit_to;
$$;
