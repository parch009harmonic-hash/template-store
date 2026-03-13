# Restaurant Membership & Promotion PWA Blueprint

## 1. Architecture Analysis

Core architecture:

- Frontend: Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- Backend: Next.js route handlers (BFF pattern)
- Database/Auth: Supabase PostgreSQL + Supabase Auth + RLS
- Hosting: Vercel
- PWA: `manifest.webmanifest` + `sw.js` + web push

Bounded contexts:

- Customer app (mobile-first): browse menu, promotions, membership, lucky draw
- Admin app (mobile/tablet/desktop): manage menu/categories/members/promotions/notifications/lucky draw campaigns

## 2. Suggested Folder Structure (Production Ready)

```txt
app/
  (customer)/
    page.tsx
    menu/
    promotions/
    lucky-draw/
      page.tsx
      history/page.tsx
    member/login
    member/register
    profile
  (admin)/
    admin/
      page.tsx
      menu/
      categories/
      members/
      promotions/
      campaigns/
      notifications/
  api/
    auth/
    admin/
      categories/
      menu-items/
      promo-campaigns/
      lucky-draw-campaigns/
    lucky-draw/
    notifications/
components/
  customer/
  admin/
  shared/
  ui/
lib/
  env.ts
  logger.ts
  validation/
  supabase/
    client.ts
    server.ts
    admin.ts
    auth.ts
    api.ts
    database.types.ts
    crud/
supabase/
  migrations/
docs/
types/
public/
  manifest.webmanifest
  sw.js
```

## 3. Database Schema Design (Reason per Table)

- `profiles`: customer/admin profile data linked to `auth.users`
- `restaurants`: tenant root for multi-restaurant isolation
- `categories`: menu grouping and ordering
- `menu_items`: sellable products with availability and pricing
- `promo_campaigns`: discount campaigns with validity windows
- `memberships`: tier/status/points for member lifecycle
- `lucky_draw_campaigns`: configurable lucky draw rules and limits
- `lucky_draw_entries`: participation records and outcomes
- `notifications`: in-app notification inbox
- `push_subscriptions`: web push endpoints per user/device
- `notification_broadcasts`: admin send batches for promotions
- `notification_dispatch_logs`: delivery result audit per subscription
- `admin_users`: role mapping (staff/admin/owner) by restaurant
- `audit_logs`: immutable-ish operational trace for backoffice actions

## 4. Routes / Pages

Customer:

- `/`
- `/menu`
- `/menu/[itemId]`
- `/promotions`
- `/member/register`
- `/member/login`
- `/profile`
- `/lucky-draw`
- `/lucky-draw/history`

Admin:

- `/admin`
- `/admin/menu`
- `/admin/categories`
- `/admin/members`
- `/admin/promotions`
- `/admin/campaigns`
- `/admin/notifications`

## 5. Reusable UI Components

Customer:

- `customer-shell`, `bottom-nav`, `menu-item-card`, `promotion-card`
- `lucky-draw-campaign-list`, `lucky-draw-history-list`
- `push-notification-card`

Admin:

- `summary-cards`, `module-toolbar`, `admin-data-table`
- `lucky-draw-campaign-manager`, `promotion-broadcast-panel`

Shared:

- `responsive-shell`, `sign-out-button`, `pwa-register`
- shadcn primitives (`button`, `card`, `input`, `select`, `textarea`, `badge`)

## 6. Auth / Role System

Authentication:

- Supabase Auth session on client/server
- Route protection with server guards (`requireCustomerUser`, `requireAdminUser`)
- Middleware refreshes session cookies

Authorization:

- Customer: own profile/membership/entries only (`auth.uid()` policies)
- Staff: restaurant operational tables via `is_restaurant_staff(restaurant_id)`
- Admin/Owner: elevated management with `is_restaurant_admin(restaurant_id)`
- RLS applies on every table in `public` schema

## 7. Development Roadmap (Phases)

- Phase 1: foundation + PWA shell + auth + schema migrations
- Phase 2: customer UX + membership + lucky draw participation/history
- Phase 3: admin dashboard + campaign management + push broadcast
- Phase 4: observability, security hardening, performance, QA
- Phase 5: staging UAT + production rollout + post-launch monitoring

## 8. Current Implementation Status

Implemented in this codebase:

- Lucky draw campaign table + triggers + RLS migration
- Customer lucky draw live flow + join + history page
- Admin lucky draw campaign management UI + CRUD API integration
- Promo campaign API validation consistency
- Deployment hardening docs + security headers + error boundaries + logging helper
