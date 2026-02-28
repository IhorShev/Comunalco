const CACHE_NAME = 'comunalco-v7.0';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key))); // Видаляємо ВСІ старі кеші
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Пропускаємо всі запити до бази даних (щоб дата завжди була актуальною)
  if (url.hostname.includes('supabase.co') || event.request.method !== 'GET') return;

  event.respondWith(
    // 🔥 МАГІЯ ТУТ: cache: 'no-store' повністю забороняє брати старі файли з пам'яті
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
