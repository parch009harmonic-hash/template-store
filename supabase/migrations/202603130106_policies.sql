begin;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id and deleted_at is null);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id and deleted_at is null)
  with check (auth.uid() = id);

drop policy if exists restaurants_select_visible on public.restaurants;
create policy restaurants_select_visible
  on public.restaurants for select
  using (public.can_view_restaurant(id) and deleted_at is null);

drop policy if exists restaurants_insert_owner on public.restaurants;
create policy restaurants_insert_owner
  on public.restaurants for insert
  with check (owner_profile_id = auth.uid());

drop policy if exists restaurants_update_admin on public.restaurants;
create policy restaurants_update_admin
  on public.restaurants for update
  using (public.is_restaurant_admin(id) and deleted_at is null)
  with check (public.is_restaurant_admin(id));

drop policy if exists categories_select_visible on public.categories;
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

drop policy if exists categories_insert_staff on public.categories;
create policy categories_insert_staff
  on public.categories for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists categories_update_staff on public.categories;
create policy categories_update_staff
  on public.categories for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists menu_items_select_visible on public.menu_items;
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

drop policy if exists menu_items_insert_staff on public.menu_items;
create policy menu_items_insert_staff
  on public.menu_items for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists menu_items_update_staff on public.menu_items;
create policy menu_items_update_staff
  on public.menu_items for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists promo_campaigns_select_visible on public.promo_campaigns;
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

drop policy if exists promo_campaigns_insert_staff on public.promo_campaigns;
create policy promo_campaigns_insert_staff
  on public.promo_campaigns for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists promo_campaigns_update_staff on public.promo_campaigns;
create policy promo_campaigns_update_staff
  on public.promo_campaigns for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists memberships_select_owner_or_staff on public.memberships;
create policy memberships_select_owner_or_staff
  on public.memberships for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists memberships_insert_owner_or_staff on public.memberships;
create policy memberships_insert_owner_or_staff
  on public.memberships for insert
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

drop policy if exists memberships_update_owner_or_staff on public.memberships;
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

drop policy if exists lucky_draw_campaigns_select_visible on public.lucky_draw_campaigns;
create policy lucky_draw_campaigns_select_visible
  on public.lucky_draw_campaigns for select
  using (
    deleted_at is null
    and (
      status = 'active'
      or public.is_restaurant_staff(restaurant_id)
    )
    and public.can_view_restaurant(restaurant_id)
  );

drop policy if exists lucky_draw_campaigns_insert_staff on public.lucky_draw_campaigns;
create policy lucky_draw_campaigns_insert_staff
  on public.lucky_draw_campaigns for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists lucky_draw_campaigns_update_staff on public.lucky_draw_campaigns;
create policy lucky_draw_campaigns_update_staff
  on public.lucky_draw_campaigns for update
  using (public.is_restaurant_staff(restaurant_id) and deleted_at is null)
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists lucky_draw_entries_select_owner_or_staff on public.lucky_draw_entries;
create policy lucky_draw_entries_select_owner_or_staff
  on public.lucky_draw_entries for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists lucky_draw_entries_insert_owner_or_staff on public.lucky_draw_entries;
create policy lucky_draw_entries_insert_owner_or_staff
  on public.lucky_draw_entries for insert
  with check (
    profile_id = auth.uid()
    or public.is_restaurant_staff(restaurant_id)
  );

drop policy if exists lucky_draw_entries_update_staff on public.lucky_draw_entries;
create policy lucky_draw_entries_update_staff
  on public.lucky_draw_entries for update
  using (deleted_at is null and public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists notifications_select_target_or_staff on public.notifications;
create policy notifications_select_target_or_staff
  on public.notifications for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists notifications_insert_staff on public.notifications;
create policy notifications_insert_staff
  on public.notifications for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists notifications_update_target_or_staff on public.notifications;
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

drop policy if exists push_subscriptions_select_owner_or_staff on public.push_subscriptions;
create policy push_subscriptions_select_owner_or_staff
  on public.push_subscriptions for select
  using (
    profile_id = auth.uid()
    or (
      restaurant_id is not null
      and public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists push_subscriptions_insert_owner_or_staff on public.push_subscriptions;
create policy push_subscriptions_insert_owner_or_staff
  on public.push_subscriptions for insert
  with check (
    profile_id = auth.uid()
    or (
      restaurant_id is not null
      and public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists push_subscriptions_update_owner_or_staff on public.push_subscriptions;
create policy push_subscriptions_update_owner_or_staff
  on public.push_subscriptions for update
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

drop policy if exists admin_users_select_staff_and_self on public.admin_users;
create policy admin_users_select_staff_and_self
  on public.admin_users for select
  using (
    deleted_at is null
    and (
      profile_id = auth.uid()
      or public.is_restaurant_staff(restaurant_id)
    )
  );

drop policy if exists admin_users_insert_admin on public.admin_users;
create policy admin_users_insert_admin
  on public.admin_users for insert
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists admin_users_update_admin on public.admin_users;
create policy admin_users_update_admin
  on public.admin_users for update
  using (deleted_at is null and public.is_restaurant_admin(restaurant_id))
  with check (public.is_restaurant_admin(restaurant_id));

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
  on public.audit_logs for select
  using (public.is_restaurant_admin(restaurant_id));

drop policy if exists audit_logs_insert_staff on public.audit_logs;
create policy audit_logs_insert_staff
  on public.audit_logs for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists notification_broadcasts_select_staff on public.notification_broadcasts;
create policy notification_broadcasts_select_staff
  on public.notification_broadcasts for select
  using (public.is_restaurant_staff(restaurant_id));

drop policy if exists notification_broadcasts_insert_staff on public.notification_broadcasts;
create policy notification_broadcasts_insert_staff
  on public.notification_broadcasts for insert
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists notification_broadcasts_update_staff on public.notification_broadcasts;
create policy notification_broadcasts_update_staff
  on public.notification_broadcasts for update
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

drop policy if exists notification_dispatch_logs_select_staff on public.notification_dispatch_logs;
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

drop policy if exists notification_dispatch_logs_insert_staff on public.notification_dispatch_logs;
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
