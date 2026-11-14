-- Private client assets for Arcany production projects.
create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  file_path text not null unique,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 26214400),
  asset_type text not null default 'outro' check (asset_type in ('logo','foto','video','documento','outro')),
  created_at timestamptz not null default now()
);
create index if not exists project_assets_project_created_idx on public.project_assets(project_id, created_at desc);
alter table public.project_assets enable row level security;
drop policy if exists project_assets_org_isolation on public.project_assets;
create policy project_assets_org_isolation on public.project_assets for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('arcany-client-assets', 'arcany-client-assets', false, 26214400,
  array['image/jpeg','image/png','image/webp','application/pdf','video/mp4'])
on conflict (id) do update set public=false, file_size_limit=26214400, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists arcany_assets_select on storage.objects;
create policy arcany_assets_select on storage.objects for select to authenticated
using (bucket_id = 'arcany-client-assets' and exists (select 1 from public.organization_members m where m.user_id = (select auth.uid()) and m.organization_id::text = (storage.foldername(name))[1]));
drop policy if exists arcany_assets_insert on storage.objects;
create policy arcany_assets_insert on storage.objects for insert to authenticated
with check (bucket_id = 'arcany-client-assets' and exists (select 1 from public.organization_members m where m.user_id = (select auth.uid()) and m.organization_id::text = (storage.foldername(name))[1]));
drop policy if exists arcany_assets_update on storage.objects;
create policy arcany_assets_update on storage.objects for update to authenticated
using (bucket_id = 'arcany-client-assets' and exists (select 1 from public.organization_members m where m.user_id = (select auth.uid()) and m.organization_id::text = (storage.foldername(name))[1]))
with check (bucket_id = 'arcany-client-assets' and exists (select 1 from public.organization_members m where m.user_id = (select auth.uid()) and m.organization_id::text = (storage.foldername(name))[1]));
drop policy if exists arcany_assets_delete on storage.objects;
create policy arcany_assets_delete on storage.objects for delete to authenticated
using (bucket_id = 'arcany-client-assets' and exists (select 1 from public.organization_members m where m.user_id = (select auth.uid()) and m.organization_id::text = (storage.foldername(name))[1]));
