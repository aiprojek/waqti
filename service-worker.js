
const CACHE_NAME = 'waqti-cache-v3';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.svg',
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching assets');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch(err => {
                console.error('Failed to cache assets during install:', err);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Always go to network for no-store requests (e.g., connectivity checks)
    if (event.request.cache === 'no-store') {
        event.respondWith(fetch(event.request));
        return;
    }

    // Abaikan permintaan API, biarkan logika aplikasi yang menanganinya (dengan localStorage)
    if (event.request.url.includes('api.aladhan.com') || event.request.url.includes('nominatim.openstreetmap.org')) {
        return;
    }

    // Untuk semua permintaan lain, gunakan strategi cache-first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika ada di cache, kembalikan dari cache
                if (response) {
                    return response;
                }
                // Jika tidak, ambil dari jaringan
                return fetch(event.request).then(networkResponse => {
                    // Caching asset yang baru diakses untuk penggunaan offline berikutnya
                    // Validasi: Pastikan response valid, status 200, dan tipe basic (bukan chrome-extension dll) atau cors
                    if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return networkResponse;
                }).catch(() => {
                    // Jika fetch gagal (offline total) dan tidak ada di cache
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return new Response('', { status: 504, statusText: 'Offline' });
                });
            })
    );
});
