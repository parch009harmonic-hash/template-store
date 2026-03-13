const CACHE_NAME = "restaurant-pwa-v2";
const OFFLINE_URL = "/offline.html";
const APP_SHELL_ASSETS = ["/", OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.mode === "navigate") {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) return offlineResponse;
    }

    throw new Error("Network unavailable");
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  const isStaticAsset = request.destination === "image" || url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest";
  if (isStaticAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Restaurant Update", body: event.data.text() };
  }

  const title = data.title || "Restaurant Update";
  const options = {
    body: data.body || "New promotion available now.",
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    data: {
      url: data.url || "/promotions"
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/promotions";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
