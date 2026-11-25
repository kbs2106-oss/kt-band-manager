/* 충주 KT대리점 칠금점 · 가망고객 밴드 — 오프라인 캐시 (v8.4) */
var CACHE = 'kt-band-v8.4';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png',
  './samples/sample-consult.png',
  './samples/sample-notice.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== location.origin) return;

  /* v8: 과거 전체 명단(archive.json, 3.4MB)은 설치 때 미리 받지도, 캐시에 쌓지도 않는다.
     앱이 IndexedDB에 한 번 넣어 두고 그걸로 조회하므로 네트워크로만 받으면 된다. */
  if(/\/archive\.json$/.test(url.pathname)) return;

  /* 문서는 네트워크 우선(업데이트 즉시 반영), 실패 시 캐시 */
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put('./index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match('./index.html');
      })
    );
    return;
  }

  /* 정적 자산은 캐시 우선 */
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        if(res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
