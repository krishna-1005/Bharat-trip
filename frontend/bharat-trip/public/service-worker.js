const VERSION = 'v8';
const CACHE_NAME = `bt-cache-${VERSION}`;

// Assets that MUST be cached for the app to work offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      // Using allSettled to prevent one missing file from breaking the SW
      return Promise.allSettled(
        CORE_ASSETS.map(asset => cache.add(asset).catch(err => console.warn(`Failed to cache ${asset}:`, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Navigation Fallback (SPA Support)
  // When user refreshes on /results or /map, serve index.html from cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 2. API Strategy: Network First
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.method === 'GET') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          
          // Fallback for API calls when offline and not cached
          // Added CORS headers so Vercel can read this response from the Render API
          return new Response(JSON.stringify({ error: "Offline", message: "You are offline and this data is not cached." }), {
            status: 503,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*', // Critical for cross-origin offline messages
              'Access-Control-Allow-Credentials': 'true'
            }
          });
        })
    );
    return;
  }

  // 3. Asset Strategy: Cache First, then Network
  // This handles Vite JS/CSS bundles and prevents the blank white screen
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Cache successful responses from our own origin or images
        if (response.ok && (url.origin === self.location.origin || request.destination === 'image')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        // If offline and image fails, show placeholder
        if (request.destination === 'image') return caches.match('/vite.svg');
      });
    })
  );
});
