const STATIC_CACHE = 'static-assets-v3';
const MAP_CACHE = 'map-tiles-v3';
const ITINERARY_CACHE = 'itinerary-cache-v3';

// Only pre-cache absolutely essential files that exist in /public
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/og-image.png'
];

// 1. Install Event: Robust Pre-caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching App Shell');
      // Using map to catch individual errors so one missing file doesn't break the whole SW
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url))
      ).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn('[SW] Some assets failed to pre-cache:', failed);
        }
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, MAP_CACHE, ITINERARY_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Strategy: Map Assets
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(staleWhileRevalidate(MAP_CACHE, request));
    return;
  }

  // Strategy: Vital Itinerary Data
  if (url.pathname.includes('/api/trip') || url.pathname.includes('/api/plan')) {
    event.respondWith(staleWhileRevalidate(ITINERARY_CACHE, request));
    return;
  }

  // Strategy: Static Assets & App Shell
  // We include localhost and common font CDNs
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE, request));
    return;
  }
});

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkFetch = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed (Offline) - already handled by returning cachedResponse below
  });

  return cachedResponse || networkFetch;
}
