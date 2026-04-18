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

  // 1. Exclude Vite-specific development assets only
  // This prevents the SW from breaking Vite's HMR websocket and hot updates
  // while still allowing navigation fallbacks to work on localhost
  if (
    url.pathname.includes('@vite') || 
    url.pathname.includes('node_modules') ||
    request.url.includes('token=') || // Vite HMR tokens
    url.pathname.includes('chrome-extension') // Browser extensions
  ) {
    return; // Let browser handle normally
  }

  // 2. Navigation Fallback (SPA Support)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 3. API Strategy: Network First
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
          
          return new Response(JSON.stringify({ error: "Offline", message: "You are offline." }), {
            status: 503,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        })
    );
    return;
  }

  // 4. Asset Strategy: Cache First, then Network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok && (url.origin === self.location.origin || request.destination === 'image')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.destination === 'image') return caches.match('/vite.svg');
        // Return a basic error response instead of undefined
        return new Response('Network error occurred', { status: 408, statusText: 'Network error occurred' });
      });
    })
  );
});
