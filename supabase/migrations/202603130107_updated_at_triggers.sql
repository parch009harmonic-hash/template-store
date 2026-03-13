begin;

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

drop trigger if exists lucky_draw_campaigns_set_updated_at on public.lucky_draw_campaigns;
create trigger lucky_draw_campaigns_set_updated_at
before update on public.lucky_draw_campaigns
for each row execute function public.set_updated_at();

drop trigger if exists lucky_draw_entries_set_updated_at on public.lucky_draw_entries;
create trigger lucky_draw_entries_set_updated_at
before update on public.lucky_draw_entries
for each row execute function public.set_updated_at();

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists audit_logs_set_updated_at on public.audit_logs;
create trigger audit_logs_set_updated_at
before update on public.audit_logs
for each row execute function public.set_updated_at();

drop trigger if exists notification_broadcasts_set_updated_at on public.notification_broadcasts;
create trigger notification_broadcasts_set_updated_at
before update on public.notification_broadcasts
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (id, full_name, phone, avatar_url, app_role)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', u.email, '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'phone', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data ->> 'avatar_url', '')), ''),
  'customer'::public.app_user_role
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

commit;
