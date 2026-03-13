begin;

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.promo_campaigns enable row level security;
alter table public.memberships enable row level security;
alter table public.lucky_draw_campaigns enable row level security;
alter table public.lucky_draw_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notification_broadcasts enable row level security;
alter table public.notification_dispatch_logs enable row level security;

commit;
