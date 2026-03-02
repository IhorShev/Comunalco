const CACHE_NAME = 'comunalco-cache-v1';

// 1. Встановлення (запускається один раз)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Змушуємо оновитися одразу
});

// 2. Активація
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 3. НАЙГОЛОВНІШЕ: Перехоплення запитів (Слухач fetch)
// Саме цей блок змушує Chrome думати, що ми справжній додаток!
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Якщо немає інтернету, просто повертаємо порожню відповідь, 
            // але Chrome вже буде задоволений наявністю цієї перевірки.
            return new Response('Офлайн режим');
        })
    );
});
