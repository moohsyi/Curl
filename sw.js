const CACHE = 'curl-v2';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        CORE.map(u => c.add(u).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;

  if (r.method !== 'GET') return;

  const u = new URL(r.url);
  const isApp = u.origin === location.origin;

  // Let Firebase and other external requests go directly to the network.
  if (!isApp) return;

  e.respondWith(
    fetch(r)
      .then(response => {
        const copy = response.clone();

        caches.open(CACHE).then(cache => {
          cache.put(r, copy);
        });

        return response;
      })
      .catch(() =>
        caches.match(r).then(
          cached => cached || caches.match('./index.html')
        )
      )
  );
});