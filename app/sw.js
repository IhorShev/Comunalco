// СКРИПТ САМОЗНИЩЕННЯ КЕШУ
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Видаляємо абсолютно всі кеші, які є в пам'яті
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      // Видаляємо самого себе
      self.registration.unregister();
    })
  );
});

// Блокуємо будь-які спроби зберегти щось нове
self.addEventListener('fetch', (event) => {
  return; 
});
