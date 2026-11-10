// Offline cache for the CCS Scan Helper app. A new version of the app = a new cache name.
const CACHE = 'ccs-scan-2026-11-10.3@' + self.registration.scope;       // one cache per copy of the app (each unit has its own folder)
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && (k.endsWith('@' + self.registration.scope) || (k.startsWith('ccs-scan-') && !k.includes('@')))).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin) || e.request.url.includes('/config.json') || e.request.url.includes('/master_list') || e.request.url.includes('/photos/index.json')) return;     // config.json always comes fresh from the network
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || (await c.match('./index.html'));       // open instantly from the cache, refresh it in the background
  }));
});
