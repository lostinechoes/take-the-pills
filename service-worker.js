// Service Worker for Pill Time Reminder PWA
// Caches core assets for offline use and handles push notifications.

const CACHE_NAME = 'pill-time-cache-v1';
const urlsToCache = [
    './index.html',
    // The main script is embedded in index.html, so only the HTML is needed.
    // We assume the environment provides the manifest.json path correctly.
    // Using a placeholder icon link from the HTML for robustness.
    'https://placehold.co/192x192/8B5CF6/ffffff?text=Pill', 
];

// --- INSTALL EVENT ---
self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and cached core assets.');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache resources:', error);
            })
    );
    self.skipWaiting(); // Forces the waiting service worker to become the active service worker
});

// --- FETCH EVENT (Cache strategy: Cache first, then network) ---
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Not found in cache - fetch from network
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. 
                        // A response is a stream and can only be consumed once.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Only cache GET requests
                                if (event.request.method === 'GET') {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    }
                );
            })
            .catch(error => {
                console.error('Fetch failed for:', event.request.url, error);
                // Can return an offline fallback page here if needed
                return new Response('Network request failed and no cache available.');
            })
    );
});


// --- ACTIVATE EVENT ---
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Immediately start controlling clients
});

// --- PUSH/NOTIFICATION LOGIC (Basic implementation for reminders) ---
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // This is where you might open the app when the notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});


// NOTE: For real-time pill reminders, you would typically use a background synchronization 
// process (like Periodic Sync or Firebase Cloud Messaging) to trigger a notification 
// when the scheduled time arrives. Since external background services are limited in this 
// environment, this service worker focuses on PWA installation and basic notification handling.
// The primary reminder logic is time-based within the main app itself.
