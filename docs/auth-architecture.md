# Auth Architecture (Next.js App Router + Supabase)

## Folder Structure

```txt
lib/
  auth/
    roles.ts           # Role ranking helpers
    server.ts          # Server auth helpers (App Router)
  supabase/
    client.ts          # Browser client
    server.ts          # Server client
    middleware.ts      # Session refresh + route guard
    api.ts             # API auth/admin context helpers
app/
  (customer)/
    member/login
    member/register
  (admin)/
    admin/*
  api/
    auth/admin/check
```

## Core Flows

### Customer Login/Register
- Register/Login uses Supabase Auth client-side.
- Server-side pages call auth helpers to gate protected routes.
- Profile is auto-provisioned at first login (DB trigger + server helper fallback).

### Staff/Admin Access
- `/admin/*` requires authenticated user with admin access (`staff` or above).
- Access is resolved per restaurant using `admin_users` plus restaurant ownership.
- `admin` is stricter than `staff`; owner is treated as highest admin rank.

### Route Protection
- Middleware refreshes session and blocks anonymous access to protected routes.
- Middleware blocks non-admin users from `/admin` and `/api/admin/*`.
- Server layout/pages still enforce authorization as defense in depth.

## Required Server Helpers
- `getCurrentUser`
- `getCurrentProfile`
- `requireAuth`
- `requireAdmin`
- `requireStaff`

These helpers are implemented in `lib/auth/server.ts` and consumed by compatibility wrappers in `lib/supabase/auth.ts`.
