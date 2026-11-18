create or replace function private.arcany_owner_signup_provision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization_id uuid;
begin
  if lower(coalesce(new.email, '')) <> 'wchagas73@gmail.com' then
    raise exception 'Arcany Digital only permits the configured owner account.';
  end if;

  select id into v_organization_id
    from public.organizations
   where slug = 'arcany-digital'
   limit 1;

  if v_organization_id is null then
    insert into public.organizations (name, slug)
    values ('Arcany Digital', 'arcany-digital')
    returning id into v_organization_id;
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_organization_id, new.id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.arcany_owner_signup_provision() from public, anon, authenticated;

drop trigger if exists arcany_owner_signup_guard on auth.users;
create trigger arcany_owner_signup_guard
  after insert on auth.users
  for each row
  execute function private.arcany_owner_signup_provision();
