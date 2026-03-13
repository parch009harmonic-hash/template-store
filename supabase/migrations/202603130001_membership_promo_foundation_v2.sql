begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -----------------------------------------------------------------------------
-- Role model (customer, staff, admin)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Core tables (id uuid pk + created_at/updated_at + foreign keys)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  default_restaurant_id uuid,
  app_role public.app_user_role not null default 'customer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  slug citext not null unique,
  timezone text not null default 'Asia/Bangkok',
  currency_code text not null default 'THB',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add constraint profiles_default_restaurant_id_fkey
  foreign key (default_restaurant_id) references public.restaurants (id) on delete set null;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  description text,
  discount_type text not null,
  discount_value numeric(12, 2) not null check (discount_value >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint promo_campaigns_period_check check (ends_at > starts_at)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  tier text not null default 'bronze',
  status text not null default 'active',
  points integer not null default 0 check (points >= 0),
  joined_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lucky_draw_entries (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  membership_id uuid references public.memberships (id) on delete set null,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  promo_campaign_id uuid references public.promo_campaigns (id) on delete set null,
  points_spent integer not null default 0 check (points_spent >= 0),
  status text not null default 'pending',
  won_prize text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  restaurant_id uuid references public.restaurants (id) on delete set null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('staff', 'admin', 'owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  actor_admin_user_id uuid references public.admin_users (id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- updated_at trigger (shared)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at before update on public.restaurants for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at before update on public.menu_items for each row execute function public.set_updated_at();
drop trigger if exists promo_campaigns_set_updated_at on public.promo_campaigns;
create trigger promo_campaigns_set_updated_at before update on public.promo_campaigns for each row execute function public.set_updated_at();
drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at before update on public.memberships for each row execute function public.set_updated_at();
drop trigger if exists lucky_draw_entries_set_updated_at on public.lucky_draw_entries;
create trigger lucky_draw_entries_set_updated_at before update on public.lucky_draw_entries for each row execute function public.set_updated_at();
drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();
drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions for each row execute function public.set_updated_at();
drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at before update on public.admin_users for each row execute function public.set_updated_at();
drop trigger if exists audit_logs_set_updated_at on public.audit_logs;
create trigger audit_logs_set_updated_at before update on public.audit_logs for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Access helper functions
-- -----------------------------------------------------------------------------
create or replace function public.is_restaurant_staff(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.restaurant_id = p_restaurant_id
      and au.profile_id = auth.uid()
      and au.is_active = true
      and au.role in ('staff', 'admin', 'owner')
  )
  or exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.owner_profile_id = auth.uid()
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
    from public.admin_users au
    where au.restaurant_id = p_restaurant_id
      and au.profile_id = auth.uid()
      and au.is_active = true
      and au.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.owner_profile_id = auth.uid()
  );
$$;

grant execute on function public.is_restaurant_staff(uuid) to authenticated;
grant execute on function public.is_restaurant_admin(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.promo_campaigns enable row level security;
alter table public.memberships enable row level security;
alter table public.lucky_draw_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

-- -----------------------------------------------------------------------------
-- Sample RLS policies + short reason
-- -----------------------------------------------------------------------------
drop policy if exists v2_profiles_select_own on public.profiles;
-- Reason: protect personal data; user reads only own profile.
create policy v2_profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists v2_profiles_update_own on public.profiles;
-- Reason: user can update only own profile.
create policy v2_profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists v2_restaurants_select_public_or_staff on public.restaurants;
-- Reason: public can see active restaurants; staff/admin can see own restaurant data.
create policy v2_restaurants_select_public_or_staff on public.restaurants
  for select using (is_active = true or public.is_restaurant_staff(id));

drop policy if exists v2_restaurants_manage_admin on public.restaurants;
-- Reason: only admin-level users manage restaurant settings.
create policy v2_restaurants_manage_admin on public.restaurants
  for all using (public.is_restaurant_admin(id)) with check (public.is_restaurant_admin(id));

drop policy if exists v2_categories_public_read_staff_manage on public.categories;
-- Reason: customers read active catalog; staff/admin maintain catalog.
create policy v2_categories_public_read_staff_manage on public.categories
  for select using (is_active = true or public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_categories_staff_write on public.categories;
create policy v2_categories_staff_write on public.categories
  for all using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_menu_items_public_read_staff_manage on public.menu_items;
-- Reason: customers read available menu; staff/admin curate menu.
create policy v2_menu_items_public_read_staff_manage on public.menu_items
  for select using (is_available = true or public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_menu_items_staff_write on public.menu_items;
create policy v2_menu_items_staff_write on public.menu_items
  for all using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_promo_campaigns_public_read_staff_manage on public.promo_campaigns;
-- Reason: customers see active campaigns only; staff/admin manage all campaign states.
create policy v2_promo_campaigns_public_read_staff_manage on public.promo_campaigns
  for select using (
    (is_active = true and now() between starts_at and ends_at)
    or public.is_restaurant_staff(restaurant_id)
  );

drop policy if exists v2_promo_campaigns_staff_write on public.promo_campaigns;
create policy v2_promo_campaigns_staff_write on public.promo_campaigns
  for all using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_memberships_owner_or_staff on public.memberships;
-- Reason: member sees own membership; staff/admin can operate members in own restaurant.
create policy v2_memberships_owner_or_staff on public.memberships
  for all using (profile_id = auth.uid() or public.is_restaurant_staff(restaurant_id))
  with check (profile_id = auth.uid() or public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_lucky_draw_entries_owner_or_staff on public.lucky_draw_entries;
-- Reason: member accesses own entries; staff/admin supervise campaign operations.
create policy v2_lucky_draw_entries_owner_or_staff on public.lucky_draw_entries
  for all using (profile_id = auth.uid() or public.is_restaurant_staff(restaurant_id))
  with check (profile_id = auth.uid() or public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_notifications_target_or_staff on public.notifications;
-- Reason: user reads own notifications; staff/admin can issue and manage notification records.
create policy v2_notifications_target_or_staff on public.notifications
  for all using (profile_id = auth.uid() or public.is_restaurant_staff(restaurant_id))
  with check (profile_id = auth.uid() or public.is_restaurant_staff(restaurant_id));

drop policy if exists v2_push_subscriptions_owner_or_staff on public.push_subscriptions;
-- Reason: user manages own browser subscriptions; staff/admin may help troubleshoot by restaurant.
create policy v2_push_subscriptions_owner_or_staff on public.push_subscriptions
  for all using (
    profile_id = auth.uid()
    or (restaurant_id is not null and public.is_restaurant_staff(restaurant_id))
  )
  with check (
    profile_id = auth.uid()
    or (restaurant_id is not null and public.is_restaurant_staff(restaurant_id))
  );

drop policy if exists v2_admin_users_admin_read_write on public.admin_users;
-- Reason: only admin-level users can grant/revoke back-office access.
create policy v2_admin_users_admin_read_write on public.admin_users
  for all using (public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists v2_audit_logs_admin_read_staff_insert on public.audit_logs;
-- Reason: staff can write audit trail; only admin can review full audit history.
create policy v2_audit_logs_admin_read_staff_insert on public.audit_logs
  for select using (public.is_restaurant_admin(restaurant_id));

drop policy if exists v2_audit_logs_staff_insert on public.audit_logs;
create policy v2_audit_logs_staff_insert on public.audit_logs
  for insert with check (public.is_restaurant_staff(restaurant_id));

commit;
