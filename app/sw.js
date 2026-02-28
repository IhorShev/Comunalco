const CACHE_NAME = 'comunalco-v6.0';

// 1. Встановлення (одразу активуємо)
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
});

// 2. Активація (видаляємо ВСІ старі кеші)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Перехоплення запитів (СТРАТЕГІЯ "NETWORK FIRST")
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ігноруємо системні запити та запити до баз даних
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  event.respondWith(
    // СПЕРШУ ЗАВЖДИ ЙДЕМО В ІНТЕРНЕТ ЗА СВІЖИМ КОДОМ
    fetch(event.request)
      .then((response) => {
        // Якщо інтернет є і код завантажився успішно - оновлюємо свій кеш
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response; // Віддаємо вам найсвіжішу версію
      })
      .catch(() => {
        // І ТІЛЬКИ ЯКЩО ІНТЕРНЕТУ НЕМАЄ - дістаємо стару версію з кешу
        return caches.match(event.request);
      })
  );
});
