// A minimal PWA service worker to resolve the 404 error and allow basic caching.

const CACHE_NAME = 'pill-time-cache-v1';
const urlsToCache = [
    './index.html',
    // The Tailwind CDN link is often served by a highly optimized server, so we usually don't cache it,
    // but we can add the main firebase scripts if needed for offline functionality.
];

self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and added core resources');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Fallback to network if nothing is in the cache
                return fetch(event.request);
            })
    );
});
