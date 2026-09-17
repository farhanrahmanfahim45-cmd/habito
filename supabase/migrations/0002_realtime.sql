-- ============================================================================
-- HABITO — enable live message delivery.
--
-- Supabase broadcasts changes only for tables added to this publication, and
-- only sends a row to a client whose row-level security policies allow reading
-- it. So a viewer is notified about their own threads and nothing else.
--
-- The app also polls slowly as a fallback, so messages still arrive if the
-- socket drops or this migration hasn't been run.
-- ============================================================================

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- Replica identity full makes the previous row available on updates, which is
-- what lets read receipts propagate rather than only new messages.
alter table messages replica identity full;
alter table conversations replica identity full;
