# Push Notification 설계 메모

> 구현 순서: VAPID 키 생성 → 구독 등록 UI → SW `push` 핸들러 → payload 정의 → 발송 트리거
> `notificationclick` 핸들러는 service-worker.js에 이미 추가됨

---

## 1. PushSubscription 저장 형식

```json
{
  "userId":   "u_1234567890",
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BXXX...",
    "auth":   "XXX..."
  },
  "createdAt": "2026-04-30T00:00:00Z",
  "platform":  "android"
}
```

- `localStorage` 키: `ysa_push_sub`
- 백엔드 등록 응답의 `subscriptionId`도 함께 저장
- 권한 거부 시 `ysa_push_denied = "1"` 저장 → 재요청 스킵

---

## 2. Notification Payload 형식

```json
{
  "title": "청년창업사관학교 마감 D-1",
  "body":  "내일(4/30)이 마감입니다. 지금 바로 신청하세요.",
  "data": {
    "policyId":  "p008",
    "dday":       1,
    "actionUrl":  "/index.html?open=det&id=p008"
  },
  "badge":    "/icons/badge-96.png",
  "icon":     "/icons/icon-192.png",
  "tag":      "policy-p008-d1",
  "renotify": false
}
```

- `tag` 필드로 같은 정책 중복 알림 방지 (브라우저가 동일 tag 교체)
- D-7 / D-3 / D-1 총 3회 발송 → tag 접미사로 구분 (`-d7`, `-d3`, `-d1`)
- `renotify: false` → 같은 tag 재발송 시 소리/진동 없이 업데이트

---

## 3. policyId 기반 상세 화면 이동

### 방법 A — URL 파라미터 (앱 비활성 상태, 새 탭)

```
/index.html?open=det&id=p008
```

`init()` 진입 시 파싱 후 `go('det', {id})` 호출:

```javascript
function checkDeepLink() {
  var params = new URLSearchParams(location.search);
  if (params.get('open') === 'det' && params.get('id')) {
    // runApp() 완료 후 실행되도록 setTimeout 0
    setTimeout(function() {
      go('det', { id: params.get('id') });
    }, 0);
  }
}
// init() 안에서 runApp() 이후 호출
```

### 방법 B — postMessage (앱 탭 이미 열려 있는 경우)

SW `notificationclick` → `client.postMessage({ type: 'OPEN_POLICY', policyId })` 전송  
앱 main script에서 수신:

```javascript
navigator.serviceWorker.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'OPEN_POLICY') {
    go('det', { id: e.data.policyId });
  }
});
```

---

## 4. notificationclick 전체 흐름

```
사용자가 알림 탭
      ↓
SW: notificationclick 이벤트 발생
      ↓
clients.matchAll() — 앱 탭 이미 열려 있나?
  ├── 있음 → client.focus() + postMessage({OPEN_POLICY, policyId})
  └── 없음 → clients.openWindow('/index.html?open=det&id=' + policyId)
      ↓
앱: message 이벤트 수신 OR URL 파라미터 파싱
      ↓
go('det', { id: policyId })
```

---

## 5. SW push 핸들러 추가 위치 (미구현 — 다음 단계)

`service-worker.js`에 아래 블록 추가 예정:

```javascript
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:     data.body,
      icon:     data.icon     || './icons/icon-192.png',
      badge:    data.badge    || './icons/badge-96.png',
      tag:      data.tag,
      renotify: data.renotify || false,
      data:     data.data,
    })
  );
});
```

---

## 6. 구현 예정 파일 목록

| 파일 | 역할 | 상태 |
|------|------|------|
| `service-worker.js` | `notificationclick` | ✅ 완료 |
| `service-worker.js` | `push` 핸들러 | 미구현 |
| `push/subscribe.js` | 구독 등록 UI + VAPID 공개키 | 미구현 |
| `push/send.js` (서버) | web-push 라이브러리 발송 | 미구현 |
| `index.html` | SW message 수신 + `checkDeepLink()` | 미구현 |
