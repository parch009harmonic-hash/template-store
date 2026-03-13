begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

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

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'admin_role'
  ) then
    create type public.admin_role as enum ('staff', 'admin', 'owner');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'membership_tier'
  ) then
    create type public.membership_tier as enum ('bronze', 'silver', 'gold', 'platinum');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'membership_status'
  ) then
    create type public.membership_status as enum ('active', 'inactive', 'blocked');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'promo_discount_type'
  ) then
    create type public.promo_discount_type as enum ('percentage', 'fixed_amount', 'free_item');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'lucky_draw_status'
  ) then
    create type public.lucky_draw_status as enum ('pending', 'won', 'lost', 'claimed');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'lucky_draw_campaign_status'
  ) then
    create type public.lucky_draw_campaign_status as enum ('active', 'inactive');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'notification_type'
  ) then
    create type public.notification_type as enum ('general', 'promo', 'membership', 'system');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  phone text,
  avatar_url text,
  default_restaurant_id uuid,
  app_role public.app_user_role not null default 'customer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null,
  name text not null,
  slug citext not null,
  description text,
  phone text,
  address text,
  timezone text not null default 'Asia/Bangkok',
  currency_code text not null default 'THB',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  category_id uuid,
  name text not null,
  description text,
  price numeric(12, 2) not null default 0,
  image_url text,
  sku text,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  title text not null,
  description text,
  discount_type public.promo_discount_type not null,
  discount_value numeric(12, 2) not null default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  profile_id uuid not null,
  tier public.membership_tier not null default 'bronze',
  status public.membership_status not null default 'active',
  points integer not null default 0,
  joined_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.lucky_draw_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.lucky_draw_campaign_status not null default 'inactive',
  entry_cost_points integer not null default 0,
  max_entries_per_member integer not null default 1,
  max_total_entries integer,
  min_membership_tier public.membership_tier not null default 'bronze',
  requires_active_membership boolean not null default true,
  total_entries integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.lucky_draw_entries (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  membership_id uuid,
  profile_id uuid not null,
  lucky_draw_campaign_id uuid,
  points_spent integer not null default 0,
  draw_date timestamptz,
  status public.lucky_draw_status not null default 'pending',
  won_prize text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  profile_id uuid not null,
  type public.notification_type not null default 'general',
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  restaurant_id uuid,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deactivated_at timestamptz
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  profile_id uuid not null,
  role public.admin_role not null default 'staff',
  is_active boolean not null default true,
  invited_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  actor_profile_id uuid,
  actor_admin_user_id uuid,
  action text not null,
  entity_table text not null,
  entity_id text not null,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_broadcasts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null,
  sent_by_profile_id uuid,
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  target_scope text not null default 'all',
  total_subscribers integer not null default 0,
  total_sent integer not null default 0,
  total_failed integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  broadcast_id uuid not null,
  subscription_id uuid,
  profile_id uuid,
  status text not null default 'sent',
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

commit;
