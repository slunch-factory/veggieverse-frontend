# UX 개선 측정 — before/after 캡처

> 줄기 A(스켈레톤 + React Query) 검증용. 코드 변경 **전** before를 떠두고, 착수 후 같은 조건으로 after를 떠서 비교한다.

## 파일럿 화면

**`/mypage/orders`** — 현재 로딩 폴백이 `"주문 내역을 불러오는 중..."` 텍스트 한 줄뿐이라 스켈레톤 도입 전후 대비가 가장 선명하다. (로그인 필요)

## 측정 환경 (before/after 공통 — 반드시 동일하게)

- ⚠️ **prod 빌드로만 측정.** `pnpm build && pnpm start` (localhost:3000). `pnpm dev`는 최적화가 꺼져 있어 LCP가 왜곡됨.
- 브라우저: Chrome 시크릿 창 (확장프로그램 영향 제거)
- DevTools → Network → **Throttling: Slow 3G** 고정
- DevTools → Network → **Disable cache 체크** (콜드 로드)
- 기기: 같은 노트북, 같은 배율. CPU throttling은 Lighthouse 기본값(4x) 사용.

## 떠둘 것 (before/ 폴더에 저장)

### ① 체감 — 화면 녹화 (가장 중요)
- Slow 3G 상태로 `/mypage/orders` **콜드 로드 화면 녹화** (DevTools Performance의 필름스트립 캡처 또는 화면 녹화).
- 파일명: `before/mypage-orders-slow3g.mov` (또는 .gif)
- 빈 화면/텍스트만 보이는 구간이 그대로 증거.

### ② 수치 — Lighthouse (Mobile)
- DevTools → Lighthouse → **Mobile**, Performance만 체크 → 분석.
- 떠둘 값: **LCP / CLS / TBT / Speed Index** + Lighthouse 리포트 저장(HTML 또는 스샷).
- 파일명: `before/mypage-orders-lighthouse.html`, `before/mypage-orders-lighthouse.png`

### ③ React Query용 — Network 요청 수
- `/mypage` → `/mypage/orders` 이동 후 **다시 `/mypage` 갔다가 재진입** 했을 때 발생하는 API 요청을 Network 탭에서 캡처.
- before: 재진입마다 재페칭(N건) / after: 캐시 히트(0건) 기대.
- 파일명: `before/mypage-orders-network-refetch.png`

### ④ 데모용 — qa-vs-prod (선택, 나중에)
- 줄기 A를 develop→qa 배포한 뒤, **prod(=before) / qa(=after)** 같은 화면 나란히 스샷·영상.
- prod 머지 전까지만 가능한 윈도우. main 머지 직전에 캡처.

## 결과 기록

측정 후 수치를 `docs/ux-improvement-plan.md`의 Task 1·3 "결과" 칸에 옮긴다.

### 1a 스켈레톤 파일럿 — 측정 결과 (2026-06-25)

| 지표 | before | after v1 (shimmer 전) | after v2 (shimmer 최적화 후) | 판정 |
|---|---|---|---|---|
| Performance | 94 | 99 | 87 | 노이즈 (단일측정 편차) |
| LCP | 2.9s | 1.4s | 3.9s | **노이즈 — 1a 지표 아님** |
| TBT | 140ms | 140ms | 140ms | = |
| CLS | 0 | 0 | 0 | = (레이아웃 안 깨짐) |
| Speed Index | 1.0s | 🔻 2.1s | ✅ 1.2s | shimmer 합성화로 회귀 해소 |
| 비합성 애니메이션 경고 | — | ⚠️ 23개 | ✅ 사라짐 | 해소 |
| 빈 화면 노출(체감) | 텍스트 한 줄 | 스켈레톤 | 스켈레톤 | ✅ 영상으로 증명 |
| 재진입 API 요청 | 재페칭 | 재페칭 | 재페칭 | → Task 3에서 해결 |

**결론 (정직한 해석)**
- **1a는 실제 데이터 도착 시간을 바꾸지 않는다.** 캐싱은 Task 3의 일. 1a가 바꾼 건 그 시간 동안 사용자가 보는 것(빈 화면 → 골격).
- 따라서 **LCP는 1a의 지표가 아니다.** 측정마다 2.9→1.4→3.9로 널뛰는 건 단일 Lighthouse 측정의 편차. 실제 timing 개선은 Task 3에서 측정.
- **1a의 진짜 증거 = 영상**(`after/mypage-orders-3g.mov`, 빈 화면 → shimmer 골격).
- 부수 작업: shimmer를 `background-position`(비합성) → `transform: translateX`(GPU 합성)으로 교체해 Speed Index 회귀(2.1s)와 비합성 경고(23개)를 제거. `globals.css`의 `.mp-skeleton`.

> Lighthouse 환경: Emulated Moto G Power / Slow 4G / Lighthouse 13.2.0. 단일 측정은 ±편차가 크므로 timing 지표를 못박으려면 5회 중앙값 필요.
> 원본: before `before/`, after `after/`(v1=shimmer 전, v2=shimmer 후).

### Task 3 React Query — 측정 결과 (2026-06-25)

지표는 Lighthouse가 아니라 **재진입 시 재페칭 여부**(Network/Devtools).

| 항목 | before | after | 판정 |
|---|---|---|---|
| `/mypage/orders` 재진입(60s 내) `orderHistory` 호출 | 매번 재페칭 | 캐시 히트(0건) | ✅ 해결 |
| 수동 `loading/error/orders` state | 3개 + `useEffect` | 훅 1줄 | ✅ 제거 |
| set-state-in-effect 린트 경고 | 있음 | 사라짐 | ✅ |

- 증거: `after/mypage-orders-rq-cachehit-devtools.mov`(Devtools에서 쿼리 `fresh` 유지·fetch 카운트 불변), `after/mypage-orders-rq-network.png`.
- before 증거: `before/mypage-orders-network-refetch.png`(재진입마다 재호출).
- 설정: `staleTime 60s` / `gcTime 5m` / `refetchOnWindowFocus false` / `retry 1` (`src/lib/query/QueryProvider.tsx`).
- Devtools는 dev 전용(`NODE_ENV` 가드), prod 번들 제외.
