const CACHE_NAME = 'skynote-v1';
const URLS_TO_CACHE = [
  '/', // Trang chính
  'home.php',
  'login.php',
  'note.php',
  'label.php',
  'trash.php',
  'manifest.json',
  'note_label.php',
  'add_label.php',
  'js/home.js',
  'js/login.js',
  'js/script.js',
  'js/labels.js',
  'js/note_label.js',
  'js/connect.js',
  'css/home.css',
  'css/login.css',
  'image/Anh1.jpg',
  'image/Anh3.jpg',
  'image/sky.jpg',
];

// Cài đặt service worker và cache file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Thay addAll bằng add từng url để bắt lỗi riêng từng url
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
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Xử lý fetch request: ưu tiên fetch từ mạng, fallback cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  //Lấy CSS trực tiếp từ mạng
  // if (event.request.destination === 'style' ||
  //   event.request.url.endsWith('.css')) {
  //   return event.respondWith(fetch(event.request));
  // }

  // Chỉ xử lý GET
  if (event.request.method !== 'GET') {
    return;
  }

  if (url.pathname.endsWith('note.php')) {
    // Ưu tiên fetch từ mạng, cache lại response JSON
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone để cache
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
          return response;
        })
        .catch(() => {
          // Nếu offline, trả về cache
          return caches.match(event.request);
        })
    );
  } else {
    // Các request khác: ưu tiên mạng fallback cache
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
