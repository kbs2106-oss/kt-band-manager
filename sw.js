/* 충주 KT대리점 칠금점 · 가망고객 밴드 — 오프라인 캐시 (v8.12) */
/* v8.7(#18345): 화면(HTML)은 HTTP 캐시까지 건너뛰고(cache:'no-store') 항상 네트워크에서 새로 받는다.
   GitHub Pages 가 index.html 을 10분(max-age=600) 캐시하기 때문에, 예전에는 한참 전 화면이 떠서
   "수정이 바로 반영되지 않는다"고 느껴졌다. 오프라인일 때만 캐시로 넘어간다.
   v8.12: 사진 썸네일(thumbs/)은 따로 캐시에 담아 한 번 뜬 사진은 다시 받지 않는다(0ms). */
var CACHE = 'kt-band-v8.12';
var IMG = 'kt-band-img-v1';          /* 썸네일 전용 — 앱 버전이 올라가도 그대로 쓴다(주소가 내용 해시라 안전) */
var CACHE_PREFIX = 'kt-band-';
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
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
      .catch(function(){ /* 파일 하나가 없어도 설치는 끝낸다 */ })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      /* v8.7: 이 앱(kt-band-*)의 옛 캐시만 지운다.
         같은 도메인(kbs2106-oss.github.io)에 개통장부(kt-ledger-*) 캐시가 함께 있어서,
         예전처럼 전부 지우면 장부 앱의 오프라인 캐시·SheetJS 를 매번 다시 받아 느려졌다.
         v8.12: 썸네일 캐시(IMG)는 버전과 무관하게 남긴다. */
      return Promise.all(keys.filter(function(k){
        return k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE && k !== IMG;
      }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* 화면(HTML) 요청인지 — 주소 이동 / index.html / '/' / text/html */
function isDocRequest(req, url){
  if(req.mode === 'navigate') return true;
  if(url.pathname === '/' || /\/index\.html$/.test(url.pathname)) return true;
  return (req.headers.get('accept') || '').indexOf('text/html') !== -1;
}

/* 네트워크 우선(HTTP 캐시 무시) → 실패했을 때만 캐시 */
function networkFirstDoc(req){
  return fetch(req, { cache: 'no-store' }).then(function(res){
    if(res && res.ok){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ return c.put('./index.html', copy); }).catch(function(){});
      return res;
    }
    /* 404·5xx (배포 직후 등) 는 실패로 보고 캐시로 넘어간다 */
    return caches.match('./index.html', { ignoreSearch: true }).then(function(hit){
      return hit || res;
    });
  }).catch(function(){
    return caches.match('./index.html', { ignoreSearch: true })
      .then(function(hit){ return hit || caches.match('./'); });
  });
}

/* v8.12: 사진 썸네일 — 캐시 우선. 주소가 내용(원본 주소) 해시라 한 번 받으면 바뀌지 않는다. */
function cacheFirstThumb(req){
  return caches.open(IMG).then(function(c){
    return c.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        if(res && res.ok){
          try{ c.put(req, res.clone()).catch(function(){}); }catch(e){}
        }
        return res;
      });
    });
  });
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(url.origin !== location.origin) return;

  /* v8: 과거 전체 명단(archive.json, 3.4MB)은 설치 때 미리 받지도, 캐시에 쌓지도 않는다.
     앱이 IndexedDB에 한 번 넣어 두고 그걸로 조회하므로 네트워크로만 받으면 된다. */
  if(/\/archive\.json$/.test(url.pathname)) return;

  /* 문서는 항상 네트워크에서 새로(캐시 무시), 오프라인일 때만 캐시 */
  if(isDocRequest(req, url)){
    e.respondWith(networkFirstDoc(req));
    return;
  }

  /* v8.12: 썸네일(thumbs/*.jpg)은 전용 캐시에서 바로 — 목록을 다시 열어도 사진이 즉시 뜬다 */
  if(/\/thumbs\/[^/]+\.(jpg|jpeg|png|webp)$/i.test(url.pathname)){
    e.respondWith(cacheFirstThumb(req));
    return;
  }

  /* 정적 자산은 캐시 우선 */
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        if(res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); }).catch(function(){});
        }
        return res;
      });
    })
  );
});

/* 페이지에서 "지금 새 버전으로 바꿔라" 라고 보낼 때 */
self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
