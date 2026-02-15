// Kill switch: This replaces the old custom service worker.
// When mobile browsers fetch this for an update check, it self-destructs
// and clears all stale caches so the app loads fresh.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => caches.delete(name)))
    ).then(() => self.registration.unregister())
     .then(() => self.clients.matchAll())
     .then((clients) => clients.forEach((c) => c.navigate(c.url)))
  );
});
