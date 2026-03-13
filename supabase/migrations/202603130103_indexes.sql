begin;

create index if not exists restaurants_owner_profile_idx
  on public.restaurants (owner_profile_id)
  where deleted_at is null;

create index if not exists categories_restaurant_sort_idx
  on public.categories (restaurant_id, sort_order)
  where deleted_at is null;

create index if not exists categories_restaurant_active_idx
  on public.categories (restaurant_id, is_active)
  where deleted_at is null;

create unique index if not exists categories_unique_name_per_restaurant
  on public.categories (restaurant_id, lower(name))
  where deleted_at is null;

create index if not exists menu_items_restaurant_sort_idx
  on public.menu_items (restaurant_id, sort_order)
  where deleted_at is null;

create index if not exists menu_items_restaurant_available_idx
  on public.menu_items (restaurant_id, is_available)
  where deleted_at is null;

create index if not exists menu_items_category_idx
  on public.menu_items (category_id)
  where deleted_at is null;

create unique index if not exists menu_items_unique_sku_per_restaurant
  on public.menu_items (restaurant_id, sku)
  where sku is not null and deleted_at is null;

create index if not exists promo_campaigns_restaurant_period_idx
  on public.promo_campaigns (restaurant_id, starts_at desc, ends_at desc)
  where deleted_at is null;

create index if not exists promo_campaigns_restaurant_active_idx
  on public.promo_campaigns (restaurant_id, is_active)
  where deleted_at is null;

create index if not exists memberships_profile_idx
  on public.memberships (profile_id)
  where deleted_at is null;

create index if not exists memberships_restaurant_idx
  on public.memberships (restaurant_id)
  where deleted_at is null;

create unique index if not exists memberships_unique_profile_per_restaurant
  on public.memberships (restaurant_id, profile_id)
  where deleted_at is null;

create index if not exists lucky_draw_campaigns_restaurant_period_idx
  on public.lucky_draw_campaigns (restaurant_id, starts_at desc, ends_at desc)
  where deleted_at is null;

create index if not exists lucky_draw_campaigns_restaurant_status_idx
  on public.lucky_draw_campaigns (restaurant_id, status)
  where deleted_at is null;

create index if not exists lucky_draw_entries_profile_created_idx
  on public.lucky_draw_entries (profile_id, created_at desc)
  where deleted_at is null;

create index if not exists lucky_draw_entries_restaurant_campaign_idx
  on public.lucky_draw_entries (restaurant_id, lucky_draw_campaign_id)
  where deleted_at is null;

create index if not exists notifications_profile_unread_idx
  on public.notifications (profile_id, read_at, created_at desc)
  where deleted_at is null;

create index if not exists notifications_restaurant_type_idx
  on public.notifications (restaurant_id, type, created_at desc)
  where deleted_at is null;

create index if not exists push_subscriptions_profile_active_idx
  on public.push_subscriptions (profile_id, is_active, updated_at desc);

create index if not exists push_subscriptions_restaurant_active_idx
  on public.push_subscriptions (restaurant_id, is_active, updated_at desc);

create index if not exists admin_users_profile_active_idx
  on public.admin_users (profile_id, is_active)
  where deleted_at is null;

create index if not exists admin_users_restaurant_role_active_idx
  on public.admin_users (restaurant_id, role, is_active)
  where deleted_at is null;

create unique index if not exists admin_users_unique_profile_per_restaurant
  on public.admin_users (restaurant_id, profile_id)
  where deleted_at is null;

create index if not exists audit_logs_restaurant_created_idx
  on public.audit_logs (restaurant_id, created_at desc);

create index if not exists notification_broadcasts_restaurant_created_idx
  on public.notification_broadcasts (restaurant_id, created_at desc);

create index if not exists notification_dispatch_logs_broadcast_status_idx
  on public.notification_dispatch_logs (broadcast_id, status, created_at desc);

create index if not exists notification_dispatch_logs_profile_created_idx
  on public.notification_dispatch_logs (profile_id, created_at desc);

commit;
