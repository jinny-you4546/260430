# 배포 검증 기록 — 청년지원 알리미
버전: ysa-v4 | 기준일: 2026-04-30 | 환경: GitHub Pages (HTTPS)

---

## A. 사전 준비

```
[ ] 브라우저: Chrome 최신 (Edge도 병행)
[ ] DevTools 열기 (F12)
[ ] 테스트 시작 전 Application → Clear storage → Clear site data
[ ] Network 탭 → 'Disable cache' OFF (캐시 동작 확인 위해)
```

---

## B. 수동 테스트 10개

### T01 — 신규 사용자: 온보딩 진입
```
전제:  사이트 데이터 전체 삭제 후 배포 URL 접속
조작:  앱 URL 열기
기대:  - 온보딩 step 1/4 화면 표시
       - 진행 바 25%
       - "저장하고 나가기" 버튼 없음
       - 하단 내비게이션 숨김(hide)
실패 의심: index.html → init() / loadSaved() / store.get('ysa_v2')
결과: [ ] PASS  [ ] FAIL
메모:
```

### T02 — 신규 사용자: 온보딩 4단계 완료
```
전제:  T01 직후 상태
조작:  step1(나이 27, 서울) → step2(미취업) → step3(level3) → step4 완료
기대:  - 대시보드 이동
       - hero 영역 숫자 > 0 (신청 가능·마감 임박)
       - 하단 내비게이션 표시
       - 알림 배지 숫자 표시(D-14 이내 정책 존재 시)
실패 의심: index.html → runApp() / computeAllMatches() / go('dash')
결과: [ ] PASS  [ ] FAIL
메모:
```

### T03 — 기존 사용자: 재진입 시 온보딩 스킵
```
전제:  T02 완료 상태에서 탭 닫기 → 재접속(또는 F5)
조작:  배포 URL 재방문
기대:  - 온보딩 없이 대시보드 바로 표시
       - 이전 입력한 프로필(나이·지역·취업상태) 그대로
실패 의심: index.html → init() → store.get('ysa_v2') 반환값 파싱
결과: [ ] PASS  [ ] FAIL
메모:
```

### T04 — SW 캐시 버전 ysa-v4 확인
```
전제:  T02 완료 상태
조작:  DevTools → Application → Cache Storage → ysa-v4 클릭
기대:  - 캐시명: ysa-v4
       - 항목 수: 12개
         (./  ./index.html  ./logic.js  ./manifest.json
          ./data/policies.js  ./data/profiles.js
          icons/icon-192.png  icons/icon-512.png
          icons/icon-maskable-192.png  icons/icon-maskable-512.png
          icons/apple-touch-icon.png  icons/favicon.ico)
실패 의심: service-worker.js → CACHE_NAME / PRECACHE 목록
결과: [ ] PASS  [ ] FAIL
캐시 항목 실제 수: ___개
```

### T05 — 오프라인 동작
```
전제:  T04 완료 상태 (캐시 존재)
조작:  DevTools → Network → Offline 체크 → 새로고침(F5)
기대:  - 앱 정상 로딩 (네트워크 오류 없음)
       - 대시보드 또는 온보딩 표시
       - 콘솔에 fetch 실패 에러 없음
실패 의심: service-worker.js → fetch handler / PRECACHE 미등록 파일
결과: [ ] PASS  [ ] FAIL
메모:
```

### T06 — CLOSED 정책 목록 정렬·시각
```
전제:  대시보드 진입 상태
조작:  하단 내비 "정책목록" → "전체" 탭 → 목록 스크롤
기대:  - 마감 종료 정책(신청종료일 < 오늘)이 목록 하단 배치
       - 해당 카드: 반투명(opacity ~0.55), 배경 회색
       - 카드 우하단: "마감" 텍스트 (파란 "상세보기 →" 아님)
       - 카드 하단 힌트: "신청 기간 종료" (붉은 뱃지)
실패 의심: index.html → renderPolicyList() sort / renderPolicyCard() isClosed
결과: [ ] PASS  [ ] FAIL
메모:
```

### T07 — CLOSED 정책 상세: 신청 버튼 비활성
```
전제:  T06에서 CLOSED 카드 확인
조작:  CLOSED 카드 탭 → 상세 화면 진입
기대:  - 하단 버튼 텍스트: "신청 기간 종료"
       - 버튼 클릭 시 아무 반응 없음(pointerEvents:none)
       - 버튼 시각적 비활성 처리(opacity 0.4)
실패 의심: index.html → renderPolicyDetail() det-link 처리
결과: [ ] PASS  [ ] FAIL
메모:
```

### T08 — 알림함 → 상세 → 뒤로가기 흐름
```
전제:  알림 배지 있는 상태
조작:  하단 "알림" 탭 → 알림 항목 클릭 → 상세 화면 → 뒤로가기(←) 버튼
기대:  - 정책 목록이 아닌 알림함으로 복귀
       - 알림함 스크롤 위치 상단으로 리셋
실패 의심: index.html → go() prevScreen 트래킹 / goBack()
결과: [ ] PASS  [ ] FAIL
메모:
```

