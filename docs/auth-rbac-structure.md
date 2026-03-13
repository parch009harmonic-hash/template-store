# Auth and RBAC Structure

This project uses Supabase Auth for identity and an application-level role model for authorization.

## Role Model

- `customer`: member-facing pages only.
- `staff`: can access admin area with read operations and limited tools.
- `admin`: full admin operations for restaurant data.
- `owner`: highest admin role (inherits admin rights).

Role hierarchy:
- `staff < admin < owner`

## Where Role Is Checked

1. Middleware (`lib/supabase/middleware.ts`)
- Protects page routes:
  - `/admin/*` (except `/admin/login`)
  - `/profile`
  - `/lucky-draw*`
- Protects API groups:
  - `/api/admin/*`
  - `/api/auth/admin/check`
  - `/api/notifications/*`
  - `/api/lucky-draw/*`
- Behavior:
  - Unauthenticated page request -> redirect to login (`/admin/login` or `/member/login`) with `next` param.
  - Unauthenticated API request -> `401`.

2. Server guards (`lib/supabase/auth.ts`)
- `requireCustomerUser()` for customer pages.
- `requireAdminUser(minRole)` / `requireAdminRole(minRole)` for admin pages and server components.

3. API guards (`lib/supabase/api.ts`)
- `getApiAdminContext(restaurantId, minimumRole)` returns:
  - authenticated user
  - selected `restaurantId`
  - resolved admin `role`
- Rejects unauthorized restaurant access and insufficient role with `403`.

## Route-Level Policy

- Admin list/read APIs use minimum role `staff`.
- Admin write APIs (create/update/delete) use minimum role `admin`.
- Notification broadcast API requires `admin`.
- Broadcast history API allows `staff`.

## Data Sources for Role Resolution

- `admin_users` table: staff/admin assignments per restaurant.
- `restaurants.owner_profile_id`: owner mapping.
- For each restaurant, the highest role is selected when multiple rows exist.

## Recommended Production Additions

- Enforce matching RLS policies for each role and table action.
- Add audit log records for all write operations.
- Add explicit deny pages for authenticated-but-forbidden users.
- Add integration tests for:
  - customer -> admin route denial
  - staff -> write route denial
  - admin/owner -> write route success
