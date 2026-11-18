-- Arcany Digital: tenant privilege hardening.
-- Target project: kiwhtyuqgvcczwtafzcn ONLY.
-- Apply with the Supabase SQL editor / authorized postgres connection.
-- This script intentionally changes defaults only for objects created by postgres.
-- The connected database role cannot alter supabase_admin default privileges.
-- No sample data is created and no optional storefront migration is included.

begin;

-- RLS filters rows, but does not govern TRUNCATE. Remove broad anon grants
-- from current public tables and retain row-level CRUD only for authenticated users.
revoke all privileges on all tables in schema public from anon;
revoke truncate, references, trigger, maintain on all tables in schema public from authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Secure current/future public sequences owned by postgres.
revoke all privileges on all sequences in schema public from anon;
revoke update on all sequences in schema public from authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Future public-schema tables/sequences created by postgres.
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger, maintain on tables from authenticated;
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
alter default privileges for role postgres in schema public
  revoke update on sequences from authenticated;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to authenticated;

-- New RPC functions must receive explicit EXECUTE grants in their own migration.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated;

-- One organization per user, preventing concurrent duplicate bootstrap.
create unique index if not exists organization_members_one_org_per_user_uidx
  on public.organization_members(user_id);

commit;
