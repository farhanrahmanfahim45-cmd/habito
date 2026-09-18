-- ============================================================================
-- HABITO — stage 9: Bangla listings
--
-- The interface was already translated, but the listings inside it were not.
-- A Bangla frame around English listings reads worse than either language on
-- its own, and it is the surface a Bangladeshi user spends the most time on.
--
-- Seed listings carry a translation because they are generated. Listings a
-- real owner writes stay in whatever language they wrote them: translating a
-- person's own words on their behalf would be worse than leaving them.
-- ============================================================================

alter table spaces
  add column if not exists name_bn text,
  add column if not exists description_bn text;

comment on column spaces.name_bn is
  'Bangla name. Present for generated seed listings; null for anything an owner wrote, which is shown as written.';
