drop policy if exists project_publications_public_read on public.project_publications;
drop policy if exists project_publications_org_manage on public.project_publications;
drop policy if exists project_publications_anon_read on public.project_publications;
drop policy if exists project_publications_authenticated_read on public.project_publications;
drop policy if exists project_publications_member_insert on public.project_publications;
drop policy if exists project_publications_member_update on public.project_publications;
drop policy if exists project_publications_member_delete on public.project_publications;

create policy project_publications_anon_read
  on public.project_publications for select to anon
  using (published = true);

create policy project_publications_authenticated_read
  on public.project_publications for select to authenticated
  using (published = true or private.is_org_member(organization_id));

create policy project_publications_member_insert
  on public.project_publications for insert to authenticated
  with check (private.is_org_member(organization_id));

create policy project_publications_member_update
  on public.project_publications for update to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

create policy project_publications_member_delete
  on public.project_publications for delete to authenticated
  using (private.is_org_member(organization_id));
