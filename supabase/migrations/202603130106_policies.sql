begin;

-- Cleanup legacy policy names to avoid duplicate overlapping policies.
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists v2_profiles_select_own on public.profiles;
drop policy if exists v2_profiles_update_own on public.profiles;

drop policy if exists restaurants_select_visible on public.restaurants;
drop policy if exists restaurants_insert_owner on public.restaurants;
drop policy if exists restaurants_update_admin on public.restaurants;
drop policy if exists v2_restaurants_select_public_or_staff on public.restaurants;
drop policy if exists v2_restaurants_manage_admin on public.restaurants;

drop policy if exists categories_select_visible on public.categories;
drop policy if exists categories_insert_staff on public.categories;
drop policy if exists categories_update_staff on public.categories;
drop policy if exists v2_categories_public_read_staff_manage on public.categories;
drop policy if exists v2_categories_staff_write on public.categories;

drop policy if exists menu_items_select_visible on public.menu_items;
drop policy if exists menu_items_insert_staff on public.menu_items;
drop policy if exists menu_items_update_staff on public.menu_items;
drop policy if exists v2_menu_items_public_read_staff_manage on public.menu_items;
drop policy if exists v2_menu_items_staff_write on public.menu_items;

drop policy if exists promo_campaigns_select_visible on public.promo_campaigns;
drop policy if exists promo_campaigns_insert_staff on public.promo_campaigns;
drop policy if exists promo_campaigns_update_staff on public.promo_campaigns;
drop policy if exists v2_promo_campaigns_public_read_staff_manage on public.promo_campaigns;
drop policy if exists v2_promo_campaigns_staff_write on public.promo_campaigns;

drop policy if exists memberships_select_owner_or_staff on public.memberships;
drop policy if exists memberships_insert_owner_or_staff on public.memberships;
drop policy if exists memberships_update_owner_or_staff on public.memberships;
drop policy if exists v2_memberships_owner_or_staff on public.memberships;

drop policy if exists lucky_draw_entries_select_owner_or_staff on public.lucky_draw_entries;
drop policy if exists lucky_draw_entries_insert_owner_or_staff on public.lucky_draw_entries;
drop policy if exists lucky_draw_entries_update_staff on public.lucky_draw_entries;
drop policy if exists v2_lucky_draw_entries_owner_or_staff on public.lucky_draw_entries;

drop policy if exists notifications_select_target_or_staff on public.notifications;
drop policy if exists notifications_insert_staff on public.notifications;
drop policy if exists notifications_update_target_or_staff on public.notifications;
drop policy if exists v2_notifications_target_or_staff on public.notifications;

drop policy if exists push_subscriptions_owner_or_staff on public.push_subscriptions;
drop policy if exists v2_push_subscriptions_owner_or_staff on public.push_subscriptions;

drop policy if exists admin_users_select_staff_and_self on public.admin_users;
drop policy if exists admin_users_insert_admin on public.admin_users;
drop policy if exists admin_users_update_admin on public.admin_users;
drop policy if exists v2_admin_users_admin_read_write on public.admin_users;

drop policy if exists audit_logs_select_admin on public.audit_logs;
drop policy if exists audit_logs_insert_staff on public.audit_logs;
drop policy if exists v2_audit_logs_admin_read_staff_insert on public.audit_logs;
drop policy if exists v2_audit_logs_staff_insert on public.audit_logs;

drop policy if exists app_profiles_select_own on public.profiles;
create policy app_profiles_select_own
  on public.profiles
  for select
  using (auth.uid() = id and deleted_at is null);

drop policy if exists app_profiles_insert_own on public.profiles;
create policy app_profiles_insert_own
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists app_profiles_update_own on public.profiles;
create policy app_profiles_update_own
  on public.profiles
  for update
  using (auth.uid() = id and deleted_at is null)
  with check (auth.uid() = id);

drop policy if exists app_restaurants_select_visible on public.restaurants;
create policy app_restaurants_select_visible
  on public.restaurants
  for select
  using (deleted_at is null and public.can_view_restaurant(id));

drop policy if exists app_restaurants_insert_owner on public.restaurants;
create policy app_restaurants_insert_owner
  on public.restaurants
  for insert
  with check (owner_profile_id = auth.uid());

drop policy if exists app_restaurants_update_admin on public.restaurants;
create policy app_restaurants_update_admin
  on public.restaurants
  for update
  using (deleted_at is null and public.is_restaurant_admin(id))
  with check (public.is_restaurant_admin(id));

