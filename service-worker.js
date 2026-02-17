
const CACHE_NAME = 'waqti-cache-v2';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon.svg',
    // External Libraries
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    'https://unpkg.com/dexie@latest/dist/dexie.js',
    'https://cdn.quilljs.com/1.3.6/quill.snow.css',
    'https://cdn.quilljs.com/1.3.6/quill.js',
    'https://unpkg.com/prop-types@15.8.1/prop-types.min.js',
    'https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js',
    // Default Media Assets (Sound)
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_32283e5329.mp3?filename=alarm-clock-90867.mp3',
    // Default Media Assets (Images - Wallpapers)
    'https://cdn.pixabay.com/photo/2018/04/24/17/57/masjid-nabawi-3347602_960_720.jpg', // Default Main
    'https://cdn.pixabay.com/photo/2019/10/04/09/20/mosque-4525144_960_720.jpg', // Fajr
    'https://cdn.pixabay.com/photo/2019/11/27/21/06/jerusalem-4657867_960_720.jpg', // Dhuhr
    'https://images.pexels.com/photos/2291789/pexels-photo-2291789.jpeg', // Asr
    'https://cdn.pixabay.com/photo/2013/05/08/14/07/mecca-109852_960_720.jpg', // Maghrib
    'https://images.pexels.com/photos/15463931/pexels-photo-15463931.jpeg', // Isha & Masjidil Haram Theme
    // Preset Theme Wallpapers
    'https://images.pexels.com/photos/35236668/pexels-photo-35236668.jpeg'  // Nusantara
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
                    // Kita bisa mengembalikan fallback page jika ada, tapi untuk aset return null/error
                    return null; 
                });
            })
    );
});
