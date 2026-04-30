# 청년지원 알리미

내 조건에 맞는 정부·기관 청년 지원정책과 마감일을 한눈에 확인하는 PWA 앱.

---

## 프로젝트 개요

- **형태**: 순수 HTML/CSS/JS SPA + PWA (백엔드 없음)
- **핵심 기능**: 프로필 입력 → 15개 청년 정책 자동 매칭 → 대시보드·알림함 표시
- **매칭 등급**: URGENT(마감 임박) / HIGH(신청 가능) / CHECK(확인 필요) / AGENCY(기관 확인) / INELIG(비대상)
- **오프라인**: Service Worker로 캐시, HTTPS 환경에서 PWA 설치 가능

---

## 폴더 구조

```
youth-support-app/
├── index.html          # 메인 SPA (온보딩·대시보드·목록·상세·알림함)
├── logic.js            # 순수 매칭 로직 (DOM 의존 없음)
├── manifest.json       # PWA 설치 설정
├── service-worker.js   # 오프라인 캐시 + notificationclick 핸들러
├── data/
│   ├── policies.js     # 청년 정책 데이터 15개 (단일 source of truth)
│   └── profiles.js     # 테스트용 샘플 프로필 5개
├── icons/
│   ├── icon-192.png            # Android 홈 화면 / manifest any
│   ├── icon-512.png            # PWA 설치 배너 / splash
│   ├── icon-maskable-192.png   # Android 어댑티브 아이콘
│   ├── icon-maskable-512.png   # Android 어댑티브 아이콘 대형
│   ├── apple-touch-icon.png    # iOS Safari 홈 추가 (180×180)
│   ├── favicon.ico             # 브라우저 탭 파비콘
│   └── app-icon-source-1024.png  # 원본 (배포 불필요)
├── QA_CHECKLIST.md     # 수동 QA 체크리스트 (P1~P5 기대값 포함)
├── DEPLOY_CHECKLIST.md # 배포 전후 점검 항목
├── PUSH_READY.md       # Web Push 설계 메모 (미구현)
└── POLICY_EXPANSION.md # 정책 데이터 확장 계획
```

---

## 실행 방법

### 로컬 (file:// — 기본 동작 확인)

```
index.html 파일을 브라우저에서 직접 열기
```

> Service Worker는 `file://`에서 등록되지 않음. 오프라인 캐시·PWA 설치 테스트는 HTTP 서버 필요.

### 로컬 HTTP 서버 (PWA 완전 동작)

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# VS Code: Live Server 확장 사용
```

접속: `http://localhost:8080`

---

## 디버그 패널 사용법

화면 우측 상단 **`DBG`** 버튼을 탭/클릭하면 디버그 패널이 열립니다.

**표시 조건 (자동 감지)**
- `localhost` / `127.0.0.1` / `file://` 환경 → 자동 활성화
- 배포 URL에서 확인하려면 → URL에 `?debug=1` 추가  
  예) `https://yoursite.github.io/youth-support-app/index.html?debug=1`
- 그 외 배포 환경 → 자동 비활성화 (버튼 숨김)

| 항목 | 설명 |
|------|------|
| Profile | 현재 프로필 이름·나이·지역·취업상태 |
| Match Counts | URGENT / HIGH / CHECK / AGENCY / INELIG 분포 |
| D-14 이내 정책 | 알림 생성 기준 정책 수 |
| 미읽은 알림 | 배지 숫자와 일치 여부 확인 |
| Test Profiles P1~P5 | 이름 클릭 한 번으로 프로필 전환 후 매칭 즉시 재계산 |

### 테스트 프로필 정보

| 코드 | 이름 | 지역 | 취업상태 | URGENT 기대 |
|------|------|------|----------|-------------|
| P1 | 김지원 | 서울 | 미취업 | ≥2 |
| P2 | 이수빈 | 서울 | 재학생 | 0 |
| P3 | 박민준 | 경기 | 미취업 | ≥1 |
| P4 | 최재현 | 서울 | 미취업(제대군인) | 0 |
| P5 | 정예지 | 서울 | 재직(중소기업) | 0 |

