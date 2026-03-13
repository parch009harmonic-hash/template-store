# Web Push Limitations (Restaurant PWA)

## Browser / Device Coverage
- Chrome Desktop + Android Chrome: best support for Web Push + PWA install.
- iOS Safari: supports web push only for Home Screen web apps (iOS 16.4+), behavior differs from Chrome.
- In-app browsers (LINE, Facebook, Instagram): often do not support PushManager/service worker fully.

## Delivery Behavior
- Web push is best-effort, not guaranteed real-time delivery.
- Device battery saver / OS background restrictions can delay notifications.
- Expired subscriptions (HTTP 404/410) must be deactivated on backend.

## UX / Permission Constraints
- Browsers can auto-block repeated permission prompts.
- Permission request should be user-triggered and contextual, not on first page load.
- Users can revoke permission from browser settings at any time.

## PWA Scope Constraints
- Push requires HTTPS (or localhost for development).
- Service worker scope must include the route where notifications are handled.
- Payload size should be small; large payloads may fail or be truncated.

## Operational Notes
- Keep fallback in-app notification center for users without push support.
- Track send logs (`sent/failed`) to monitor reliability by browser/device mix.

