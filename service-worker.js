const CACHE_NAME = 'auron-soul-shell-v6';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon.png', './icon-192.png', './icon-maskable-192.png', './icon-maskable-512.png', './logo-light.png', './logo-dark.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isPage = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isPage) {
    event.respondWith(fetch(event.request).then(res => {
      const copy = res.clone();
      if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
    const copy = res.clone();
    if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
    return res;
  }).catch(() => caches.match('./index.html'))));
});
