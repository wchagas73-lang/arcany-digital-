-- Arcany Digital: páginas públicas e pedidos online
create table if not exists public.public_storefronts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.public_storefronts enable row level security;
drop policy if exists storefront_public_read on public.public_storefronts;
create policy storefront_public_read on public.public_storefronts for select using (published = true);
drop policy if exists storefront_member_manage on public.public_storefronts;
create policy storefront_member_manage on public.public_storefronts for all
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
create index if not exists storefront_org_idx on public.public_storefronts(organization_id, created_at desc);
create index if not exists storefront_project_idx on public.public_storefronts(project_id);

-- Explicit privileges; row-level security still controls which rows are visible.
grant select on public.public_storefronts to anon, authenticated;
grant insert, update, delete on public.public_storefronts to authenticated;
grant select, insert, update on public.store_orders to authenticated;
