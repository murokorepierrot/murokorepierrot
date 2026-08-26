/* =========================================================================
   Marie Rose Shop — Service Worker
   -------------------------------------------------------------------------
   IMPORTANT: bump CACHE_VERSION every time you deploy a change.
   Changing this string makes the browser treat it as a brand-new cache,
   automatically deleting the old one — this is what stops visitors from
   getting stuck on an old version of the site.
   ========================================================================= */
const CACHE_VERSION = 'v2026-08-25-1';
const STATIC_CACHE = `mrs-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

/* Install: pre-cache the core files, then activate right away instead of
   waiting for every open tab to be closed first. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => { /* precache is best-effort; fetch handler still works without it */ })
  );
  self.skipWaiting();
});

/* Activate: delete every cache that isn't this version, then take control
   of any already-open pages immediately. */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* Let the page force this worker to activate immediately when the visitor
   clicks "Refresh" on the update banner. */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const isHTML =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first for pages: always try to get the latest HTML. Only fall
    // back to the cache if the visitor is offline. This is the key fix —
    // previously a cache-first strategy here is what forced people to do a
    // hard refresh to see anything new.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // CSS/JS/images/fonts: stale-while-revalidate — serve instantly from cache
  // for speed, while quietly fetching the latest copy in the background so
  // the *next* load is already up to date.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
