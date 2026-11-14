-- Arcany Digital: base multiempresa (PostgreSQL/Supabase)
-- Execute no SQL Editor do projeto Supabase antes de habilitar dados em nuvem.
create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);
create index if not exists organization_members_user_idx on public.organization_members(user_id);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.organization_members m where m.organization_id=target_org and m.user_id=auth.uid()) $$;

create or replace function public.bootstrap_organization(org_name text)
returns uuid language plpgsql security definer set search_path=public
as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'Autenticação necessária'; end if;
  if exists(select 1 from public.organization_members where user_id=auth.uid()) then
    raise exception 'Este usuário já pertence a uma organização';
  end if;
  if length(trim(coalesce(org_name,''))) < 2 then raise exception 'Informe o nome da organização'; end if;
  insert into public.organizations(name) values (trim(org_name)) returning id into new_id;
  insert into public.organization_members(organization_id,user_id,role) values(new_id,auth.uid(),'owner');
  return new_id;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, segment text, city text, state text, address text, phone text, email text, website text,
  google_status text not null default 'a_investigar', source text, source_url text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null, company_name text not null,
  contact_name text, phone text, email text, segment text, interest text,
  stage text not null default 'novo' check(stage in ('novo','contato','proposta','negociacao','cliente','perdido')),
  follow_up_at date, estimated_value numeric(14,2), notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade, lead_id uuid references public.leads(id) on delete cascade,
  kind text not null, title text not null, details text, due_at timestamptz, completed_at timestamptz,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade, website text, checked_at timestamptz,
  findings jsonb not null default '[]'::jsonb, confirmed_needs jsonb not null default '[]'::jsonb,
  investigation_items jsonb not null default '[]'::jsonb, recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, phone text, email text, document_ref text, notes text, created_at timestamptz not null default now()
);
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, tax_id text, phone text, email text, notes text, created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text, name text not null, description text, category text, unit text not null default 'un',
  cost_price numeric(14,2) not null default 0, sale_price numeric(14,2) not null default 0,
  min_stock numeric(14,3) not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,sku)
);
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict, movement_type text not null check(movement_type in ('entrada','saida','ajuste','perda','devolucao')),
  quantity numeric(14,3) not null check(quantity > 0), unit_cost numeric(14,2), reference text, notes text,
  lot_code text, expires_on date, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null, status text not null default 'rascunho',
  payment_method text, subtotal numeric(14,2) not null default 0, discount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0, notes text, sold_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade, product_id uuid references public.products(id) on delete set null,
  description text not null, quantity numeric(14,3) not null check(quantity > 0), unit_price numeric(14,2) not null,
  total numeric(14,2) generated always as (quantity * unit_price) stored
);
create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  entry_type text not null check(entry_type in ('receita','despesa')), description text not null,
  category text, amount numeric(14,2) not null check(amount > 0), due_on date, paid_at timestamptz,
  status text not null default 'aberto' check(status in ('aberto','pago','cancelado')),
  sale_id uuid references public.sales(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null, name text not null, solution_type text not null,
  status text not null default 'briefing', brief jsonb not null default '{}'::jsonb,
  preview_config jsonb not null default '{}'::jsonb, published_url text, created_at timestamptz not null default now()
);
create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null, customer_name text not null, customer_phone text,
  items jsonb not null default '[]'::jsonb, total numeric(14,2) not null default 0,
  status text not null default 'recebido', payment_status text not null default 'pendente',
  created_at timestamptz not null default now()
);

-- Isolamento por organização: nenhuma consulta pode atravessar organizações.
do $$
declare t text;
begin
 foreach t in array array['organizations','organization_members','companies','leads','activities','diagnostics','customers','suppliers','products','stock_movements','sales','sale_items','finance_entries','projects','store_orders']
 loop
   execute format('alter table public.%I enable row level security',t);
 end loop;
end $$;

drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations for select using (public.is_org_member(id));
drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations for update using (exists(select 1 from public.organization_members m where m.organization_id=id and m.user_id=auth.uid() and m.role in ('owner','admin'))) with check (public.is_org_member(id));
drop policy if exists member_select on public.organization_members;
create policy member_select on public.organization_members for select using (public.is_org_member(organization_id));

do $$
declare t text;
begin
 foreach t in array array['companies','leads','activities','diagnostics','customers','suppliers','products','stock_movements','sales','sale_items','finance_entries','projects','store_orders']
 loop
   execute format('drop policy if exists org_isolation on public.%I',t);
   execute format('create policy org_isolation on public.%I for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id))',t);
 end loop;
end $$;

create index if not exists companies_org_name_idx on public.companies(organization_id,name);
create index if not exists leads_org_stage_idx on public.leads(organization_id,stage);
create index if not exists activities_org_due_idx on public.activities(organization_id,due_at);
create index if not exists stock_movements_org_product_idx on public.stock_movements(organization_id,product_id,created_at desc);
create index if not exists finance_entries_org_due_idx on public.finance_entries(organization_id,due_on,status);
create index if not exists sales_org_date_idx on public.sales(organization_id,sold_at desc);