### T09 — 프로필 편집 모드 (온보딩 재시작 없이)
```
전제:  기존 사용자 상태(T03 이후)
조작:  정책 목록 → 우상단 "프로필 수정" → 온보딩 step 1 진입
기대:  - 기존 이름·나이·지역 값이 입력 필드에 pre-filled
       - "저장하고 나가기" 버튼 표시(신규 온보딩 시에는 없음)
       - 나이만 변경 후 "저장하고 나가기" 클릭 → 대시보드 매칭 재계산
실패 의심: index.html → _obEditMode / obRender() ob-cancel 토글 / obSaveAndExit()
결과: [ ] PASS  [ ] FAIL
메모:
```

### T10 — 알림 읽음 상태 영속
```
전제:  알림 배지 있는 상태
조작:  알림함 → "모두 읽음" 클릭 → 탭 닫기 → 재접속
기대:  - 재접속 후 알림 배지 숫자 없음(0 상태 유지)
       - 알림함 내 항목 unread 스타일(파란 배경) 없음
실패 의심: index.html → markAllRead() → persist() 호출 여부 / store.set('ysa_v2_read')
결과: [ ] PASS  [ ] FAIL
메모:
```

---

## C. Lighthouse 측정 기록

```
측정일:          ___________
측정 URL:        https://____________.github.io/youth-support-app/
측정 환경:       [ ] Mobile  [ ] Desktop
Chrome 버전:     ___________

┌─────────────────┬────────┬──────────┬────────────┐
│ 카테고리        │ 측정값 │ 기준(Go) │ 판정       │
├─────────────────┼────────┼──────────┼────────────┤
│ Performance     │        │ ≥ 70     │ [ ]Pass    │
│ Accessibility   │        │ ≥ 85     │ [ ]Pass    │
│ Best Practices  │        │ ≥ 90     │ [ ]Pass    │
│ SEO             │        │ ≥ 80     │ [ ]Pass    │
│ PWA             │        │ ≥ 90     │ [ ]Pass    │
└─────────────────┴────────┴──────────┴────────────┘

PWA 세부 체크리스트 (Lighthouse → PWA 탭):
[ ] Installable — 설치 가능
[ ] manifest.json 파싱 오류 없음
[ ] 아이콘 512px 존재
[ ] Service Worker 등록됨
[ ] HTTPS 환경
[ ] 오프라인 페이지 응답

Accessibility 주요 실패 항목 (있으면 기록):
___________________________________________

Performance 주요 병목 (있으면 기록):
___________________________________________
```

---

## D. 콘솔 오류 점검

```
DevTools → Console 탭 → 'Errors' 필터

[ ] 초기 로딩 시 콘솔 에러 없음
[ ] 정책 목록 렌더 시 에러 없음
[ ] 상세 화면 진입 시 에러 없음
[ ] 오프라인 상태에서 에러 없음 (SW fetch 정상 처리)

발견된 에러 (있으면 기록):
___________________________________________
```

---

## E. Go / No-Go 판단 기준

### Go 조건 (전부 만족해야 배포 승인)
```
[ ] T01~T10 수동 테스트 10개 전부 PASS
[ ] Lighthouse PWA ≥ 90
[ ] Lighthouse Accessibility ≥ 85
[ ] 콘솔 에러 0건 (SW fetch 경고 제외)
[ ] SW 캐시 항목 12개 정확히 일치
```

### No-Go 조건 (하나라도 해당 시 즉시 중단)
```
[ ] T05 오프라인 동작 실패 → SW PRECACHE 재확인
[ ] T01 신규 사용자 온보딩 미표시 → init() / store 오류
[ ] T04 캐시 항목 12개 미만 → PRECACHE 목록 누락
[ ] Lighthouse PWA < 80 → manifest 또는 SW 문제
[ ] 콘솔에 미처리 에러 존재 → 해당 파일 디버깅 필요
```

### 판정 결과
```
판정:   [ ] Go — 배포 확정
        [ ] No-Go — 이유: _______________________
판정자: ___________  일시: ___________
```

---

## F. No-Go 발생 시 1차 의심 파일

| 증상 | 의심 파일 | 확인 위치 |
|------|-----------|-----------|
| SW 캐시 누락 | service-worker.js | PRECACHE 배열 12개 확인 |
| 오프라인 실패 | service-worker.js | fetch handler, cache.match |
| 온보딩 미표시 | index.html | `init()` → `store.get('ysa_v2')` |
| CLOSED 정렬 안 됨 | index.html | `renderPolicyList()` sort 로직 |
| 뒤로가기 틀린 화면 | index.html | `go()` prevScreen / `goBack()` |
| 편집 모드 버튼 미표시 | index.html | `_obEditMode` / `obRender()` |
| 읽음 상태 초기화 | index.html | `markAllRead()` → `persist()` 호출 확인 |
| Manifest 아이콘 오류 | manifest.json + icons/ | 경로·파일 존재 재확인 |
