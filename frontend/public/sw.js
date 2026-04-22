const CACHE_NAME = 'fann-pomocnik-v1';

// Súbory na cache pri inštalácii
const PRECACHE = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Manuály — Network First (vždy čerstvé, fallback na cache)
  if (url.pathname.startsWith('/api/manuals/') || url.pathname.startsWith('/api/categories')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Fotky — Cache First (menia sa zriedka)
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // HTML/JS/CSS — Cache First, update na pozadí (stale-while-revalidate)
  event.respondWith(staleWhileRevalidate(event.request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Obrázok nie je dostupný offline.', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise;
}
