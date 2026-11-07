// Service Worker for Arrow Up PWA
const CACHE_NAME = "arrow-up-offline-v3";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/icon-maskable-192x192.png",
  "/icon-maskable-512x512.png",
  "/icon-apple-touch.png",
  "/logo.png",
];

// Install: Pre-cache offline page, essential static assets, and offline script/style dependencies
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("[SW] Pre-cache failed for", url, err);
          }
        }),
      );

      // Pre-cache JS chunks and CSS files needed by the offline page
      try {
        const offlineRes = await fetch(OFFLINE_URL);
        if (offlineRes && offlineRes.ok) {
          await cache.put(OFFLINE_URL, offlineRes.clone());
          const html = await offlineRes.text();
          const assetMatches =
            html.match(/(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g) || [];
          for (const matchStr of assetMatches) {
            const cleaned = matchStr
              .replace(/^(?:src|href)=["']/, "")
              .replace(/["']$/, "");
            try {
              await cache.add(cleaned);
            } catch {
              // Ignore individual bundle pre-cache failure
            }
          }
        }
      } catch (err) {
        console.warn("[SW] Offline dependencies extraction error:", err);
      }

      await self.skipWaiting();
    })(),
  );
});

// Activate: Clean up older caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch: Serve offline page when navigation fails without network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  if (url.pathname === "/sw.js") {
    return;
  }

  // 1. Navigation requests: Network-first, fall back to /offline if network fails
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOffline = await caches.match(OFFLINE_URL);
        if (cachedOffline) {
          return cachedOffline;
        }
        return new Response("No Internet Connection", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
    );
    return;
  }

  // 2. Static assets: Cache-first so the offline page assets are available offline
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      }),
    );
  }
});

// Client messaging for PWA updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
