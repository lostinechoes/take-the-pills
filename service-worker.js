// Service Worker for basic caching to enable PWA offline/instant loading
const CACHE_NAME = 'pill-time-cache-v1';
const urlsToCache = [
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
    // Firebase SDKs and external assets are generally not cached by Service Workers
    // in this environment, but the main app and CSS link are included.
];

self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // We fetch the files and add them to the cache
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('Failed to cache required files during install:', err);
                });
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
                // No cache hit - fetch from network
                return fetch(event.request);
            }
        )
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});