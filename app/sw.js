// 1. ЗМІНЮЙТЕ ЦЮ ЦИФРУ (наприклад, v1 на v2), коли хочете оновити сайт у всіх
const CACHE_NAME = 'comunalco-cache-v2.1'; 

const ASSETS = [
  '/',
  '/index.html',
  // Додайте сюди ваші іконки або логотипи, якщо вони є:
  // '/logo.png',
  // '/icon.png'
];

// Встановлення: завантажуємо базові файли
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Змушуємо новий SW активуватися негайно
});

// Активація: видаляємо старий кеш
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Негайно беремо під контроль усі відкриті вкладки
});

// Перехоплення запитів: виправляємо червоні помилки в консолі
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ІГНОРУЄМО: не-GET запити (POST, DELETE), розширення Chrome та Supabase
  if (
    event.request.method !== 'GET' || 
    !url.protocol.startsWith('http') || 
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('google')
  ) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Кешуємо тільки успішні відповіді
          if (fetchResponse.status === 200) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
        // Якщо немає мережі — намагаємося віддати хоча б головну сторінку
        if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
        }
    })
  );
});
