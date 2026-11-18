-- The Arcany workspace is private and no longer supports self-service organization creation.
-- The initial owner workspace is provisioned by the restricted Auth trigger.
revoke all on function public.bootstrap_organization(text) from public;
revoke all on function public.bootstrap_organization(text) from anon;
revoke all on function public.bootstrap_organization(text) from authenticated;
