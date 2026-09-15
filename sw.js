// Skin Tool — service worker
//
// The whole point of this build is that the phone never has to swallow all 38 MB at
// once. The app shell is precached (about 1.3 MB); vehicle models and skins are only
// cached once the user actually picks that vehicle.
//
// Bump CACHE when you deploy. The old cache is dropped on activate, so users get the
// new build on their next visit without doing anything.

const CACHE = 'skin-tool-v1';

// Relative URLs so this works at /<repo>/ on a GitHub project site as well as at a
// domain root. new URL(..., registration.scope) resolves them against wherever the
// worker was registered.
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './vendor/viewer-deps.js',
  './ground.jpg',
  './vehicles/vehicles.json',
  './vehicles/overrides.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll rejects the whole batch if any single request fails, which would leave
    // the worker uninstalled. Failing per-file keeps a missing icon from taking the
    // app offline support down with it.
    await Promise.all(SHELL.map(async path => {
      try {
        const url = new URL(path, self.registration.scope).href;
        const res = await fetch(url, { cache: 'reload' });
        if (res.ok) await cache.put(url, res);
      } catch (e) {
        // ignore — it will be fetched and cached on first use instead
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

const isAsset = url => /\.(fbx|png|jpe?g|webp|js)$/i.test(url.pathname);

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // vehicles.json and overrides.json describe what exists, so a stale copy would hide
  // newly added vehicles. Network first, cache only as the offline fallback.
  if (url.pathname.endsWith('.json')) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
        return res;
      } catch (e) {
        const hit = await caches.match(req);
        if (hit) return hit;
        throw e;
      }
    })());
    return;
  }

  // Models, skins and the bundle never change without a redeploy, and a redeploy
  // bumps CACHE. Serve from cache when present, otherwise fetch and keep a copy —
  // this is what makes each vehicle load once and stay available offline.
  if (isAsset(url)) {
    event.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
      return res;
    })());
    return;
  }

  // Navigations: try the network so a redeploy is picked up, fall back to the cached
  // shell when offline.
  event.respondWith((async () => {
    try {
      return await fetch(req);
    } catch (e) {
      const hit = await caches.match(req)
        || await caches.match(new URL('./index.html', self.registration.scope).href);
      if (hit) return hit;
      throw e;
    }
  })());
});
