# DEPLOY READY — 청년지원 알리미

기준일: 2026-04-30 | 상태: **배포 가능**

---

## 1. 지금 바로 배포 가능한가?

**YES.**

| 항목 | 상태 |
|------|------|
| 아이콘 6개 (`icons/`) | ✅ 완료 |
| manifest.json 경로 일치 | ✅ 완료 |
| index.html 링크 경로 일치 | ✅ 완료 |
| service-worker.js PRECACHE 아이콘 6개 | ✅ 완료 |
| CACHE_NAME `ysa-v2` | ✅ 완료 |
| DEBUG 자동 감지 (배포 URL 자동 숨김) | ✅ 확인됨 |

> DEBUG는 `localhost` / `file://` 에서만 자동 활성화.
> 배포 URL에서는 자동 숨김. `?debug=1` 추가 시 수동 확인 가능 — 설계 의도 그대로.

---

## 2. 배포 전 내가 직접 해야 할 마지막 3개

1. **GitHub 레포 생성 + push**
   ```bash
   git init
   git add .
   git commit -m "deploy: MVP + icons ysa-v2"
   git remote add origin https://github.com/YOUR_ID/youth-support-app.git
   git push -u origin main
   ```

2. **GitHub Pages 설정**
   Settings → Pages → Source: `Deploy from branch` → `main` / `(root)` → Save

3. **배포 URL 확인**
   `https://YOUR_ID.github.io/youth-support-app/` 접속 → 온보딩 화면 출력 확인

---

## 3. 배포 후 첫 확인 순서 5단계

| 순서 | 항목 | 확인 방법 |
|------|------|-----------|
| 1 | Manifest 아이콘 파싱 | DevTools → Application → Manifest → Icons 6개 미리보기 정상 |
| 2 | SW 등록 + 캐시 버전 | DevTools → Application → Service Workers → `ysa-v2` 활성화 확인 |
| 3 | 캐시 항목 수 | DevTools → Application → Cache Storage → `ysa-v2` → 12개 항목 |
| 4 | 골든패스 | 온보딩 4단계 → 대시보드 → 정책 상세 → 알림함 순서대로 흐름 확인 |
| 5 | 오프라인 동작 | DevTools → Network → Offline 체크 → 새로고침 → 앱 정상 로딩 |

---

## 4. 문제가 생겼을 때 가장 먼저 볼 체크포인트 5개

| 증상 | 체크포인트 |
|------|-----------|
| SW가 업데이트 안 됨 | Application → Service Workers → `CACHE_NAME` 버전 확인 / "Update on reload" 활성화 후 새로고침 |
| 아이콘 404 / 빈 아이콘 | Network 탭 → `icons/` 요청 필터링 → 응답 코드 200 여부 확인 |
| PWA 설치 프롬프트 미표시 | Lighthouse → PWA 항목 → manifest 파싱 오류 메시지 확인 |
| 오프라인 동작 안 됨 | Cache Storage → `ysa-v2` 항목 수 확인 (12개 미달이면 install 실패) |
| iOS 홈 화면 아이콘 이상 | Network → `apple-touch-icon.png` 응답 200 + 180×180 크기 확인 |

---

## 5. 다음 스프린트 추천 순서

| 우선순위 | 작업 | 이유 |
|----------|------|------|
| 1 | 정책 데이터 30개+ 확장 | 핵심 가치(매칭 다양성) 직접 향상 — `POLICY_EXPANSION.md` 참고 |
| 2 | Lighthouse PWA 100점 달성 | 아이콘 추가로 점수 상승 예상 → 갭 항목만 추가 수정 |
| 3 | 실 정책 마감일 자동 갱신 | 하드코딩 날짜가 지나면 URGENT 표시가 틀려짐 |
| 4 | 접근성 개선 (ARIA, 키보드 탐색) | Lighthouse 접근성 점수 연동 → 퀄리티 신호 |
| 5 | iOS Web Push | `PUSH_READY.md` 설계 완료 — 서버 환경 확보 후 구현 |
