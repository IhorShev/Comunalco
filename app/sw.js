const APP_VERSION = '6.1';
const CACHE_NAME = 'comunalco-cache-v' + APP_VERSION;

// 1. Список файлів для швидкого доступу та офлайн-роботи
const urlsToCache = [
    'index.html',
    'tenant.html',
    'manifest.json',
    'manifest-tenant.json',
    'icon.png',
    'logo.png',
    'sw.js'
];

// 2. Встановлення: завантажуємо файли в пам'ять телефону
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 3. Активація: видаляємо старий кеш попередніх версій
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Беремо контроль над сторінкою безпечно
    event.waitUntil(self.clients.claim());
});

// 4. Робота з запитами: якщо файл є в кеші — беремо його звідти (це миттєво)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            // Якщо зовсім немає інтернету і файлу в кеші
            return new Response('Офлайн режим: перевірте з’єднання');
        })
    );
});
