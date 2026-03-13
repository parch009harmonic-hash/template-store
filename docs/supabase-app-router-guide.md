# Supabase + Next.js App Router Guide

This guide explains file placement and implementation patterns for Supabase integration in this Restaurant Web App.

## 1) Recommended File Placement

```txt
lib/
  env.ts                          # read/validate env
  supabase/
    index.ts                      # barrel exports
    database.types.ts             # generated DB types
    types.ts                      # TableRow/TableInsert/TableUpdate helpers
    client.ts                     # browser supabase client
    server.ts                     # server supabase client (cookies)
    admin.ts                      # service-role supabase client (server only)
    auth.ts                       # auth helpers (current user / admin guard)
    api.ts                        # API route auth/admin context helper
    crud/
      categories.ts               # typed CRUD: categories
      menu-items.ts               # typed CRUD: menu_items
      promo-campaigns.ts          # typed CRUD: promo_campaigns

app/
  api/
    admin/
      categories/route.ts         # GET list + POST create
      categories/[id]/route.ts    # GET one + PATCH update + DELETE soft delete
      menu-items/route.ts
      menu-items/[id]/route.ts
      promo-campaigns/route.ts
      promo-campaigns/[id]/route.ts
```

## 2) Env Variables

File: `lib/env.ts`

- `getPublicEnv()`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL` (optional)
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (optional)
- `getServiceRoleEnv()`:
  - `SUPABASE_SERVICE_ROLE_KEY`
- `getWebPushEnv()`:
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`

Guideline:
- Browser/server auth flow uses anon key via `client.ts` and `server.ts`.
- Privileged backend work (admin broadcast/history) uses service role via `admin.ts`.

## 3) Client Pattern

- Browser client: `lib/supabase/client.ts` (`createBrowserSupabaseClient`)
- Server client: `lib/supabase/server.ts` (`createServerSupabaseClient`)
- Auth helper: `lib/supabase/auth.ts`
  - `getCurrentUser`
- `requireCustomerUser`
- `getAdminContext`
- `requireAdminUser`

## 4) Typed CRUD Pattern

All CRUD files use shared types from `lib/supabase/types.ts`.

- `TableRow<"...">`
- `TableInsert<"...">`
- `TableUpdate<"...">`

Scaffolded entity examples:
- Categories
- Menu Items
- Promo Campaigns

Each entity exposes:
- `list...`
- `get...ById`
- `create...`
- `update...`
- `softDelete...`

## 5) App Router API Pattern

In `app/api/admin/...`:
- Call `getApiAdminContext()` first to enforce restaurant scope.
- Call entity CRUD functions from `lib/supabase/crud/*`.
- Return clear JSON responses:
  - success: `{ data }` or `{ ok: true }`
  - failure: `{ error: string }`

## 6) Why This Layout

- Lower coupling between UI and DB queries.
- Thin and readable route handlers.
- Type-safe end-to-end flow via `database.types.ts`.
- Scales for multi-restaurant and RBAC requirements.
