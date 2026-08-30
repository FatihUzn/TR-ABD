/* ============================================================
   sw.js — service worker.
   İki iş yapıyor:
     1. Panel çevrimdışı açılsın (telefonda uçak modunda bile).
     2. state.json HER ZAMAN ağdan çekilsin — yoksa telefon
        eski durumu gösterir ve senkronun anlamı kalmaz.
   Panelde değişiklik yaptığında SURUM'u bir artır.
   ============================================================ */
const SURUM = 'panel-v13';
const KABUK = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './arka.svg',
  './icon-192.png',
  './icon-512.png',
  './fonts/inter-latin-400-normal.woff2',
  './fonts/inter-latin-ext-400-normal.woff2',
  './fonts/inter-latin-500-normal.woff2',
  './fonts/inter-latin-ext-500-normal.woff2',
  './fonts/inter-latin-600-normal.woff2',
  './fonts/inter-latin-ext-600-normal.woff2',
  './fonts/inter-latin-700-normal.woff2',
  './fonts/inter-latin-ext-700-normal.woff2',
  './fonts/jetbrains-mono-latin-400-normal.woff2',
  './fonts/jetbrains-mono-latin-ext-400-normal.woff2',
  './fonts/jetbrains-mono-latin-700-normal.woff2',
  './fonts/jetbrains-mono-latin-ext-700-normal.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SURUM)
      .then(function (c) { return Promise.allSettled(KABUK.map(function (u) { return c.add(u); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== SURUM; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Diğer her şey: önbellekten ver, arka planda tazele.
  e.respondWith(
    caches.match(req).then(function (cached) {
      const ag = fetch(req).then(function (r) {
        if (r && r.status === 200) {
          const kopya = r.clone();
          caches.open(SURUM).then(function (c) { c.put(req, kopya); });
        }
        return r;
      }).catch(function () { return cached; });
      return cached || ag;
    })
  );
});
