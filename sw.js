const CACHE = 'zemith-keys-v2.7';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache:'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    // network first so updates arrive, cache when offline
    e.respondWith(fetch(req.url, {cache:'no-store', credentials:'same-origin'}).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; } return caches.match('./index.html').then(h => h || r); }).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.pathname.endsWith('/version.json')) return;   // always from the network
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (url.origin === location.origin || url.host.includes('fonts.g'))) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r; }).catch(() => hit)));
});
