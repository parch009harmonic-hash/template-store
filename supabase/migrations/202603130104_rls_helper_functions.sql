begin;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_user_role'
  ) then
    create type public.app_user_role as enum ('customer', 'staff', 'admin');
  end if;
end $$;

alter table if exists public.profiles
  add column if not exists app_role public.app_user_role not null default 'customer';

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.has_minimum_app_role(required_role public.app_user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select coalesce(
      (to_jsonb(p) ->> 'app_role')::public.app_user_role,
      'customer'::public.app_user_role
    ) as app_role
    from public.profiles p
    where p.id = auth.uid()
      and p.deleted_at is null
  )
  select case
    when not exists (select 1 from me) then false
    when (select app_role from me) = 'admin' then true
    when (select app_role from me) = 'staff' and required_role in ('staff', 'customer') then true
    when (select app_role from me) = 'customer' and required_role = 'customer' then true
    else false
  end;
$$;

create or replace function public.is_restaurant_staff(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.deleted_at is null
      and r.owner_profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.admin_users au
    where au.restaurant_id = p_restaurant_id
      and au.profile_id = auth.uid()
      and au.is_active = true
      and au.deleted_at is null
      and au.role in ('staff', 'admin', 'owner')
  );
$$;

create or replace function public.is_restaurant_admin(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.deleted_at is null
      and r.owner_profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.admin_users au
    where au.restaurant_id = p_restaurant_id
      and au.profile_id = auth.uid()
      and au.is_active = true
      and au.deleted_at is null
      and au.role in ('admin', 'owner')
  );
$$;

create or replace function public.can_view_restaurant(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.deleted_at is null
      and r.is_active = true
  )
  or public.is_restaurant_staff(p_restaurant_id);
$$;

create or replace function public.ensure_profile_for_user(
  p_user_id uuid,
  p_email text default null,
  p_user_meta jsonb default '{}'::jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_full_name text;
  v_phone text;
  v_avatar_url text;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'cannot provision profile for another user';
  end if;

  v_full_name := nullif(trim(coalesce(p_user_meta ->> 'full_name', p_email, '')), '');
  v_phone := nullif(trim(coalesce(p_user_meta ->> 'phone', '')), '');
  v_avatar_url := nullif(trim(coalesce(p_user_meta ->> 'avatar_url', '')), '');

  insert into public.profiles (
    id,
    full_name,
    phone,
    avatar_url,
    app_role
  )
  values (
    p_user_id,
    v_full_name,
    v_phone,
    v_avatar_url,
    'customer'
  )
  on conflict (id) do update
    set full_name = coalesce(public.profiles.full_name, excluded.full_name),
        phone = coalesce(public.profiles.phone, excluded.phone),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
        updated_at = timezone('utc', now())
  returning * into v_profile;

  return v_profile;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_profile_for_user(
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  );
  return new;
end;
$$;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.has_minimum_app_role(public.app_user_role) to authenticated;
grant execute on function public.is_restaurant_staff(uuid) to authenticated;
grant execute on function public.is_restaurant_admin(uuid) to authenticated;
grant execute on function public.can_view_restaurant(uuid) to authenticated;

commit;
