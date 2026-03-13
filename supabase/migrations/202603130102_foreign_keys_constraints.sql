begin;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_id_auth_users_fkey') then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_default_restaurant_id_fkey') then
    alter table public.profiles
      add constraint profiles_default_restaurant_id_fkey
      foreign key (default_restaurant_id) references public.restaurants (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'restaurants_owner_profile_id_fkey') then
    alter table public.restaurants
      add constraint restaurants_owner_profile_id_fkey
      foreign key (owner_profile_id) references public.profiles (id) on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'restaurants_slug_key') then
    alter table public.restaurants
      add constraint restaurants_slug_key unique (slug);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'categories_restaurant_id_fkey') then
    alter table public.categories
      add constraint categories_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'menu_items_restaurant_id_fkey') then
    alter table public.menu_items
      add constraint menu_items_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'menu_items_category_id_fkey') then
    alter table public.menu_items
      add constraint menu_items_category_id_fkey
      foreign key (category_id) references public.categories (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'promo_campaigns_restaurant_id_fkey') then
    alter table public.promo_campaigns
      add constraint promo_campaigns_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'memberships_restaurant_id_fkey') then
    alter table public.memberships
      add constraint memberships_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'memberships_profile_id_fkey') then
    alter table public.memberships
      add constraint memberships_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_campaigns_restaurant_id_fkey') then
    alter table public.lucky_draw_campaigns
      add constraint lucky_draw_campaigns_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_campaigns_created_by_fkey') then
    alter table public.lucky_draw_campaigns
      add constraint lucky_draw_campaigns_created_by_fkey
      foreign key (created_by) references public.profiles (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_entries_restaurant_id_fkey') then
    alter table public.lucky_draw_entries
      add constraint lucky_draw_entries_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_entries_membership_id_fkey') then
    alter table public.lucky_draw_entries
      add constraint lucky_draw_entries_membership_id_fkey
      foreign key (membership_id) references public.memberships (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_entries_profile_id_fkey') then
    alter table public.lucky_draw_entries
      add constraint lucky_draw_entries_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_entries_campaign_id_fkey') then
    alter table public.lucky_draw_entries
      add constraint lucky_draw_entries_campaign_id_fkey
      foreign key (lucky_draw_campaign_id) references public.lucky_draw_campaigns (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notifications_restaurant_id_fkey') then
    alter table public.notifications
      add constraint notifications_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notifications_profile_id_fkey') then
    alter table public.notifications
      add constraint notifications_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notifications_created_by_fkey') then
    alter table public.notifications
      add constraint notifications_created_by_fkey
      foreign key (created_by) references public.profiles (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'push_subscriptions_profile_id_fkey') then
    alter table public.push_subscriptions
      add constraint push_subscriptions_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'push_subscriptions_restaurant_id_fkey') then
    alter table public.push_subscriptions
      add constraint push_subscriptions_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'push_subscriptions_endpoint_key') then
    alter table public.push_subscriptions
      add constraint push_subscriptions_endpoint_key unique (endpoint);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'admin_users_restaurant_id_fkey') then
    alter table public.admin_users
      add constraint admin_users_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'admin_users_profile_id_fkey') then
    alter table public.admin_users
      add constraint admin_users_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'admin_users_invited_by_fkey') then
    alter table public.admin_users
      add constraint admin_users_invited_by_fkey
      foreign key (invited_by) references public.profiles (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'audit_logs_restaurant_id_fkey') then
    alter table public.audit_logs
      add constraint audit_logs_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'audit_logs_actor_profile_id_fkey') then
    alter table public.audit_logs
      add constraint audit_logs_actor_profile_id_fkey
      foreign key (actor_profile_id) references public.profiles (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'audit_logs_actor_admin_user_id_fkey') then
    alter table public.audit_logs
      add constraint audit_logs_actor_admin_user_id_fkey
      foreign key (actor_admin_user_id) references public.admin_users (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_broadcasts_restaurant_id_fkey') then
    alter table public.notification_broadcasts
      add constraint notification_broadcasts_restaurant_id_fkey
      foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_broadcasts_sent_by_profile_id_fkey') then
    alter table public.notification_broadcasts
      add constraint notification_broadcasts_sent_by_profile_id_fkey
      foreign key (sent_by_profile_id) references public.profiles (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_dispatch_logs_broadcast_id_fkey') then
    alter table public.notification_dispatch_logs
      add constraint notification_dispatch_logs_broadcast_id_fkey
      foreign key (broadcast_id) references public.notification_broadcasts (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_dispatch_logs_subscription_id_fkey') then
    alter table public.notification_dispatch_logs
      add constraint notification_dispatch_logs_subscription_id_fkey
      foreign key (subscription_id) references public.push_subscriptions (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_dispatch_logs_profile_id_fkey') then
    alter table public.notification_dispatch_logs
      add constraint notification_dispatch_logs_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'menu_items_price_non_negative') then
    alter table public.menu_items
      add constraint menu_items_price_non_negative check (price >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'promo_campaigns_discount_non_negative') then
    alter table public.promo_campaigns
      add constraint promo_campaigns_discount_non_negative check (discount_value >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'promo_campaigns_period_check') then
    alter table public.promo_campaigns
      add constraint promo_campaigns_period_check check (ends_at > starts_at);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'memberships_points_non_negative') then
    alter table public.memberships
      add constraint memberships_points_non_negative check (points >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_campaigns_entry_cost_non_negative') then
    alter table public.lucky_draw_campaigns
      add constraint lucky_draw_campaigns_entry_cost_non_negative check (entry_cost_points >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_campaigns_max_entries_per_member_positive') then
    alter table public.lucky_draw_campaigns
      add constraint lucky_draw_campaigns_max_entries_per_member_positive check (max_entries_per_member > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_campaigns_max_total_entries_positive') then
    alter table public.lucky_draw_campaigns
      add constraint lucky_draw_campaigns_max_total_entries_positive check (max_total_entries is null or max_total_entries > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_campaigns_period_check') then
    alter table public.lucky_draw_campaigns
      add constraint lucky_draw_campaigns_period_check check (ends_at > starts_at);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'lucky_draw_entries_points_non_negative') then
    alter table public.lucky_draw_entries
      add constraint lucky_draw_entries_points_non_negative check (points_spent >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_dispatch_logs_status_check') then
    alter table public.notification_dispatch_logs
      add constraint notification_dispatch_logs_status_check check (status in ('sent', 'failed'));
  end if;
end $$;

commit;