drop policy if exists app_categories_select_public_or_staff on public.categories;
create policy app_categories_select_public_or_staff
  on public.categories
  for select
  using (
    deleted_at is null
    and (
      (is_active = true and public.can_view_restaurant(restaurant_id))
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_categories_insert_staff on public.categories;
create policy app_categories_insert_staff
  on public.categories
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_categories_update_staff on public.categories;
create policy app_categories_update_staff
  on public.categories
  for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_menu_items_select_public_or_staff on public.menu_items;
create policy app_menu_items_select_public_or_staff
  on public.menu_items
  for select
  using (
    deleted_at is null
    and (
      (is_available = true and public.can_view_restaurant(restaurant_id))
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_menu_items_insert_staff on public.menu_items;
create policy app_menu_items_insert_staff
  on public.menu_items
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_menu_items_update_staff on public.menu_items;
create policy app_menu_items_update_staff
  on public.menu_items
  for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_promo_campaigns_select_public_or_staff on public.promo_campaigns;
create policy app_promo_campaigns_select_public_or_staff
  on public.promo_campaigns
  for select
  using (
    deleted_at is null
    and (
      (
        is_active = true
        and starts_at <= timezone('utc', now())
        and ends_at >= timezone('utc', now())
        and public.can_view_restaurant(restaurant_id)
      )
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_promo_campaigns_insert_staff on public.promo_campaigns;
create policy app_promo_campaigns_insert_staff
  on public.promo_campaigns
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_promo_campaigns_update_staff on public.promo_campaigns;
create policy app_promo_campaigns_update_staff
  on public.promo_campaigns
  for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_memberships_select_owner_or_staff on public.memberships;
create policy app_memberships_select_owner_or_staff
  on public.memberships
  for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_memberships_insert_owner_or_staff on public.memberships;
create policy app_memberships_insert_owner_or_staff
  on public.memberships
  for insert
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

drop policy if exists app_memberships_update_owner_or_staff on public.memberships;
create policy app_memberships_update_owner_or_staff
  on public.memberships
  for update
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

drop policy if exists app_lucky_draw_campaigns_select_public_or_staff on public.lucky_draw_campaigns;
create policy app_lucky_draw_campaigns_select_public_or_staff
  on public.lucky_draw_campaigns
  for select
  using (
    deleted_at is null
    and (
      (
        status = 'active'
        and starts_at <= timezone('utc', now())
        and ends_at >= timezone('utc', now())
        and public.can_view_restaurant(restaurant_id)
      )
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_lucky_draw_campaigns_insert_staff on public.lucky_draw_campaigns;
create policy app_lucky_draw_campaigns_insert_staff
  on public.lucky_draw_campaigns
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_lucky_draw_campaigns_update_staff on public.lucky_draw_campaigns;
create policy app_lucky_draw_campaigns_update_staff
  on public.lucky_draw_campaigns
  for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_lucky_draw_entries_select_owner_or_staff on public.lucky_draw_entries;
create policy app_lucky_draw_entries_select_owner_or_staff
  on public.lucky_draw_entries
  for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_lucky_draw_entries_insert_owner_or_staff on public.lucky_draw_entries;
create policy app_lucky_draw_entries_insert_owner_or_staff
  on public.lucky_draw_entries
  for insert
  with check (
    (
      profile_id = auth.uid()
      and public.can_view_restaurant(restaurant_id)
    )
    or public.is_restaurant_staff(restaurant_id)
  );

drop policy if exists app_lucky_draw_entries_update_staff on public.lucky_draw_entries;
create policy app_lucky_draw_entries_update_staff
  on public.lucky_draw_entries
  for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_notifications_select_target_or_staff on public.notifications;
create policy app_notifications_select_target_or_staff
  on public.notifications
  for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_notifications_insert_staff on public.notifications;
create policy app_notifications_insert_staff
  on public.notifications
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_notifications_update_target_or_staff on public.notifications;
create policy app_notifications_update_target_or_staff
  on public.notifications
  for update
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

drop policy if exists app_push_subscriptions_select_owner_or_staff on public.push_subscriptions;
create policy app_push_subscriptions_select_owner_or_staff
  on public.push_subscriptions
  for select
  using (
    profile_id = auth.uid()
    or (
      restaurant_id is not null
      and public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_push_subscriptions_insert_owner on public.push_subscriptions;
create policy app_push_subscriptions_insert_owner
  on public.push_subscriptions
  for insert
  with check (profile_id = auth.uid());

drop policy if exists app_push_subscriptions_update_owner_or_staff on public.push_subscriptions;
create policy app_push_subscriptions_update_owner_or_staff
  on public.push_subscriptions
  for update
  using (
    profile_id = auth.uid()
    or (
      restaurant_id is not null
      and public.is_restaurant_staff(restaurant_id)
    )
  )
  with check (
    profile_id = auth.uid()
    or (
      restaurant_id is not null
      and public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists app_admin_users_select_self_or_admin on public.admin_users;
create policy app_admin_users_select_self_or_admin
  on public.admin_users
  for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_admin(restaurant_id)
    )
  );

drop policy if exists app_admin_users_insert_admin on public.admin_users;
create policy app_admin_users_insert_admin
  on public.admin_users
  for insert
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists app_admin_users_update_admin on public.admin_users;
create policy app_admin_users_update_admin
  on public.admin_users
  for update
  using (deleted_at is null and public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists app_audit_logs_select_admin on public.audit_logs;
create policy app_audit_logs_select_admin
  on public.audit_logs
  for select
  using (public.is_restaurant_admin(restaurant_id));

drop policy if exists app_audit_logs_insert_staff on public.audit_logs;
create policy app_audit_logs_insert_staff
  on public.audit_logs
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_notification_broadcasts_staff_read on public.notification_broadcasts;
create policy app_notification_broadcasts_staff_read
  on public.notification_broadcasts
  for select
  using (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_notification_broadcasts_staff_insert on public.notification_broadcasts;
create policy app_notification_broadcasts_staff_insert
  on public.notification_broadcasts
  for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists app_notification_dispatch_logs_staff_read on public.notification_dispatch_logs;
create policy app_notification_dispatch_logs_staff_read
  on public.notification_dispatch_logs
  for select
  using (
    exists (
      select 1
      from public.notification_broadcasts b
      where b.id = notification_dispatch_logs.broadcast_id
        and public.is_restaurant_staff(b.restaurant_id)
    )
  );

drop policy if exists app_notification_dispatch_logs_staff_insert on public.notification_dispatch_logs;
create policy app_notification_dispatch_logs_staff_insert
  on public.notification_dispatch_logs
  for insert
  with check (
    exists (
      select 1
      from public.notification_broadcasts b
      where b.id = notification_dispatch_logs.broadcast_id
        and public.is_restaurant_staff(b.restaurant_id)
    )
  );

commit;
