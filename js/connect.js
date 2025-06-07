if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js') // KHÔNG thêm slash /
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker failed:', err));
  });
}

Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("🔔 Notification permission granted.");
  }
});
