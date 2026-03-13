begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.admin_role as enum ('staff', 'admin', 'owner');
create type public.membership_tier as enum ('bronze', 'silver', 'gold', 'platinum');
create type public.membership_status as enum ('active', 'inactive', 'blocked');
create type public.promo_discount_type as enum ('percentage', 'fixed_amount', 'free_item');
create type public.lucky_draw_status as enum ('pending', 'won', 'lost', 'claimed');
create type public.notification_type as enum ('general', 'promo', 'membership', 'system');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  default_restaurant_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  slug citext not null unique,
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
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index if not exists categories_unique_name_per_restaurant
  on public.categories (restaurant_id, lower(name))
  where deleted_at is null;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  sku text,
  sort_order integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index if not exists menu_items_unique_sku_per_restaurant
  on public.menu_items (restaurant_id, sku)
  where sku is not null and deleted_at is null;

create table if not exists public.promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  description text,
  discount_type public.promo_discount_type not null,
  discount_value numeric(12, 2) not null check (discount_value >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint promo_campaign_period_check check (ends_at > starts_at)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  tier public.membership_tier not null default 'bronze',
  status public.membership_status not null default 'active',
  points integer not null default 0 check (points >= 0),
  joined_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index if not exists memberships_unique_profile_per_restaurant
  on public.memberships (restaurant_id, profile_id)
  where deleted_at is null;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.admin_role not null,
  is_active boolean not null default true,
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index if not exists admin_users_unique_profile_per_restaurant
  on public.admin_users (restaurant_id, profile_id)
  where deleted_at is null;

create table if not exists public.lucky_draw_entries (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  membership_id uuid references public.memberships (id) on delete set null,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id uuid references public.promo_campaigns (id) on delete set null,
  ticket_no bigint generated always as identity,
  points_spent integer not null default 0 check (points_spent >= 0),
  draw_date timestamptz,
  status public.lucky_draw_status not null default 'pending',
  won_prize text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index if not exists lucky_draw_unique_ticket_per_restaurant
  on public.lucky_draw_entries (restaurant_id, ticket_no)
  where deleted_at is null;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null default 'general',
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
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
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists categories_restaurant_idx on public.categories (restaurant_id);
create index if not exists menu_items_restaurant_idx on public.menu_items (restaurant_id);
create index if not exists promo_campaigns_restaurant_idx on public.promo_campaigns (restaurant_id);
create index if not exists memberships_restaurant_idx on public.memberships (restaurant_id);
create index if not exists memberships_profile_idx on public.memberships (profile_id);
create index if not exists admin_users_restaurant_idx on public.admin_users (restaurant_id);
create index if not exists admin_users_profile_idx on public.admin_users (profile_id);
create index if not exists lucky_draw_entries_restaurant_idx on public.lucky_draw_entries (restaurant_id);
create index if not exists notifications_profile_idx on public.notifications (profile_id);
create index if not exists audit_logs_restaurant_idx on public.audit_logs (restaurant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists promo_campaigns_set_updated_at on public.promo_campaigns;
create trigger promo_campaigns_set_updated_at
before update on public.promo_campaigns
for each row execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
before update on public.memberships
for each row execute function public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists lucky_draw_entries_set_updated_at on public.lucky_draw_entries;
create trigger lucky_draw_entries_set_updated_at
before update on public.lucky_draw_entries
for each row execute function public.set_updated_at();

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

drop trigger if exists audit_logs_set_updated_at on public.audit_logs;
create trigger audit_logs_set_updated_at
before update on public.audit_logs
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

grant execute on function public.is_restaurant_staff(uuid) to authenticated;
grant execute on function public.is_restaurant_admin(uuid) to authenticated;
grant execute on function public.can_view_restaurant(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.promo_campaigns enable row level security;
alter table public.memberships enable row level security;
alter table public.lucky_draw_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id and deleted_at is null);

create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id and deleted_at is null)
  with check (auth.uid() = id);

create policy restaurants_select_visible
  on public.restaurants for select
  using (public.can_view_restaurant(id) and deleted_at is null);

create policy restaurants_insert_owner
  on public.restaurants for insert
  with check (owner_profile_id = auth.uid());

create policy restaurants_update_admin
  on public.restaurants for update
  using (public.is_restaurant_admin(id) and deleted_at is null)
  with check (public.is_restaurant_admin(id));

create policy categories_select_visible
  on public.categories for select
  using (
    deleted_at is null
    and (
      is_active = true
      or public.is_restaurant_staff(restaurant_id)
    )
    and public.can_view_restaurant(restaurant_id)
  );

create policy categories_insert_staff
  on public.categories for insert
  with check (public.is_restaurant_staff(restaurant_id));

create policy categories_update_staff
  on public.categories for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

create policy menu_items_select_visible
  on public.menu_items for select
  using (
    deleted_at is null
    and (
      is_available = true
      or public.is_restaurant_staff(restaurant_id)
    )
    and public.can_view_restaurant(restaurant_id)
  );

create policy menu_items_insert_staff
  on public.menu_items for insert
  with check (public.is_restaurant_staff(restaurant_id));

create policy menu_items_update_staff
  on public.menu_items for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

create policy promo_campaigns_select_visible
  on public.promo_campaigns for select
  using (
    deleted_at is null
    and (
      is_active = true
      or public.is_restaurant_staff(restaurant_id)
    )
    and public.can_view_restaurant(restaurant_id)
  );

create policy promo_campaigns_insert_staff
  on public.promo_campaigns for insert
  with check (public.is_restaurant_staff(restaurant_id));

create policy promo_campaigns_update_staff
  on public.promo_campaigns for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

create policy memberships_select_owner_or_staff
  on public.memberships for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

create policy memberships_insert_owner_or_staff
  on public.memberships for insert
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

create policy memberships_update_owner_or_staff
  on public.memberships for update
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  )
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

create policy lucky_draw_entries_select_owner_or_staff
  on public.lucky_draw_entries for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

create policy lucky_draw_entries_insert_owner_or_staff
  on public.lucky_draw_entries for insert
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

create policy lucky_draw_entries_update_staff
  on public.lucky_draw_entries for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

create policy notifications_select_target_or_staff
  on public.notifications for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

create policy notifications_insert_staff
  on public.notifications for insert
  with check (public.is_restaurant_staff(restaurant_id));

create policy notifications_update_target_or_staff
  on public.notifications for update
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  )
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

create policy admin_users_select_staff_and_self
  on public.admin_users for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

create policy admin_users_insert_admin
  on public.admin_users for insert
  with check (public.is_restaurant_admin(restaurant_id));

create policy admin_users_update_admin
  on public.admin_users for update
  using (deleted_at is null and public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

create policy audit_logs_select_admin
  on public.audit_logs for select
  using (public.is_restaurant_admin(restaurant_id));

create policy audit_logs_insert_staff
  on public.audit_logs for insert
  with check (public.is_restaurant_staff(restaurant_id));

commit;
