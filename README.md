# Restaurant PWA (Next.js 15 + Supabase)

Production-ready starter for:
- Customer mobile-first restaurant experience
- Admin dashboard (mobile + tablet)
- Supabase auth + typed CRUD APIs
- PWA + Web Push notifications (Chrome-focused)

## Setup

1. Copy env template

```bash
cp .env.example .env.local
```

2. Fill required variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

3. Security before public repo
- Keep real secrets in `.env.local` only (already gitignored)
- Keep `.env.example` as placeholder values only
- Rotate exposed keys in Supabase:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Update VAPID keys if they were previously exposed
4. Install and run

```bash
npm install
npm run dev
```

## Language (i18n)

- Customer area supports 2 locales: `TH` and `EN`
- Switch language with the `TH/EN` button in the customer shell
- Locale is stored in cookie `locale` and used by both server/client rendering

## Supabase Migrations

Apply migrations in order:
- `supabase/migrations/202603130101_create_tables.sql`
- `supabase/migrations/202603130102_foreign_keys_constraints.sql`
- `supabase/migrations/202603130103_indexes.sql`
- `supabase/migrations/202603130104_rls_helper_functions.sql`
- `supabase/migrations/202603130105_enable_rls.sql`
- `supabase/migrations/202603130106_policies.sql`
- `supabase/migrations/202603130107_updated_at_triggers.sql`

## Production-ready Supabase Structure

```txt
lib/
  auth/
    roles.ts
    server.ts
  env.ts
  supabase/
    admin.ts
    api.ts
    auth.ts
    client.ts
    database.types.ts
    middleware.ts
    server.ts
    crud/
      categories.ts
      menu-items.ts
      promo-campaigns.ts
      lucky-draw.ts
```

## Auth Flows

- Customer:
  - Register: `/member/register`
  - Login: `/member/login`
  - Protected pages: `/profile`, `/lucky-draw`
- Admin:
  - Login: `/admin/login`
  - Protected area: `/admin/*` via middleware + server guard (`requireStaff` / `requireAdmin`)

Server auth helper set:
- `getCurrentUser`
- `getCurrentProfile`
- `requireAuth`
- `requireStaff`
- `requireAdmin`

## CRUD API Examples (Typed with Database Types)

- Categories:
  - `GET /api/admin/categories?restaurantId=...`
  - `POST /api/admin/categories`
  - `PATCH /api/admin/categories/:id`
  - `DELETE /api/admin/categories/:id` (soft delete)
- Menu Items:
  - `GET /api/admin/menu-items?restaurantId=...`
  - `POST /api/admin/menu-items`
  - `PATCH /api/admin/menu-items/:id`
  - `DELETE /api/admin/menu-items/:id` (soft delete)
- Promo Campaigns:
  - `GET /api/admin/promo-campaigns?restaurantId=...`
  - `POST /api/admin/promo-campaigns`
  - `PATCH /api/admin/promo-campaigns/:id`
  - `DELETE /api/admin/promo-campaigns/:id` (soft delete)
- Lucky Draw Campaigns:
  - `GET /api/admin/lucky-draw-campaigns?restaurantId=...`
  - `POST /api/admin/lucky-draw-campaigns`
  - `PATCH /api/admin/lucky-draw-campaigns/:id`
  - `DELETE /api/admin/lucky-draw-campaigns/:id` (soft delete)
- Lucky Draw Customer:
  - `GET /api/lucky-draw/campaigns`
  - `POST /api/lucky-draw/join`
  - `GET /api/lucky-draw/history`

## Push Notification System

- Customer frontend:
  - `PushNotificationCard` on `/profile`
  - subscribe/unsubscribe flow with permission UX
- Admin frontend:
  - broadcast panel on `/admin/notifications`
  - sends promotions and shows send history
- Backend routes:
  - `POST /api/notifications/subscribe`
  - `POST /api/notifications/unsubscribe`
  - `GET /api/notifications/status`
  - `POST /api/notifications/broadcast`
  - `GET /api/notifications/history`

More device/browser constraints:
- `docs/web-push-limitations.md`

Architecture + roadmap:
- `docs/architecture-blueprint.md`

Vercel + Supabase deployment runbook:
- `docs/vercel-supabase-deploy.md`

Supabase + App Router integration guide:
- `docs/supabase-app-router-guide.md`

Auth and RBAC structure:
- `docs/auth-rbac-structure.md`
- `docs/auth-architecture.md`

Split migration strategy:
- `docs/supabase-migration-plan.md`

Push architecture + production notes:
- `docs/push-notification-architecture.md`
