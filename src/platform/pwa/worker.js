/* global self, caches, fetch, URL, Request */
// eslint-disable-next-line no-undef
const BUILD = __BUILD__;
// eslint-disable-next-line no-undef
const ASSETS = __ASSETS__;
const PREFIX = 'merge-discovery-build-';
const CACHE = PREFIX + BUILD;
const allowed = new Set(ASSETS);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      await Promise.all(ASSETS.map(async path => {
        const response = await fetch(new Request(path, { cache: 'reload' }));
        if (!response.ok || response.type === 'opaque') throw new Error('Incomplete app build');
        await cache.put(path, response);
      }));
    } catch (error) { await caches.delete(CACHE); throw error; }
  })());
  // No skipWaiting here: an update remains waiting until the player accepts it.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const keys = (await caches.keys()).filter(key => key.startsWith(PREFIX));
    // Keep old lazy assets while other tabs may still be executing an older build.
    // When alone, retain this build and its immediate predecessor as a transition fallback.
    if (clients.length <= 1) {
      const previous = keys.filter(key => key !== CACHE).at(-1);
      await Promise.all(keys.filter(key => key !== CACHE && key !== previous).map(key => caches.delete(key)));
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const appNavigation = request.mode === 'navigate' && /^\/(?:$|island\/?$|collection\/?$|collections(?:\/[^/]+)?\/?$|sets(?:\/[^/]+)?\/?$|elements\/[^/]+\/?$|explore(?:\/(?:map|anomalies))?\/?$|map\/?$|anomalies\/?$|settings\/?$)/.test(url.pathname);
  // Navigation query strings are UI selection, never imported/save data.
  if (!appNavigation && (url.search || (!allowed.has(url.pathname) && !/^\/assets\/[^/]+-[\w-]+\.(?:js|css)$/.test(url.pathname)))) return;
  event.respondWith((async () => {
    const path = appNavigation ? '/index.html' : url.pathname;
    const current = await (await caches.open(CACHE)).match(path);
    if (current) return current;
    // Read only prior app-build caches for an old tab's hashed lazy chunks.
    for (const key of (await caches.keys()).filter(key => key.startsWith(PREFIX))) {
      const previous = await (await caches.open(key)).match(path);
      if (previous) return previous;
    }
    // No runtime response writes: save exports/imports and arbitrary URLs are never cached.
    return fetch(request);
  })());
});
