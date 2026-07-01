# UX 체감 고도화 계획

> 작성일: 2026-06-25
> 형식: 각 작업을 **가설 → 문제 원인 → 해결 → 결과** 순으로 진행한다.
> 코드 조사 기반으로 검증된 개선점만 정리한다 (검증 수치는 본문 참조).

---

## 핵심 프레이밍: "상태는 두 종류"

UX 고도화 과정에서 다루는 상태가 두 종류로 갈린다. 줄기를 섞으면 인과가 깨지므로 분리한다.

- **서버 상태(server state)** — 장바구니·구독·메뉴·주문. 출처가 백엔드, 캐시·리페치·동기화 필요. → **React Query**가 푸는 영역.
- **클라이언트 상태(UI state)** — 모달 열림/닫힘, 포커스, 스크롤 락, 모션. 백엔드 무관, 컴포넌트 로컬. → **공용 컴포넌트 추상**이 푸는 영역.

> ⚠️ "모달 상태 관리가 복잡해서 React Query를 썼다"는 **거짓 인과**다. 모달은 UI 상태라 React Query를 도입해도 포커스 트랩은 풀리지 않는다.

---

## 줄기 지도 (태스크 8개 → 줄기 4개)

| 줄기 | 성격 | 태스크 | 가설의 출처 |
|---|---|---|---|
| **A. 서버 상태** | 데이터 페칭 | 1, 3 | "느린 네트워크에서 빈 화면 / 수동 상태 한계" |
| **B. 접근성·UI 상태** | 클라이언트 UI | 2, 7, (8 흡수) | "키보드·스크린리더·모션 민감 사용자가 못 쓴다" |
| **C. 성능** | 렌더 비용 | 4 | "이미지 무거워서 모바일 LCP 느리다" |
| **D. 피드백 일관성** | UI 일관성 | 5 | "화면마다 성공/실패 알림이 제각각이다" |
| (곁다리) **코드 건강** | 유지보수 | 6 | UX 가설 아님 → 다른 작업에 흡수 |

---

## 실행 순서

```
[메인 — UX 체감]
1a 스켈레톤 파일럿 → 3 React Query → 1b 스켈레톤 전면     (줄기 A)
2 공용 <Modal> (+8 scroll-lock 흡수) → 7 reduced-motion   (줄기 B)
   └ 진행 중 6번(거대 컴포넌트)을 부산물로 분해

[퀵윈 — 아무때나 끼움]
4 next/image (LCP)        (줄기 C)
5 토스트 통일             (줄기 D)
```

**1과 3 사이의 함정**: 스켈레톤을 46곳 수동 loading state 위에 전부 깔고 나서 React Query를 도입하면 로딩 배선을 두 번 짠다. 그래서 1을 `1a 파일럿 → 3 → 1b 전면`으로 쪼갠다. 내러티브("스켈레톤 깔다 수동 상태 한계 발견 → RQ → 제대로 완성")도 보존되고 재작업도 없다.

