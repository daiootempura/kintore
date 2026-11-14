// 通信できるときは必ず最新を取りに行き、できないときは前回の控えで画面だけ開けるようにする
const CACHE = 'kintore-v16';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    // cache:'no-cache' でブラウザの控えを使わずサーバーに確認する（更新がすぐ届く）
    fetch(e.request.url, {cache: 'no-cache'}).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
