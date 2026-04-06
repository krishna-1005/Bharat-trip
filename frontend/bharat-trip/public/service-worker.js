const CACHE_NAME = 'bharat-trip-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/og-image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== 'map-tiles').map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache map tiles (Leaflet) - OpenStreetMap and CartoDB
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      caches.open('map-tiles').then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // API calls - Network Only (or cache if you want offline data for specific APIs)
  if (url.origin === self.location.origin || url.hostname.includes('vercel.app')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  } else {
    // For other assets (fonts, etc), try cache then network
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache successful GET requests
            if (request.method === 'GET' && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  }
});
