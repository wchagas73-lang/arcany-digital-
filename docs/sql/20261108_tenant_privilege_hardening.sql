-- Arcany Digital — hardening of tenant privileges.
-- Target project: kiwhtyuqgvcczwtafzcn (Arcany Digital) ONLY.
-- This script is NOT applied by this repository commit.
-- Review and apply only to the Arcany project after the authentication test plan is approved.
-- It does not create sample users/data and does not include the optional storefront migration.

begin;

-- RLS filters rows, but it does not govern TRUNCATE. Remove broad anon grants
-- from current private SaaS tables and retain row-level CRUD only for authenticated users.
revoke all privileges on all tables in schema public from anon;
revoke truncate, references, trigger, maintain on all tables in schema public from authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- No public sequences exist today, but secure existing/future sequences too.
-- Authenticated keeps USAGE/SELECT for normal serial defaults; anon gets none.
revoke all privileges on all sequences in schema public from anon;
revoke update on all sequences in schema public from authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Prevent future public-schema tables/sequences created by either migration owner
-- from inheriting broad anon grants or non-row-level privileges.
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

alter default privileges for role supabase_admin in schema public
  revoke all on tables from anon;
alter default privileges for role supabase_admin in schema public
  revoke truncate, references, trigger, maintain on tables from authenticated;
alter default privileges for role supabase_admin in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges for role supabase_admin in schema public
  revoke all on sequences from anon;
alter default privileges for role supabase_admin in schema public
  revoke update on sequences from authenticated;
alter default privileges for role supabase_admin in schema public
  grant usage, select on sequences to authenticated;

-- New RPC functions must receive explicit EXECUTE grants in their own migration.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema private
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role supabase_admin in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role supabase_admin in schema private
  revoke execute on functions from public, anon, authenticated;

-- The current application model resolves exactly one organization per user.
-- This also closes the race where two simultaneous bootstrap calls could pass
-- the "no membership yet" check and create two organizations for the same user.
create unique index if not exists organization_members_one_org_per_user_uidx
  on public.organization_members(user_id);

commit;
