// 오프라인 실행용 서비스 워커
// 게임 파일: 네트워크 우선 (서버가 켜져 있으면 최신 버전을 받아 저장, 꺼져 있으면 저장본 사용)
// 글꼴 등 외부 파일: 저장본 우선, 뒤에서 갱신
const CACHE = 'shape-defense-v1';
const ASSETS = ['./%EB%8F%84%ED%98%95%20%EB%B0%A9%EC%96%B4.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const put = res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  };
  if (new URL(req.url).origin === location.origin) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(put).catch(() => caches.match(req, { ignoreSearch: true })));
  } else {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(put).catch(() => hit);
      return hit || net;
    }));
  }
});
