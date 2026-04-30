# 아이콘 파일 — 최종 필요 목록

PWA 설치 가능 여부와 OS별 홈 화면 품질은 이 파일들에 달려 있습니다.

---

## 필수 파일 (없으면 PWA 설치 프롬프트 미표시)

| 파일명 | 크기 | 용도 | manifest.json |
|--------|------|------|---------------|
| `icon-192.png` | 192×192 px | Android 홈 화면, splash | ✅ 등록됨 |
| `icon-512.png` | 512×512 px | PWA 설치 배너, 스플래시 | ✅ 등록됨 |
| `icon-maskable-192.png` | 192×192 px | Android 어댑티브 아이콘 (safe zone 10%) | ✅ 등록됨 |
| `icon-maskable-512.png` | 512×512 px | Android 어댑티브 아이콘 대형 | ✅ 등록됨 |

## 권장 파일 (없어도 동작하지만 품질 향상)

| 파일명 | 크기 | 용도 | index.html |
|--------|------|------|------------|
| `apple-touch-icon.png` | 180×180 px | iOS Safari 홈 화면 추가 | ✅ 등록됨 |
| `favicon.ico` | 16/32/48 px 멀티 | 브라우저 탭 파비콘 | ✅ 등록됨 |
| `favicon-32x32.png` | 32×32 px | 고해상도 탭 아이콘 | — |

---

## 아이콘 생성 방법

### 방법 1 — PWABuilder 자동 생성 (권장, 무료, 5분)
1. [pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator) 접속
2. 원본 이미지 업로드 → **모든 크기 자동 생성 및 다운로드**
3. `icons/` 폴더에 복사

### 방법 2 — Figma / 디자인 툴
- 캔버스: 1024×1024 px
- 배경색: `#3563E9` (앱 primary 색상)
- 로고/텍스트 safe zone: 전체 영역의 80% 이내 (maskable 기준)
- export: 각 필요 크기로 슬라이스 후 PNG 저장

### maskable 아이콘 safe zone 규칙
```
전체 크기의 10% = padding
192px 기준 → 가운데 154px × 154px 안에 콘텐츠 배치
512px 기준 → 가운데 410px × 410px 안에 콘텐츠 배치
```
[maskable.app](https://maskable.app) 에서 미리보기 가능

---

## 현재 상태

| 파일 | 상태 |
|------|------|
| `icon-192.png` | ❌ 미생성 |
| `icon-512.png` | ❌ 미생성 |
| `icon-maskable-192.png` | ❌ 미생성 |
| `icon-maskable-512.png` | ❌ 미생성 |
| `apple-touch-icon.png` | ❌ 미생성 |
| `favicon.ico` | ❌ 미생성 |
