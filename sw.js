// Procesador URN · service worker
// - Páginas propias: red primero (sin caché HTTP, para ver las versiones nuevas), pero si la red
//   no responde en 3,5 s o no hay conexión, se sirve la copia guardada.
// - Fuentes y otros recursos externos: copia guardada primero (no cambian).
const CACHE = 'procesador-urn-v1.6.3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png', 'favicon.ico', 'icon-48.png', 'icon-64.png', 'icon-96.png', 'icon-128.png', 'icon-256.png'];
const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap';
const NET_TIMEOUT = 3500;
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })));
    try { // fuentes: si hay red al instalar, se guardan ya (la hoja y sus ficheros)
      const css = await fetch(FONTS); if (css.ok) { await c.put(FONTS, css.clone()); const txt = await css.text();
        const urls = [...txt.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);
        await Promise.all(urls.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {}))); }
    } catch (err) {}
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const put = (req, r) => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === self.location.origin;
  if (!same) { // externos: caché primero
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => put(e.request, r))));
    return;
  }
  e.respondWith((async () => {
    const cached = (await caches.match(e.request, { ignoreSearch: true })) || (e.request.mode === 'navigate' ? await caches.match('index.html') : undefined);
    const net = fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => put(e.request, r));
    if (!cached) return net.catch(() => caches.match('index.html'));
    const r = await Promise.race([net.catch(() => null), new Promise(res => setTimeout(() => res(null), NET_TIMEOUT))]);
    return r || cached;
  })());
});
