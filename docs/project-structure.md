# Project Structure (Production-Ready Scaffold)

```txt
app/
  (customer)/               # Customer-facing app (mobile-first)
  (admin)/                  # Admin-facing app (mobile/tablet)
  api/                      # Route handlers (BFF layer)
  layout.tsx                # Shared root layout
  globals.css
components/
  ui/                       # shadcn/ui base components
  shared/                   # Shared app-level components
  customer/                 # Customer feature components
  admin/                    # Admin feature components
lib/
  supabase/                 # client/server/admin/auth/middleware and CRUD
  i18n/                     # locale messages + server resolver
  validation/               # existing feature-level validation modules
  mock/
types/
  api.ts
  domain.ts
hooks/                      # shared custom React hooks
utils/                      # pure utility helpers
validations/                # centralized validation exports and common schemas
public/
  manifest.webmanifest
  sw.js
  offline.html
  icons/
supabase/
  migrations/
  policies/                 # optional policy SQL split by table/feature
docs/
```

## Notes
- `app/layout.tsx` is the shared layout entry for all routes.
- Route groups are separated by `(customer)` and `(admin)` for clean domain boundaries.
- `lib/supabase` remains the only place for Supabase wiring.
- `validations/` provides a single import surface for zod schemas while keeping compatibility with existing `lib/validation/*`.
