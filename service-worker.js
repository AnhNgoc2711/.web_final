const CACHE_NAME = 'skynote-v1';
const URLS_TO_CACHE = [
  '/',
  '/.web_final/home.php',
  '/.web_final/login.php',
  '/.web_final/js/manifest.json',
  '/.web_final/css/home.css',
  '/.web_final/image/icon.png',
];

// Cài đặt service worker và cache file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          URLS_TO_CACHE.map(url =>
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
            })
          )
        );
      })
  );
});

// Kích hoạt service worker và xóa cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())  // Kiểm soát trang ngay
  );
});

// Xử lý fetch request: ưu tiên fetch từ mạng, fallback cache
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('ws://') || event.request.url.startsWith('wss://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() =>
        caches.match(event.request)
          .then(cachedResponse => cachedResponse || caches.match('/'))
      )
  );
});

// Push notification (nếu dùng)
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "New Notification", body: event.data.text() };
  }

  const title = data.title || "New Notification!";
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/.web_final/image/icon.png',
    badge: '/.web_final/image/icon.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});