begin;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  restaurant_id uuid references public.restaurants (id) on delete set null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deactivated_at timestamptz
);

create table if not exists public.notification_broadcasts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  sent_by_profile_id uuid references public.profiles (id) on delete set null,
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  target_scope text not null default 'members',
  total_subscribers integer not null default 0,
  total_sent integer not null default 0,
  total_failed integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  broadcast_id uuid not null references public.notification_broadcasts (id) on delete cascade,
  subscription_id uuid references public.push_subscriptions (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  status text not null check (status in ('sent', 'failed')),
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists push_subscriptions_profile_idx on public.push_subscriptions (profile_id);
create index if not exists push_subscriptions_restaurant_idx on public.push_subscriptions (restaurant_id);
create index if not exists push_subscriptions_active_idx on public.push_subscriptions (is_active);
create index if not exists notification_broadcasts_restaurant_idx on public.notification_broadcasts (restaurant_id);
create index if not exists notification_dispatch_logs_broadcast_idx on public.notification_dispatch_logs (broadcast_id);

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists notification_broadcasts_set_updated_at on public.notification_broadcasts;
create trigger notification_broadcasts_set_updated_at
before update on public.notification_broadcasts
for each row execute function public.set_updated_at();

alter table public.push_subscriptions enable row level security;
alter table public.notification_broadcasts enable row level security;
alter table public.notification_dispatch_logs enable row level security;

create policy push_subscriptions_select_owner_or_staff
  on public.push_subscriptions for select
  using (
    profile_id = auth.uid()
    or (restaurant_id is not null and public.is_restaurant_staff(restaurant_id))
  );

create policy push_subscriptions_insert_owner_or_staff
  on public.push_subscriptions for insert
  with check (
    profile_id = auth.uid()
    or (restaurant_id is not null and public.is_restaurant_staff(restaurant_id))
  );

create policy push_subscriptions_update_owner_or_staff
  on public.push_subscriptions for update
  using (
    profile_id = auth.uid()
    or (restaurant_id is not null and public.is_restaurant_staff(restaurant_id))
  )
  with check (
    profile_id = auth.uid()
    or (restaurant_id is not null and public.is_restaurant_staff(restaurant_id))
  );

create policy notification_broadcasts_select_staff
  on public.notification_broadcasts for select
  using (public.is_restaurant_staff(restaurant_id));

create policy notification_broadcasts_insert_staff
  on public.notification_broadcasts for insert
  with check (public.is_restaurant_staff(restaurant_id));

create policy notification_dispatch_logs_select_staff
  on public.notification_dispatch_logs for select
  using (
    exists (
      select 1
      from public.notification_broadcasts nb
      where nb.id = broadcast_id
        and public.is_restaurant_staff(nb.restaurant_id)
    )
  );

create policy notification_dispatch_logs_insert_staff
  on public.notification_dispatch_logs for insert
  with check (
    exists (
      select 1
      from public.notification_broadcasts nb
      where nb.id = broadcast_id
        and public.is_restaurant_staff(nb.restaurant_id)
    )
  );

commit;