**파일럿 화면 후보**: `mypage/orders`(현재 `"불러오는 중..." 텍스트만 → before/after 대비 선명) 또는 `subscribe` 플래너(진입 첫 화면, 임팩트 큼).

---

# 줄기 A — 서버 상태

## Task 1 — 로딩 상태 / 스켈레톤

**가설**
느린 네트워크에서 데이터 페칭 구간이 빈 흰 화면으로 노출돼, 사용자가 "멈췄다/깨졌다"고 인지하고 이탈한다. 특히 진입 직후 첫 화면(subscribe 플래너, 메뉴 라이브러리, mypage 주문)이 그렇다.

**문제 원인** (코드 검증)
- App Router `loading.tsx` **0개** → Suspense 기반 즉시 골격 렌더 전무.
- `error.tsx`는 5개(root, order, subscribe, mypage, cart)인데 `loading.tsx`는 0개 → 실패만 처리하고 대기 상태는 방치(비대칭).
- 스켈레톤 컴포넌트는 `mypage/_components/Skeleton.tsx` 1개뿐 → 재사용 자산 부재.
- 페칭이 클라이언트 `useEffect` + 수동 `loading` state(**46곳**)에 의존 → 첫 페인트가 항상 빈 상태에서 시작.
- 실제 폴백이 텍스트 한 줄(`mypage/orders`의 `"주문 내역을 불러오는 중..."`) → 레이아웃 점프(CLS) 유발.

**해결**
- 주요 라우트에 `loading.tsx` + 재사용 스켈레톤 컴포넌트 도입.
- `1a` 파일럿(1~2 화면) → `1b` Task 3 위에서 전면 적용.

**결과**
- ✅ **1a 파일럿 완료 (2026-06-25, `/mypage/orders`)**. `"불러오는 중..." 텍스트 → 주문 카드 모양 shimmer 스켈레톤(`OrdersSkeleton`).
- 핵심 증거는 **체감(영상)**: 빈 화면 → 즉시 골격. CLS는 before도 0이라 수치 변화 없음(정상).
- shimmer를 `transform` 기반(GPU 합성)으로 구현해 Speed Index 회귀·비합성 경고 제거. 상세 수치는 `docs/ux-metrics/README.md`.
- ⏳ **1b 전면 적용**은 Task 3(React Query) 이후. 측정 상세는 `docs/ux-metrics/`.

---

## Task 3 — React Query 도입

**가설**
같은 데이터(장바구니·구독·메뉴)를 화면마다 다시 페칭하고 캐시·리페치·낙관적 업데이트를 손으로 관리해서, 화면 간 데이터 불일치와 불필요한 로딩 스피너가 반복된다. 담기/수량 변경이 서버 응답을 기다리느라 굼떠 보인다.

**문제 원인** (코드 검증)
- 데이터 페칭이 `useEffect` + `apiFetch` + 수동 `loading`/`error` state(**46곳**)로 분산 → 캐시 레이어 없음.
- 캐시가 없어 라우트 이동마다 재페칭 → 동일 데이터를 매번 빈 로딩부터 다시 그림.
- 낙관적 업데이트가 수동 → CartContext 등에서 서버 왕복 후에야 UI 반영, 체감 지연.
- 자매 레포 `slunch-frontend`는 React Query 사용 중인데 veggieverse만 미사용 → 팀 내 패턴 불일치.

**해결**
- `@tanstack/react-query` v5 도입. `src/lib/query/`에 SSR-safe `QueryProvider`, 중앙 `queryKeys`, 도메인 훅(`store.ts`).
- cart·subscription·menu·orders 우선 마이그레이션. `isLoading/isPending/isError`로 로딩 상태 표준화(→ Task 1b가 여기에 얹힘).
- 페칭 로직을 거대 컴포넌트(`OrderClient` 812·834줄)에서 훅으로 추출(→ Task 6 부산물 분해).

**결과**
- ✅ **파일럿 완료 (2026-06-25, `/mypage/orders`)**. `useStoreOrderHistory` 훅으로 전환 — 수동 `loading/error/orders` 3-state + `useEffect` 제거, set-state-in-effect 린트 경고도 해소.
- ✅ **재진입(60s 내) 재페칭 → 캐시 히트(0건)** 확인. Devtools에서 쿼리 `fresh` 유지·fetch 카운트 불변. 증거: `docs/ux-metrics/after/mypage-orders-rq-cachehit-devtools.mov`.
- Devtools(dev 전용)로 캐시 상태 가시화. 설정 `staleTime 60s`.
- ⏳ **확장 대기**: cart·subscription·menu, 낙관적 업데이트. 상세는 `docs/ux-metrics/README.md`.

---

# 줄기 B — 접근성·UI 상태

## Task 2 — 공용 `<Modal>` 프리미티브

**가설**
키보드·스크린리더 사용자가 모달에서 길을 잃는다. 구독 신청을 키보드만으로 완주하면, 모달을 열었을 때 포커스가 배경에 남거나, 닫은 뒤 어디로 갔는지 알 수 없어 흐름이 끊긴다. 모바일에선 모달 뒤 배경이 스크롤돼 오작동처럼 보인다.

**문제 원인** (코드 검증)
- **포커스 트랩 전무** — 어떤 dialog도 Tab을 모달 안에 가두지 않음. 포커스가 배경 폼·버튼으로 새어나감.
- **포커스 복귀 0건** — `activeElement`/`returnFocus`/`triggerRef` 패턴 전무. 닫으면 포커스가 `<body>`로 리셋.
- **aria 불일치** — `role="dialog"`·`aria-modal`이 일부 모달(MenuDetailModal)에만 있고 다수엔 없음.
- **scroll-lock 불일치** — 일부 화면만 `overflow:hidden` 적용(Task 8 흡수).
- **근본 원인** — 모달이 공통 추상 없이 20곳 가까이 제각기 구현. Esc 닫기조차 모달마다 있고 없음. 단일 프리미티브가 없어 한 곳을 고쳐도 나머지에 전파 안 됨.

**해결**
재사용 `<Modal>` 프리미티브 하나로 UI 상태를 캡슐화하고 기존 모달을 얹는다. 책임: 포커스 트랩 / 포커스 복귀(열기 직전 `activeElement` 저장→복귀) / Esc 닫기 / scroll-lock(중첩 카운팅) / aria 기본값(`role="dialog"`+`aria-modal`+`aria-labelledby`).
- 검증 게이트: **마우스 0번으로 구독 신청 완주**.

**결과** _(착수 후 측정)_
- 키보드 단독 구독 완주: 실패 → 성공 (통과/실패)
- 포커스 트랩·복귀·aria·scroll-lock 적용 모달: 일부 → 20곳 전체
- 모달당 중복 a11y 코드 제거 라인 수

---

## Task 7 — `prefers-reduced-motion` 대응

**가설**
Framer Motion·Three.js·Lottie 애니메이션이 많은데, 멀미·전정장애 사용자나 저사양 기기에서 과한 모션이 불편·성능 저하를 일으킨다.

**문제 원인** (코드 검증)
- `prefers-reduced-motion`/`useReducedMotion` 참조 **2곳뿐** → OS의 "동작 줄이기" 설정을 거의 무시.
- 모션 토글을 한 곳에서 제어하는 공통 훅·CSS 전략 부재.

**해결**
- 공통 `useReducedMotion` 훅 + globals.css의 `@media (prefers-reduced-motion: reduce)` 전략.
- 주요 애니메이션(framer-motion variants, Lottie autoplay, Three.js)이 설정을 존중하도록 연결. Task 2의 `<Modal>` 전환에도 적용.

**결과** _(착수 후 측정)_
- 모션 감소 설정 존중 컴포넌트 수
- "동작 줄이기" ON일 때 핵심 플로우 정상 동작 확인

---

# 줄기 C — 성능

## Task 4 — `<img>` → `next/image` 마이그레이션

**가설**
식단·상품 이미지가 많은데 원본을 그대로 내려받아 모바일 LCP가 느리고 데이터 사용량이 크다. 첫 화면 대표 이미지가 늦게 떠 체감 로딩이 길다.

**문제 원인** (코드 검증)
- 생 `<img>` 태그 **17곳** vs `next/image` **2곳** → Next 16 자동 최적화(WebP/AVIF·반응형 srcset·lazy·blur placeholder)를 거의 못 씀.
- `width/height` 미지정 `<img>`는 CLS 유발 가능.
- 대표 이미지에 `priority`(LCP preload) 지정 수단 없음.

**해결**
- `<img>` → `next/image` 전환. 대표/히어로 이미지에 `priority`, 나머지는 lazy. `sizes` 지정.

**결과** _(착수 후 측정)_
- LCP(모바일) 개선 수치
- 전환된 이미지 수 (17 → next/image)
- 이미지 전송량 감소

---

# 줄기 D — 피드백 일관성

## Task 5 — 토스트/피드백 통일

**가설**
화면마다 성공·실패 피드백 모양·위치가 달라 "방금 동작이 됐나?"를 일관되게 인지하지 못한다. 일부는 네이티브 `alert()`라 흐름을 막고 모바일에서 투박하다.

**문제 원인** (코드 검증)
- 알림 구현이 **3갈래 중복**: `recipe/Toast.tsx`(81줄), `subscribe/Snackbar.tsx`(42줄), raw `alert()`.
- 공용 토스트 컨텍스트/프로바이더 부재 → 각 화면이 자기 방식으로 피드백.

**해결**
- 공용 토스트 프로바이더 1개로 통일. 기존 3갈래를 여기에 흡수, `alert()` 제거.

**결과** _(착수 후 측정)_
- 토스트 구현 개수: 3+ → 1
- `alert()` 제거 개수

---

# 곁다리 — 코드 건강 (UX 가설 아님)

## Task 6 — 거대 컴포넌트 분해

> ⚠️ 이건 **유지보수 가설**이지 UX 가설이 아니다(사용자는 체감 못 함). "줄 수가 많다"는 증상이지 사용자 문제가 아니므로 단독 태스크로 세우면 가설이 약하다. → **다른 작업의 부산물로 처리**한다.

**관찰된 비대 파일** (코드 검증)
- `SignupClient.tsx` **1379줄**
- `SpiritStepClient3D.tsx` **967줄**
- `order/OrderClient.tsx` **834줄**, `subscribe/order/OrderClient.tsx` **812줄**
- (당초 지목된 `MobileMealWheel` 321 · `MenuDetailModal` 368 · `DayRow` 241은 중간 크기 — 분해 우선순위 낮음)

**처리 방식**
- Task 3(React Query) 진행 중 `OrderClient`의 페칭 로직을 RQ 훅으로 추출 → 자동 분해.
- Task 2(`<Modal>`) 진행 중 각 모달이 공용 프리미티브로 얇아짐.
- 따로 잡는다면 `SignupClient.tsx`(1379줄)만 별건으로.

---

## 부록: 코드 조사 검증 요약 (2026-06-25)

| 항목 | 측정값 |
|---|---|
| `loading.tsx` | 0개 |
| `error.tsx` | 5개 (root, order, subscribe, mypage, cart) |
| 스켈레톤 컴포넌트 | 1개 (`mypage/_components/Skeleton.tsx`) |
| 수동 loading state | 46곳 |
| React Query | 미사용 (`package.json`에 `@tanstack/react-query` 없음) |
| 포커스 트랩 구현 모달 | 0개 |
| 포커스 복귀(`returnFocus`) | 0건 |
| 생 `<img>` / `next/image` | 17 / 2 |
| 토스트 구현 | 3갈래 (recipe Toast, subscribe Snackbar, alert) |
| `prefers-reduced-motion` 참조 | 2곳 |
| 최대 컴포넌트 | `SignupClient.tsx` 1379줄 |
