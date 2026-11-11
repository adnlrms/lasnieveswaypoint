/* Las Nieves District WayPoint System — offline support.
   The page itself is fetched network-first (so updates arrive immediately) and kept for
   offline use; fonts, icons and the map library (leaflet/) are cached. Data requests to
   Apps Script are never touched here — the board keeps its own copy of the last loaded week. */
const CACHE = 'lnd-waypoint-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const EXTRA = ['./leaflet/leaflet.js', './leaflet/leaflet.css'];   // nice to have: a missing file must not stop offline support

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(CORE).then(() => Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

/* Only the board itself is saved as the offline page — opening test.html must not replace it. */
const isBoard = url => url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname);

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (/(^|\.)script\.google(usercontent)?\.com$/.test(url.hostname) || url.hostname.endsWith('tile.openstreetmap.org') || url.hostname === 'server.arcgisonline.com') return;

  if (req.mode === 'navigate') {
    if (!isBoard(url)) return;   // other pages (e.g. test.html) load normally and are not cached
    e.respondWith(timeout(fetch(req), 5000)
      .then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return res; })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
