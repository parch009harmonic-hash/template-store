# Push Notification Architecture (PWA)

This document describes the push notification flow for the Restaurant PWA.

## Feature Scope

- Subscribe / unsubscribe from web push.
- Persist subscriptions in database (`push_subscriptions`).
- Admin broadcast promotions.
- Track send history and delivery outcomes.
- Chrome-focused PWA behavior.

## End-to-End Flow

1. Customer subscription
- UI: `components/customer/push-notification-card.tsx`
- User clicks enable button (permission request is user-triggered).
- Browser creates PushSubscription via service worker.
- Client sends subscription payload to `POST /api/notifications/subscribe`.
- API upserts into `push_subscriptions` (`is_active=true`).

2. Customer unsubscribe
- UI calls `POST /api/notifications/unsubscribe` with endpoint.
- API marks subscription inactive (`is_active=false`, `deactivated_at`).

3. Admin broadcast
- UI: `components/admin/promotion-broadcast-panel.tsx`
- Admin sends message to `POST /api/notifications/broadcast`.
- API checks admin role and restaurant scope.
- API queries active subscriptions, sends via `web-push`, logs results:
  - `notification_broadcasts`
  - `notification_dispatch_logs`
- API deactivates expired subscriptions (HTTP `404/410` patterns).
- API writes in-app notification records to `notifications`.

4. History
- UI loads `GET /api/notifications/history`.
- API returns paginated/sorted broadcast history.

## Service Worker Behavior

File: `public/sw.js`

- Handles `push` event, displays notification.
- Handles `notificationclick`, navigates/focuses target URL.
- Supports app-shell caching and offline fallback.

## UX-Friendly Permission Pattern

- Permission prompt is not shown on page load.
- Prompt appears only after explicit user action.
- UI handles unsupported / denied / granted states.
- Unsubscribe action is available in-app.

## Production Constraints and Recommendations

- Requires HTTPS (except localhost during development).
- Delivery is best effort, not guaranteed real-time.
- Browser/OS power policies can delay notifications.
- In-app browsers may not support PushManager fully.
- Keep payload small and include fallback URL.
- Maintain in-app notification center for unsupported clients.
- Monitor sent/failed ratios and expired endpoint cleanup.

See also:
- `docs/web-push-limitations.md`
