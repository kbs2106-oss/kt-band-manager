/* 충주 KT대리점 칠금점 · 가망고객 밴드 — 오프라인 캐시 (v8.40) */
/* v8.7(#18345): 화면(HTML)은 HTTP 캐시까지 건너뛰고(cache:'no-store') 항상 네트워크에서 새로 받는다.
   GitHub Pages 가 index.html 을 10분(max-age=600) 캐시하기 때문에, 예전에는 한참 전 화면이 떠서
   "수정이 바로 반영되지 않는다"고 느껴졌다. 오프라인일 때만 캐시로 넘어간다.
   v8.12: 사진 썸네일(thumbs/)은 따로 캐시에 담아 한 번 뜬 사진은 다시 받지 않는다(0ms).
   v8.13: 댓글 사진(바로 촬영·앨범) + 접힌 카드 바로 댓글 + 고정 공지 전체 노출. 화면만 바뀜(캐시 키만 올림).
   v8.14: 담당자 드롭다운을 카드 상단(이름 옆)으로, 메모는 하단 한 줄.
   v8.15: 📌 고정 공지를 '전체' 피드 최상단에 항상 노출(6건 자르기에서 제외). 화면만 바뀜(캐시 키만 올림).
   v8.16: 📵 부재중 킵 · ⏰ 예약 킵 반반(2열) — 홈 피드·명단 탭 맨 위. 화면만 바뀜(캐시 키만 올림).
   v8.17: 오른쪽 아래 + 를 전 직원에게 — 직원은 ⏰ 예약 추가, 관리자는 예약/명단 선택. 예약 표기에 해(26.11.28) 포함.
   v8.18: 관리자 모드 전용 글(공지) 삭제 — 확인 후 band_push(f.deleted)로 전 직원 폰에서 함께 사라진다. 화면만 바뀜(캐시 키만 올림).
   v8.19: 피드 미리보기 댓글 → 댓글 창 · 예약 '상담 댓글' → 그 댓글까지 스크롤+강조 · 예약 목록 가까운 순 정렬·필터.
   v8.20: 앱을 껐다 켜면 홈 피드 댓글 접힌 기본 상태 · 모두 접기 때 보던 글 자리 유지 · 사전예약 확정건 명칭. 화면만 바뀜(캐시 키만 올림).
   v8.21: 사전예약 확정건 박스의 '＋ 확정건 추가' 버튼을 가운데 정렬. 화면만 바뀜(캐시 키만 올림).
   v8.23: 배너(부재중 킵 / 예약 킵)는 홈·명단 모두 그대로, 명단 탭 예약 화면의 '⏰ 예약 고객 N' 제목 박스만 제거(배너와 중복). 화면만 바뀜(캐시 키만 올림).
   v8.24: 상태 버튼(부재·예약·완료·개통완료)을 눌러도 화면이 튀지 않게 기준 카드를 잡아 보정 · 부재중 킵 카드에 '－ 부재 1회' 차감 버튼 추가. 화면만 바뀜(캐시 키만 올림).
   v8.25: 🔔 알람 탭 — 직원 상태·메모·댓글 변경과 오늘 예약·처리 대상을 한곳에 모아 미확인 배지·확인 이력으로 유지(200건 영구 보관) · 소리·진동/폰 상단 알림 토글 · 730·550·3년 '전체'에서 지난 날짜 접기 + 접힌 줄에 미통화·부재·완료·개완 건수 · 날짜 무한 스크롤(20일씩) · 저장 즉시 band_push(0ms). 화면만 바뀜(캐시 키만 올림).
   v8.26: 📅 기간 옆 '전체 기간' 원탭 버튼 — 드롭다운을 열지 않고 1탭에 전체 연도·전체 월로 복귀(이미 전체면 진한 색). 화면만 바뀜(캐시 키만 올림).
   v8.27: 📅 기간 바를 개통장부 '기준 월' 바와 같은 흰 둥근 카드 한 줄로 — 연 ▾ · 월 ▾ · [이번 달] · [전체 기간] 두 칩(활성은 연한 파랑). 화면만 바뀜(캐시 키만 올림).
   v8.28: 홈 피드의 [전체]·[상담]·[사전예약] 칩과 [모두 펼치기/접기] 버튼을 한 줄로 — 칩은 왼쪽, 버튼은 오른쪽 끝(390·360·320px). 화면만 바뀜(캐시 키만 올림).
   v8.29: 📵 부재중 킵 배너·📌 킵 버튼·킵 해제를 모두 없앰 — 상단은 ⏰ 예약 킵 한 칸만, 고객 카드는 부재 상태 칩·＋/－ 부재 1회만. 화면만 바뀜(캐시 키만 올림).
   v8.30: v8.29에서 뺐던 📵 부재중 킵 · ⏰ 예약 킵 반반 배너와 📌 킵·킵 해제를 되살리고, 검색창 아래에 같은 제목으로 또 뜨던 큰 머리 박스(flathead)만 한 줄로 바꿈. 화면만 바뀜(캐시 키만 올림).
   v8.31: 부재·부재중 킵 카드와 예약 킵·예약 알람 목록에도 📞 번호 옆 생년월일(만 나이) — 명단 카드와 같은 모양.
   v8.32: 예약 목록에도 생년월일이 늘 보이게 — 앱에서 직접 추가한 고객은 번호로 명단·과거 장부에서 생일을 찾아 채우고,
          없으면 '생일 없음'을 눌러 입력(예약 추가·명단 추가에도 생년월일 칸). 화면만 바뀜(캐시 키만 올림).
   v8.33: 730·550·3년 '전체'에서 접힌 날짜를 열고 닫을 때 화면이 위로 튀던 문제 — 목록 전체를 다시 그리지 않고
          그 날짜 카드만 제자리에서 접고 편다(누른 날짜 줄 좌표 0px 고정). 화면만 바뀜(캐시 키만 올림).
   v8.34: 댓글·답글 사진을 전 직원 폰에서 함께 보게 — 사진은 서버 '_밴드사진'에 따로 보관하고(band_ph),
          댓글에는 이름표(ref)만 실어 보낸다. 사진은 화면에 필요할 때만 받아 이 폰에 캐시.
          옛 서버에서는 예전처럼 이 폰에만 보인다. 화면+동기화가 바뀜(캐시 키 올림).
   v8.35: 730·550·3년 카드에 '📱 기존 개통 모델명' 한 줄(시드·과거 명단·개통장부 기종) · 카드 맨 아래 '담당 ●'와
          '메모 26.11.28 15:40' 작성일시·작성자(저장할 때 기록, 서버로도 함께) · 고정 공지 5건 ·
          아직 서버로 안 올라온 사진은 '📷 전송 대기 중'(탭하면 다시 확인). 화면+동기화가 바뀜(캐시 키 올림).
   v8.36: 헤더 🔍(🔔 왼쪽) — 홈 피드 글 제목·본문·댓글·답글·작성자·사전예약 확정건을 한 번에 찾고,
          검색어와 맞은 댓글은 카드의 댓글 창을 자동으로 펼쳐 노란색으로 표시한다(띄어쓰기·대소문자 무시,
          6건 자르기 없이 모두 표시). 홈 피드 글·댓글 글씨와 댓글 사진을 밴드처럼 크게. 화면만 바뀜(캐시 키만 올림).
   v8.37: 글의 댓글 한 줄 메모 — 댓글 머리의 '답글' 쓰기 버튼 자리에 '📝 메모'(누르면 한 줄 입력),
          저장하면 노란 상자(📝 메모 · 쓴 시각 · 쓴 사람)로 보이고 탭해서 고친다. 검색은 메모 글자까지 찾아 노랗게 표시.
          밴드에서 가져온 예전 답글(c.replies)은 그대로 읽기만 한다. 화면+동기화가 바뀜(캐시 키 올림).
   v8.38: 댓글 입력 바를 다시 한 줄로 — [입력칸][📷][등록] 을 슬림하게(gap 6·높이 42) 둬 입력칸을 가장 넓게,
          붙인 사진 미리보기는 있을 때만 아래 줄. 화면만 바뀜(캐시 키만 올림).
   v8.39: 설정의 '초기화(시드로 되돌리기)' 버튼 제거 · 설정 하단 버전은 meta(app-version)을 읽어 표시 ·
          새 버전 확인을 HEAD 대신 index.html 앞부분(Range)의 app-version 으로 — 다르면 sw 캐시를 비우고 바로 새로고침.
          화면만 바뀜(캐시 키만 올림).
   v8.40: 설정의 '내보내기'를 관리자 모드(PIN 0525) 전용으로 — 직원 화면에는 항목도, PC 레일 '데이터' 카드도 없다
          (실행 처리 case 'export'도 관리자가 아니면 막는다). 설정의 '직원 전환(다른 직원으로 로그인)' 항목 제거 —
          로그아웃으로 나가면 직원을 고를 수 있다. 화면만 바뀜(캐시 키만 올림). */
var CACHE = 'kt-band-v8.40';
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
      /* v8.39: 앞부분만 받는 확인 요청(Range → 206)은 잘린 문서라 캐시에 넣지 않는다 —
         넣으면 오프라인에서 8KB 짜리 깨진 화면이 뜬다. */
      if(res.status !== 206){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ return c.put('./index.html', copy); }).catch(function(){});
      }
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
