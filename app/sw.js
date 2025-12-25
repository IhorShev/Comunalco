const CACHE_NAME = 'comunalco-v3.0'; // <--- Я змінив v1 на v3.0. Це сигнал для оновлення!
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. Встановлення
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Змушує новий код вступити в дію негайно
});

// 2. Активація (чистка старого)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
             // Видаляємо старий кеш (v1, v2 і т.д.)
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Перехоплюємо контроль над сторінкою
});

// 3. Стратегія "Network First" (Спочатку Інтернет)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Якщо інтернет є і файл скачався:
        // 1. Робимо копію відповіді
        const resClone = res.clone();
        // 2. Оновлюємо кеш свіжою версією
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        // 3. Віддаємо користувачу свіжий файл
        return res;
      })
      .catch(() => {
        // Якщо інтернету немає або помилка — беремо з кешу
        return caches.match(e.request);
      })
  );
});
