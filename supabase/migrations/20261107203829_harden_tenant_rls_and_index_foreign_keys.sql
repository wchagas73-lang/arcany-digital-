-- Arcany Digital: move the tenant membership helper out of the exposed API schema,
-- keep the self-service organization bootstrap guarded, and index foreign keys.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_org
      and m.user_id = (select auth.uid())
  );
$function$;

revoke all on function private.is_org_member(uuid) from public, anon;
grant execute on function private.is_org_member(uuid) to authenticated;

drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
for select to authenticated
using (private.is_org_member(id));

drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations
for update to authenticated
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = id
      and m.user_id = (select auth.uid())
      and m.role in ('owner','admin')
  )
)
with check (private.is_org_member(id));

drop policy if exists member_select on public.organization_members;
create policy member_select on public.organization_members
for select to authenticated
using (private.is_org_member(organization_id));

drop policy if exists org_isolation on public.companies;
create policy org_isolation on public.companies for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.leads;
create policy org_isolation on public.leads for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.activities;
create policy org_isolation on public.activities for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.diagnostics;
create policy org_isolation on public.diagnostics for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.customers;
create policy org_isolation on public.customers for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.suppliers;
create policy org_isolation on public.suppliers for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.products;
create policy org_isolation on public.products for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.stock_movements;
create policy org_isolation on public.stock_movements for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.sales;
create policy org_isolation on public.sales for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.sale_items;
create policy org_isolation on public.sale_items for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.finance_entries;
create policy org_isolation on public.finance_entries for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.projects;
create policy org_isolation on public.projects for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));
drop policy if exists org_isolation on public.store_orders;
create policy org_isolation on public.store_orders for all to authenticated
using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

alter function public.bootstrap_organization(text) set search_path = pg_catalog;
revoke all on function public.is_org_member(uuid) from public, anon, authenticated;
drop function public.is_org_member(uuid);

create index if not exists activities_company_id_idx on public.activities(company_id);
create index if not exists activities_created_by_idx on public.activities(created_by);
create index if not exists activities_lead_id_idx on public.activities(lead_id);
create index if not exists customers_organization_id_idx on public.customers(organization_id);
create index if not exists diagnostics_company_id_idx on public.diagnostics(company_id);
create index if not exists diagnostics_organization_id_idx on public.diagnostics(organization_id);
create index if not exists finance_entries_sale_id_idx on public.finance_entries(sale_id);
create index if not exists leads_company_id_idx on public.leads(company_id);
create index if not exists projects_company_id_idx on public.projects(company_id);
create index if not exists projects_organization_id_idx on public.projects(organization_id);
create index if not exists sale_items_organization_id_idx on public.sale_items(organization_id);
create index if not exists sale_items_product_id_idx on public.sale_items(product_id);
create index if not exists sale_items_sale_id_idx on public.sale_items(sale_id);
create index if not exists sales_customer_id_idx on public.sales(customer_id);
create index if not exists stock_movements_created_by_idx on public.stock_movements(created_by);
create index if not exists stock_movements_product_id_idx on public.stock_movements(product_id);
create index if not exists store_orders_organization_id_idx on public.store_orders(organization_id);
create index if not exists store_orders_project_id_idx on public.store_orders(project_id);
create index if not exists suppliers_organization_id_idx on public.suppliers(organization_id);
