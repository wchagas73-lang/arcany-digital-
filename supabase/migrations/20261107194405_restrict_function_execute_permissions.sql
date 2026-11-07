-- Restrict helper and bootstrap function execution to authenticated users only.
revoke all on function public.bootstrap_organization(text) from public, anon, authenticated;
grant execute on function public.bootstrap_organization(text) to authenticated;

revoke all on function public.is_org_member(uuid) from public, anon, authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
