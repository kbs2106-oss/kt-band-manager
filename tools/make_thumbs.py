#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""kt-band-manager · 사진 썸네일 생성 (v8.12)

index.html 의 시드(seedV8)에 들어 있는 밴드 사진 주소(coresos-phinf.pstatic.net)를
네이버 포토 CDN 의 축소본(?type=w300, 약 5~10KB)으로 받아 thumbs/<hash>.jpg 로 저장합니다.

· 앱(js_views.js)은 사진 주소를 같은 해시(FNV-1a 32bit → base36)로 바꿔 thumbs/... 를 먼저 띄우고,
  사진을 탭해 크게 볼 때만 원본 주소를 씁니다. 썸네일이 없으면 원본으로 자동 폴백합니다.
· 이미 받아 둔 썸네일은 건너뛰므로, 매일 새 글이 올라온 뒤 이 스크립트만 다시 돌리면 새 사진만 추가됩니다.
· 원본을 내려받지 않고 CDN 축소본을 쓰기 때문에 778장이 10초 안팎에 끝납니다.

사용법:
  python3 tools/make_thumbs.py                # index.html 시드 기준으로 없는 썸네일만 생성
  python3 tools/make_thumbs.py --workers 24
"""
import argparse
import concurrent.futures as cf
import io
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')
THUMBS = os.path.join(ROOT, 'thumbs')
HOST = 'https://coresos-phinf.pstatic.net/'
SIZE_Q = '?type=w300'          # 앱 화면(3열·76px)에서 3배 밀도까지 충분한 폭


def fnv(s):
    """JS thumbHash() 와 같은 값 — FNV-1a 32bit."""
    h = 2166136261
    for b in s.encode('utf-8'):
        h ^= b
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def b36(n):
    if n == 0:
        return '0'
    out = ''
    while n:
        n, r = divmod(n, 36)
        out = '0123456789abcdefghijklmnopqrstuvwxyz'[r] + out
    return out


def thumb_name(url):
    return b36(fnv(url)) + '.jpg'


def seed_urls():
    s = open(INDEX, encoding='utf-8').read()
    m = re.search(r'<script id="seedV8" type="application/json">(.*?)</script>', s, re.S)
    if not m:
        sys.exit('index.html 에서 seedV8 을 찾지 못했습니다.')
    d = json.loads(m.group(1))
    urls = []
    for p in d.get('posts') or []:
        for ph in p.get('photos') or []:
            urls.append(ph.get('src') or '')
        for c in p.get('comments') or []:
            for ph in c.get('photos') or []:
                urls.append(ph.get('src') or '')
            for r in c.get('replies') or []:
                for ph in r.get('photos') or []:
                    urls.append(ph.get('src') or '')
    out, seen = [], set()
    for u in urls:
        if u and u.startswith(HOST) and u not in seen:
            seen.add(u)
            out.append(u)
    return out


def fetch(url, dest):
    """CDN 축소본을 받아 저장. 실패하면 (False, 이유)."""
    for attempt in (1, 2):
        try:
            req = urllib.request.Request(url + SIZE_Q, headers={
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
                'Referer': 'https://band.us/'})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = r.read()
            if len(data) < 200:
                raise ValueError('too small (%d)' % len(data))
            if not (data[:3] == b'\xff\xd8\xff' or data[:8] == b'\x89PNG\r\n\x1a\n'
                    or data[:4] == b'RIFF'):
                raise ValueError('not an image')
            if len(data) > 60000:
                raise ValueError('too big (%d)' % len(data))
            tmp = dest + '.part'
            with open(tmp, 'wb') as f:
                f.write(data)
            os.replace(tmp, dest)
            return True, len(data)
        except Exception as e:      # noqa: BLE001 — 실패 사유를 그대로 모은다
            if attempt == 2:
                return False, str(e)[:120]
    return False, 'unknown'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--workers', type=int, default=24)
    a = ap.parse_args()
    os.makedirs(THUMBS, exist_ok=True)
    urls = seed_urls()
    todo = [(u, os.path.join(THUMBS, thumb_name(u))) for u in urls]
    names = [n for _, n in todo]
    if len(set(names)) != len(names):
        sys.exit('해시 충돌이 있습니다 — thumb_name 을 바꿔 주세요.')
    missing = [(u, d) for u, d in todo if not os.path.exists(d)]
    print('사진 %d장 · 이미 있음 %d · 새로 받을 %d' % (len(todo), len(todo) - len(missing), len(missing)))
    fails, total_bytes, done = [], 0, 0
    with cf.ThreadPoolExecutor(max_workers=a.workers) as ex:
        futs = {ex.submit(fetch, u, d): u for u, d in missing}
        for fut in cf.as_completed(futs):
            ok, info = fut.result()
            done += 1
            if ok:
                total_bytes += info
            else:
                fails.append({'url': futs[fut], 'err': info})
            if done % 100 == 0:
                print('  ... %d/%d' % (done, len(missing)))
    have = len([n for n in names if os.path.exists(os.path.join(THUMBS, n))])
    print('완료 — 썸네일 %d/%d장 · 새로 받은 용량 %d KB' % (have, len(names), total_bytes // 1024))
    if fails:
        with open(os.path.join(THUMBS, 'failures.json'), 'w', encoding='utf-8') as f:
            json.dump(fails, f, ensure_ascii=False, indent=1)
        print('실패 %d장(원본 주소로 자동 폴백) — thumbs/failures.json' % len(fails))
    else:
        p = os.path.join(THUMBS, 'failures.json')
        if os.path.exists(p):
            os.remove(p)
    return 0 if not fails else 1


if __name__ == '__main__':
    sys.exit(main())
