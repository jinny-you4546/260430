/* service-worker.js — 청년지원 알리미 기본 오프라인 캐시 */

/*
 * 캐시 버전 정책
 * ──────────────
 * 버전 업 시점:
 *   - data/policies.js 정책 추가·수정
 *   - index.html / logic.js 구조 변경
 * 유지 가능:
 *   - 오타 수정, 스타일 소폭 변경
 * 방법: CACHE_NAME 끝 숫자를 +1 후 배포 (ysa-v1 → ysa-v2)
 * 확인: DevTools → Application → Cache Storage → ysa-v*
 */
var CACHE_NAME = 'ysa-v2';
var PRECACHE = [
  './',
  './index.html',
  './logic.js',
  './manifest.json',
  './data/policies.js',
  './data/profiles.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
];

/* 설치: 핵심 파일 캐시 */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* 활성화: 이전 버전 캐시 삭제 */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* notificationclick: 알림 탭 시 해당 정책 상세 화면 이동 */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var policyId = e.notification.data && e.notification.data.policyId;
  var targetUrl = policyId
    ? './index.html?open=det&id=' + policyId
    : './index.html';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if ('focus' in c) {
          // 이미 열린 탭에 postMessage로 화면 전환 요청
          c.postMessage({ type: 'OPEN_POLICY', policyId: policyId });
          return c.focus();
        }
      }
      // 열린 탭 없으면 새 탭
      return clients.openWindow(targetUrl);
    })
  );
});

/* fetch: 캐시 우선, 실패 시 네트워크 */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        return response;
      });
    })
  );
});
