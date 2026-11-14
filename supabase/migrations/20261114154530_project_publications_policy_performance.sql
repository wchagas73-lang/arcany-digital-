drop policy if exists project_publications_public_read on public.project_publications;
create policy project_publications_public_read
  on public.project_publications
  for select
  to anon
  using (published = true);

create index if not exists project_assets_organization_id_idx
  on public.project_assets (organization_id);
