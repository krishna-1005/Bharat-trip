const STATIC_CACHE = 'static-assets-v4';
const MAP_CACHE = 'map-tiles-v4';
const ITINERARY_CACHE = 'itinerary-cache-v4';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching Core Files');
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // 1. Navigation Fallback (CRITICAL FOR OFFLINE)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 2. Map Tiles
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(staleWhileRevalidate(MAP_CACHE, request));
    return;
  }

  // 3. API Data
  if (url.pathname.includes('/api/trip') || url.pathname.includes('/api/plan')) {
    event.respondWith(staleWhileRevalidate(ITINERARY_CACHE, request));
    return;
  }

  // 4. Static Assets (Bundles, Images, Fonts)
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

  // If we have it in cache, return it immediately, but update in background
  if (cachedResponse) {
    // Background update
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
    }).catch(() => {/* Silent fail for background fetch */});
    
    return cachedResponse;
  }

  // If not in cache, fetch and put in cache
  return fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // If network fails and NO cache, last resort is index.html for UI shell
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
  });
}
