# 배포 체크리스트 — 청년지원 알리미 MVP

기준일: 2026-04-30 | 대상: GitHub Pages / Netlify / Vercel

---

## A. 배포 전 로컬 점검

- [ ] `index.html` 열기 → 온보딩 → 대시보드 흐름 정상
- [x] `icons/` 아이콘 6개 파일 존재 확인 (icon-192, icon-512, maskable×2, apple-touch-icon, favicon.ico)
- [ ] Chrome DevTools → Application → Manifest 파싱 오류 없음
- [ ] Chrome DevTools → Application → Service Workers → 등록 정상
- [ ] Chrome DevTools → Application → Storage → `ysa_v2` 키 저장 확인

---

## B. 플랫폼별 배포 방법

### B-1. GitHub Pages (권장 — 무료, HTTPS 자동)

```bash
git init
git add .
git commit -m "deploy: youth-support-app MVP"
git remote add origin https://github.com/YOUR_ID/youth-support-app.git
git push -u origin main
```

Settings → Pages → Source: **Deploy from branch** → `main` / `(root)`

배포 URL: `https://YOUR_ID.github.io/youth-support-app/`

> `manifest.json`의 `start_url`이 `./index.html`로 설정되어 GitHub Pages 서브경로에서 정상 동작

### B-2. Netlify (드래그앤드롭 가능)

1. [app.netlify.com](https://app.netlify.com) → Add new site → Deploy manually
2. `youth-support-app/` 폴더 전체를 드래그
3. 배포 URL: `https://random-name.netlify.app`

### B-3. Vercel

```bash
npm i -g vercel
cd youth-support-app
vercel --prod
```

---

## C. HTTPS 환경 점검

- [ ] 배포 URL이 `https://`로 시작
- [ ] Mixed Content 경고 없음 (모든 리소스 HTTPS)
- [ ] Service Worker Scope 확인: DevTools → Application → Service Workers → Scope
- [ ] SW 등록 성공 메시지 (콘솔 오류 없음)

---

## D. PWA 설치 테스트

### D-1. 데스크톱 Chrome

- [ ] 주소창 오른쪽 설치 아이콘 표시됨
- [ ] 설치 후 독립 앱 창으로 열림
- [ ] DevTools → Lighthouse → Mobile → PWA 항목 통과 확인

### D-2. Android Chrome

- [ ] "홈 화면에 추가" 배너 표시 또는 브라우저 메뉴에서 설치 가능
- [ ] 설치 후 홈 화면에 앱 아이콘 생성
- [ ] 앱 실행 시 상태바 색상 `#3563E9` 적용 (theme-color)
- [ ] 하단 홈 바와 네비게이션 겹침 없음 (`safe-area-inset-bottom` 적용 확인)
- [ ] 비행기 모드 후 앱 재실행 → Service Worker 캐시로 로딩
- [ ] 온보딩 → 대시보드 전환 애니메이션 정상
- [ ] 알림 배지 숫자 표시 정상

### D-3. iPhone Safari (iOS 16.4+)

- [ ] Safari → 공유 버튼 → "홈 화면에 추가" 표시됨
- [ ] 홈 화면 아이콘으로 실행 시 독립 앱 형태 (상단 Safari UI 없음)
- [ ] 상단 노치/다이내믹 아일랜드 영역 겹침 없음 (`safe-area-inset-top`)
- [ ] 하단 홈 인디케이터 영역 겹침 없음 (`safe-area-inset-bottom`)
- [ ] 비행기 모드 후 앱 재실행 → 오프라인 캐시 동작
- [ ] 가로 스크롤(마감 임박 카드) 터치 스크롤 정상
- [ ] 온보딩 input 포커스 시 하단 키보드 레이아웃 밀림 없음

---

## E. 기능 스모크 테스트 (배포 후 최소 검증)

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 온보딩 4단계 완료 | 대시보드 이동, localStorage `ysa_v2` 저장 |
| 2 | 새로고침 후 재진입 | 온보딩 스킵 → 대시보드 바로 표시 |
| 3 | 정책 목록 → "서울" 검색 | 서울형 정책(p011~p014) 포함 결과 표시 |
| 4 | URGENT 정책 카드 탭 | 상세 화면, D-day 표시, 신청하기 버튼 외부 링크 |
| 5 | 알림함 → 모두 읽음 | 배지 숫자 0, 항목 unread 스타일 해제 |
| 6 | 비행기 모드 새로고침 | Service Worker 캐시로 앱 정상 로딩 |

---

## F. 배포 검증 도구

| 도구 | 목적 |
|------|------|
| Chrome Lighthouse | PWA 점수, 접근성, 성능 측정 |
| PWABuilder | 플랫폼별 패키징 가능 여부 확인 |
| Chrome DevTools → Network → Offline | 오프라인 동작 시뮬레이션 |
| BrowserStack | 실기기 iOS/Android 크로스 테스트 |

---

## G. 알려진 제약사항 (MVP 범위)

| 항목 | 현재 상태 | 다음 단계 |
|------|-----------|-----------|
| Web Push 알림 | 미구현 | PUSH_READY.md 참고 |
| 앱 아이콘 | ✅ 완료 | 6개 파일 생성, SW 캐시(`ysa-v2`) 등록 완료 |
| 정책 데이터 | 하드코딩 | 실 서비스 시 API 연동 |
| iOS Web Push | iOS 16.4+ 한정 | 구형 기기 graceful degradation 확인 |
