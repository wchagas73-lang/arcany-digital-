-- The Arcany workspace is private and no longer supports self-service organization creation.
-- The initial owner organization will be provisioned through a controlled administrative step.
revoke all on function public.bootstrap_organization(text) from public;
revoke all on function public.bootstrap_organization(text) from anon;
revoke all on function public.bootstrap_organization(text) from authenticated;
