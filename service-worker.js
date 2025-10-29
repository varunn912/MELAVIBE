const CACHE_NAME = 'melavibe-online-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Core Dependencies for offline functionality
  'https://cdn.tailwindcss.com',
  // React Dependencies from importmap
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/react@^19.1.1/jsx-runtime',
  // QR Code libraries
  'https://esm.sh/qrcode@1.5.3',
  'https://esm.sh/html5-qrcode@2.3.8',
  // Gemini API SDK
  'https://esm.sh/@google/genai',
  // Firebase SDK modules from importmap
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js',
];

// The install event is fired when the service worker is first installed.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Pre-caching app shell.');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// The activate event is fired when the service worker becomes active.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // Clean up old caches that are no longer needed.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// The fetch event is fired for every network request.
self.addEventListener('fetch', event => {
  // Use a "cache-first" strategy for app assets.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If the response is in the cache, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch the resource from the network.
      return fetch(event.request).then(networkResponse => {
        // If we get a valid response, clone it, cache it, and return it.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        console.error('Service Worker: Fetch failed:', error);
      });
    })
  );
});