---

## 아이콘 생성 (배포 전 필수)

1024×1024 px 청록색 벨 아이콘 PNG 한 장에서 아래 6개 파일을 만들어 `icons/` 폴더에 넣습니다.

| 파일명 | 크기 | 등록 위치 |
|--------|------|-----------|
| `icon-192.png` | 192×192 | manifest + `<link rel="icon">` |
| `icon-512.png` | 512×512 | manifest |
| `icon-maskable-192.png` | 192×192 | manifest (maskable) |
| `icon-maskable-512.png` | 512×512 | manifest (maskable) |
| `apple-touch-icon.png` | 180×180 | `<link rel="apple-touch-icon">` |
| `favicon.ico` | 16/32/48 멀티 | `<link rel="icon">` |

### 생성 방법 (PWABuilder — 무료, 5분)

1. [pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator) 접속
2. 원본 PNG(1024×1024) 업로드 → 모든 크기 일괄 생성 → ZIP 다운로드
3. ZIP에서 위 6개 파일 추출 → `icons/` 폴더에 복사
4. maskable 미리보기: [maskable.app](https://maskable.app) — 벨 이미지가 중앙 80% 이내에 있는지 확인

> **maskable safe zone**: 콘텐츠(벨)는 전체 크기의 80% 이내 배치
> (192px 기준 → 중앙 154×154 px, 512px 기준 → 중앙 410×410 px)

---

## 테스트 방법

### 자동 로직 테스트

`test.html`을 브라우저에서 열면 매칭 로직 단위 테스트 결과를 확인할 수 있습니다.

### 수동 QA

`QA_CHECKLIST.md`의 A~F 섹션을 순서대로 체크합니다.

1. DBG 패널에서 P1~P5 프로필 전환
2. 각 프로필의 기대 매칭 수치와 실제 수치 비교
3. 정책 목록 필터·검색 동작 확인
4. 정책 상세 → "왜 나는 대상인가" 카드 내용 확인
5. 알림함 읽음 처리·배지 갱신 확인

---

## 배포 방법

자세한 내용은 `DEPLOY_CHECKLIST.md` 참고.

### GitHub Pages (권장)

```bash
git init && git add .
git commit -m "deploy: youth-support-app MVP"
git remote add origin https://github.com/YOUR_ID/youth-support-app.git
git push -u origin main
# Settings → Pages → Source: main / (root)
```

배포 전 필수:
1. `icons/` 폴더에 6개 파일 모두 생성 (위 **아이콘 생성** 섹션 참고)
2. `index.html`에서 `const DEBUG = false`로 변경
3. `service-worker.js` `CACHE_NAME` 버전 +1 후 배포 (`ysa-v1` → `ysa-v2`)

---

## 미구현 범위 (다음 스프린트)

| 기능 | 상태 | 메모 |
|------|------|------|
| Web Push 알림 발송 | 미구현 | `PUSH_READY.md` 설계 완료 |
| PWA 아이콘 파일 | ✅ 완료 | 6개 파일 생성, SW 캐시 등록 |
| 실 정책 데이터 자동 연동 | 미구현 | 현재 하드코딩 15개 |
| 정책 데이터 30개+ 확장 | 준비 중 | `POLICY_EXPANSION.md` 참고 |
| 백엔드 / 사용자 계정 | 미구현 | localStorage 단독 |
| iOS Push (16.4+) | 미구현 | VAPID + 서버 필요 |
| React 전환 | 미착수 | logic.js 순수 함수 구조로 준비됨 |

---

## 기술 스택

- **프론트엔드**: Vanilla JS (ES5+), CSS Variables, Flexbox/Grid
- **PWA**: Web App Manifest, Service Worker (Cache-first)
- **상태관리**: 전역 `STATE` 객체 (in-memory) + localStorage 영속화
- **아키텍처**: 순수 함수(`logic.js`) / 렌더 함수(`index.html`) 분리 → React 전환 준비
