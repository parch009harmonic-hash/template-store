begin;

create type public.lucky_draw_campaign_status as enum ('active', 'inactive');

create table if not exists public.lucky_draw_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.lucky_draw_campaign_status not null default 'inactive',
  entry_cost_points integer not null default 0 check (entry_cost_points >= 0),
  max_entries_per_member integer not null default 1 check (max_entries_per_member > 0),
  max_total_entries integer check (max_total_entries > 0),
  min_membership_tier public.membership_tier not null default 'bronze',
  requires_active_membership boolean not null default true,
  total_entries integer not null default 0 check (total_entries >= 0),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint lucky_draw_campaign_period_check check (ends_at > starts_at)
);

create index if not exists lucky_draw_campaigns_restaurant_idx on public.lucky_draw_campaigns (restaurant_id);
create index if not exists lucky_draw_campaigns_status_idx on public.lucky_draw_campaigns (status);
create index if not exists lucky_draw_campaigns_window_idx on public.lucky_draw_campaigns (starts_at, ends_at);

alter table public.lucky_draw_entries
  add column if not exists lucky_draw_campaign_id uuid references public.lucky_draw_campaigns (id) on delete set null;

create index if not exists lucky_draw_entries_campaign_idx
  on public.lucky_draw_entries (lucky_draw_campaign_id, profile_id);

create or replace function public.membership_tier_rank(p_tier public.membership_tier)
returns integer
language sql
immutable
as $$
  select case p_tier
    when 'bronze' then 1
    when 'silver' then 2
    when 'gold' then 3
    when 'platinum' then 4
  end;
$$;

create or replace function public.validate_lucky_draw_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign public.lucky_draw_campaigns%rowtype;
  member public.memberships%rowtype;
  existing_entries integer;
begin
  if new.lucky_draw_campaign_id is null then
    raise exception 'Lucky draw campaign is required';
  end if;

  select *
    into campaign
    from public.lucky_draw_campaigns
   where id = new.lucky_draw_campaign_id
     and deleted_at is null
   for update;

  if not found then
    raise exception 'Lucky draw campaign not found';
  end if;

  if campaign.status <> 'active' then
    raise exception 'Lucky draw campaign is inactive';
  end if;

  if now() < campaign.starts_at or now() > campaign.ends_at then
    raise exception 'Lucky draw campaign is not in active date range';
  end if;

  if campaign.max_total_entries is not null and campaign.total_entries >= campaign.max_total_entries then
    raise exception 'Lucky draw campaign entry quota reached';
  end if;

  select *
    into member
    from public.memberships
   where restaurant_id = campaign.restaurant_id
     and profile_id = new.profile_id
     and deleted_at is null
   order by created_at desc
   limit 1
   for update;

  if campaign.requires_active_membership then
    if member.id is null then
      raise exception 'Active membership is required';
    end if;

    if member.status <> 'active' then
      raise exception 'Membership status must be active';
    end if;
  end if;

  if member.id is not null then
    if public.membership_tier_rank(member.tier) < public.membership_tier_rank(campaign.min_membership_tier) then
      raise exception 'Membership tier does not meet campaign requirement';
    end if;

    if campaign.entry_cost_points > 0 and member.points < campaign.entry_cost_points then
      raise exception 'Insufficient points for lucky draw entry';
    end if;
  elsif campaign.entry_cost_points > 0 then
    raise exception 'Membership with points is required for this campaign';
  end if;

  select count(*)::integer
    into existing_entries
    from public.lucky_draw_entries
   where lucky_draw_campaign_id = campaign.id
     and profile_id = new.profile_id
     and deleted_at is null;

  if existing_entries >= campaign.max_entries_per_member then
    raise exception 'Entry limit exceeded for this campaign';
  end if;

  new.restaurant_id := campaign.restaurant_id;
  new.membership_id := coalesce(new.membership_id, member.id);
  new.points_spent := campaign.entry_cost_points;
  new.status := coalesce(new.status, 'pending');
  return new;
end;
$$;

create or replace function public.apply_lucky_draw_entry_side_effects()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.membership_id is not null and new.points_spent > 0 then
    update public.memberships
       set points = greatest(points - new.points_spent, 0)
     where id = new.membership_id;
  end if;

  update public.lucky_draw_campaigns
     set total_entries = total_entries + 1
   where id = new.lucky_draw_campaign_id;

  return new;
end;
$$;

drop trigger if exists lucky_draw_campaigns_set_updated_at on public.lucky_draw_campaigns;
create trigger lucky_draw_campaigns_set_updated_at
before update on public.lucky_draw_campaigns
for each row execute function public.set_updated_at();

drop trigger if exists validate_lucky_draw_entry_before_insert on public.lucky_draw_entries;
create trigger validate_lucky_draw_entry_before_insert
before insert on public.lucky_draw_entries
for each row execute function public.validate_lucky_draw_entry();

drop trigger if exists apply_lucky_draw_entry_after_insert on public.lucky_draw_entries;
create trigger apply_lucky_draw_entry_after_insert
after insert on public.lucky_draw_entries
for each row execute function public.apply_lucky_draw_entry_side_effects();

alter table public.lucky_draw_campaigns enable row level security;

create policy lucky_draw_campaigns_select_visible
  on public.lucky_draw_campaigns for select
  using (
    deleted_at is null
    and (
      public.is_restaurant_staff(restaurant_id)
      or (
        public.can_view_restaurant(restaurant_id)
        and status = 'active'
        and now() between starts_at and ends_at
      )
    )
  );

create policy lucky_draw_campaigns_insert_staff
  on public.lucky_draw_campaigns for insert
  with check (public.is_restaurant_staff(restaurant_id));

create policy lucky_draw_campaigns_update_staff
  on public.lucky_draw_campaigns for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists lucky_draw_entries_insert_owner_or_staff on public.lucky_draw_entries;
create policy lucky_draw_entries_insert_restricted
  on public.lucky_draw_entries for insert
  with check (
    (
      profile_id = auth.uid()
      and lucky_draw_campaign_id is not null
    )
    or public.is_restaurant_staff(restaurant_id)
  );

commit;
