create table if not exists public.project_publications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null unique references public.projects(id) on delete cascade,
  slug text not null unique,
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists project_publications_org_idx
  on public.project_publications (organization_id);
create index if not exists project_publications_published_idx
  on public.project_publications (slug)
  where published = true;

alter table public.project_publications enable row level security;

grant select on public.project_publications to anon, authenticated;
grant insert, update, delete on public.project_publications to authenticated;

drop policy if exists project_publications_public_read on public.project_publications;
create policy project_publications_public_read
  on public.project_publications
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists project_publications_org_manage on public.project_publications;
create policy project_publications_org_manage
  on public.project_publications
  for all
  to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'arcany-published-media',
  'arcany-published-media',
  true,
  26214400,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists arcany_published_media_select on storage.objects;
create policy arcany_published_media_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'arcany-published-media'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = (select auth.uid())
        and m.organization_id::text = (storage.foldername(objects.name))[1]
    )
  );

drop policy if exists arcany_published_media_insert on storage.objects;
create policy arcany_published_media_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'arcany-published-media'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = (select auth.uid())
        and m.organization_id::text = (storage.foldername(objects.name))[1]
    )
  );

drop policy if exists arcany_published_media_update on storage.objects;
create policy arcany_published_media_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'arcany-published-media'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = (select auth.uid())
        and m.organization_id::text = (storage.foldername(objects.name))[1]
    )
  )
  with check (
    bucket_id = 'arcany-published-media'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = (select auth.uid())
        and m.organization_id::text = (storage.foldername(objects.name))[1]
    )
  );

drop policy if exists arcany_published_media_delete on storage.objects;
create policy arcany_published_media_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'arcany-published-media'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = (select auth.uid())
        and m.organization_id::text = (storage.foldername(objects.name))[1]
    )
  );
