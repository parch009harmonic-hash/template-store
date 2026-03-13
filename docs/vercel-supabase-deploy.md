# Vercel + Supabase Deployment Checklist

## 1) Environment Variables

Set these in Vercel project settings for `Production` (and `Preview` as needed):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` and `VAPID_PRIVATE_KEY` must stay server-only.
- `NEXT_PUBLIC_APP_URL` should be your final HTTPS domain.

## 2) Build Settings

Recommended Vercel settings:

- Framework: `Next.js`
- Install command: `npm install`
- Build command: `npm run build`
- Output: `.next`
- Node.js runtime: latest LTS

## 3) Domain Setup

1. Add custom domain in Vercel project.
2. Configure DNS (A/CNAME) at your DNS provider.
3. Wait for SSL certificate issuance.
4. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
5. In Supabase Auth URL config:
   - Site URL = production domain
   - Redirect URLs = include production + preview callback URLs

## 4) Production Config in Next.js

Already configured in `next.config.ts`:

- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, etc.)
- Production CSP
- `poweredByHeader: false`
- Image optimization (`AVIF/WEBP`, Supabase storage remote patterns)
- Service worker cache-control on `/sw.js`

## 5) Error Handling and Logging

Implemented:

- App Router error boundaries:
  - `app/error.tsx`
  - `app/global-error.tsx`
- Structured logger utility:
  - `lib/logger.ts`
- Request-level logging in critical APIs (lucky draw join, notification broadcast).

## 6) Security Checks

- Validate RLS is enabled for all public tables.
- Confirm policies for:
  - customer (`auth.uid()` own rows only)
  - staff/admin (`is_restaurant_staff`, `is_restaurant_admin`)
- Ensure service role key is never exposed client-side.
- Confirm `manifest.webmanifest` and `sw.js` are served via HTTPS.

## 7) GitHub -> Vercel -> Supabase Flow

1. Push repository to GitHub.
2. Import repo into Vercel.
3. Add all env vars in Vercel.
4. Run Supabase migrations on production project:
   - `202603120001_restaurant_schema.sql`
   - `202603120002_push_notifications.sql`
   - `202603120003_lucky_draw_campaigns.sql`
5. Verify Supabase Auth URL settings.
6. Deploy from `main`.
7. Run smoke tests on production URL.

## 8) Final Pre-Launch Checklist

- [ ] `npm run build` passes
- [ ] `tsc --noEmit` passes
- [ ] Auth flow works for customer and admin
- [ ] Lucky draw join rules enforce limits and eligibility
- [ ] Admin campaign create/edit/delete works
- [ ] Push subscribe/unsubscribe works in Chrome PWA
- [ ] Broadcast sends and history logs are recorded
- [ ] Security headers present in response
- [ ] PWA install prompt works on Chrome
- [ ] Domain + HTTPS + redirects validated
