# Frontend 작업 목록 — 토스 페이먼츠 테스트 드라이브

## 개요
- 목적: 운영 심사 제출 전에 토스 페이먼츠 테스트 키 흐름을 처음부터 끝까지 굴려보기 위해 FE에서 해야 할 작업을 모두 나열한다.
- 범위: Veggieverse Store 단건 결제 흐름 (BE PR1~PR6는 이미 머지됨).
- 범위 외: PR7 (웹훅), PR8 (정산 reconcile), 운영 환경 CORS 강화 — 모두 BE 영역.
- 크리티컬 패스: Phase 1 → 2 → 3 → 4 → 6 → 7.
- Phase 5, 8은 크리티컬 패스와 병렬 진행.

## Phase 1 — 환경 셋업
- 작업: 토스 페이먼츠 개발자 콘솔 가입 + 테스트 가맹점 정보 입력 | 이유: 가맹점 프로필(상호, 결제 수단)이 채워지기 전엔 테스트 키도 사실상 죽은 키처럼 동작함
- 작업: 테스트 클라이언트/시크릿 키 발급 | 산출물: `test_ck_...`, `test_sk_...` | 이유: SDK 초기화 및 BE confirm 호출에 필수
- 작업: SDK 패키지 결정 — payment-widget (v2) vs payment-window (v1) | 산출물: `package.json` 의존성 한 줄 | 이유: 두 SDK의 API surface가 완전히 다르고, 섞어 쓰면 "카드 입력 직전에 멈추는" 장애가 발생
- 작업: `.env.local` 에 환경변수 등록 | 키: `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `NEXT_PUBLIC_API_BASE_PATH` | 이유: 키를 하드코딩하면 안 되고, base URL은 local/staging/prod 간 전환되어야 함
- 의사결정 지점: SDK 선택 — `@tosspayments/payment-sdk` (v1, 단순, 리다이렉트 기반) vs `@tosspayments/tosspayments-sdk` (v2, 임베드 위젯, 렌더 순서 강제) | 권장: 심사 우선 MVP는 v1, 심사 통과 후 UX 강화를 위해 v2 전환

## Phase 2 — 인증 / 계정 흐름
- 작업: 로그인 페이지 + JWT 발급 흐름 | API: `POST /api/v1/veggieverse/auth/token` | 이유: 결제 관련 모든 엔드포인트가 Bearer JWT를 요구함
- 작업: 회원가입 페이지 (프로필 생성) | API: `POST /api/v1/veggieverse/users/profile` | 이유: 장바구니→주문은 Consumer 사용자 자격이 필요
- 작업: 이메일 중복 검사 | API: `GET /api/v1/veggieverse/users/email-check` | 이유: 가입 submit 시점 데드엔드 방지
- 작업: JWT 저장 정책 결정 (localStorage vs httpOnly 쿠키) + 인터셉터 주입 | 이유: store/cart/order/payment 호출마다 `Authorization: Bearer ...` 첨부 필요
- 작업: 토큰 만료 처리 (401 시 로그인으로 리다이렉트) | 이유: 주문 페이지에서 세션이 길어진 경우 confirm 단계에서 조용히 실패하면 안 됨

## Phase 3 — 카탈로그 / 장바구니
- 작업: 상품 목록 페이지 | API: `GET /api/v1/veggieverse/store/products` | 이유: 심사자가 최소 1개 상품을 볼 수 있어야 함
- 작업: 상품 상세 페이지 + 장바구니 담기 버튼 | API: `GET /api/v1/veggieverse/store/products/{slug}` | 이유: 카트 흐름 진입점
- 작업: 비회원 카트 세션 발급 | API: `POST /api/v1/veggieverse/store/cart/session` | 이유: 비로그인 방문자가 가입 전에도 상품을 담아둘 수 있도록 함
- 작업: 카트 페이지 (조회/수량 변경/삭제) | API: `GET /cart`, `PATCH /cart/items`, `DELETE /cart/items/{productId}` | 이유: 일반적인 이커머스 동작 시연 필요
- 작업: 로그인 시 비회원→회원 카트 병합 | API: `POST /api/v1/veggieverse/store/cart/merge` | 이유: 가입 도중 담아둔 상품이 사라지지 않게 함

## Phase 4 — 결제 흐름 (크리티컬)
- 작업: 주문서 페이지 (배송지 + 카트 요약 + 최종 금액) | 이유: BE가 검증할 최종 금액과 화면에 보이는 금액이 일치해야 함
- 작업: "결제하기" 클릭 시 PENDING 주문 생성 호출 | API: `POST /api/v1/veggieverse/store/orders` | 응답: `{ tossOrderId, amount, orderName }`
- 작업: 응답을 토스 SDK 인자로 전달 | 중요: `amount`는 정수로 강제 변환 (`Math.floor(amount)` 또는 `Number(amount)`) | 이유: BE가 `BigDecimal`로 반환하는데 SDK는 KRW에서 정수가 아니면 거부
- 작업: `requestPayment` 호출은 반드시 사용자 클릭 핸들러 안에서 | 이유: `useEffect`나 로드 시점에서 호출하면 브라우저 팝업 차단에 걸림
- 작업: `/order/success`, `/payments/fail` 라우트 정의 | 토스는 절대 URL을 요구함
- 작업: success 페이지에서 쿼리의 `paymentKey`, `orderId`, `amount` 파싱 후 confirm 호출 | API: `POST /api/v1/veggieverse/store/payments/confirm` | 제약: `amount`는 주문 생성 응답의 값과 반드시 동일 | 이유: 다르면 BE가 `AmountMismatchException` 발생
- 작업: confirm 성공 시 `OrderDetailResponse`를 success 페이지에 렌더링 | 이유: 심사자에게 완료 상태가 명시적으로 보여야 함
- 작업: fail 페이지에서 쿼리의 `code`, `message` 파싱 후 사람 친화 메시지 + 재시도 CTA 렌더링 | 이유: 심사가 happy path와 sad path 둘 다 확인함

### Phase 4 보충 — 위젯 SDK (v2) 렌더 순서
- 규칙: `renderPaymentMethods` + `renderAgreement` 가 **모두 끝난 뒤에** `requestPayment` 를 호출해야 함 | 이유: 둘 중 하나라도 빼면 결제수단 선택 화면에서 멈춤 — 가장 흔히 보고되는 "카드 입력 직전 멈춤" 장애의 근본 원인
- 순서:
  1. `const widgets = tossPayments.widgets({ customerKey })`
  2. `await widgets.setAmount({ currency: 'KRW', value: Number(amount) })`
  3. `await widgets.renderPaymentMethods({ selector: '#payment-methods' })`
  4. `await widgets.renderAgreement({ selector: '#agreement' })`
  5. `await widgets.requestPayment({ orderId, orderName, successUrl, failUrl })`

## Phase 5 — 주문 내역 / 환불
- 작업: 주문 내역 리스트 페이지 | API: `GET /api/v1/veggieverse/store/users/orderHistory` | 이유: 심사자가 가끔 이 경로를 따라가 봄
- 작업: 주문 상세 페이지 | API: `GET /api/v1/veggieverse/store/users/orderHistory/{orderId}` | 이유: 환불 흐름 진입점
- 작업: 환불 요청 모달 (사유 입력) | API: `POST /api/v1/veggieverse/store/orders/{orderDbId}/refund` | 이유: 환불 정책이 UI에서 실행 가능해야 함, 어딘가 깊이 숨겨두면 안 됨
- 작업: 환불 후 상태 갱신 (REFUNDED 노출) | 이유: 사용자가 헷갈려서 중복 환불 요청 보내는 사고 방지

## Phase 6 — 법적 / 정적 페이지
- 작업: `/terms` — 이용약관 페이지 | 이유: 토스 심사 체크리스트 필수 항목
- 작업: `/privacy` — 개인정보 처리방침 페이지 | 이유: 개인정보보호법 + 토스 심사 필수
- 작업: `/refund-policy` — 환불 / 취소 정책 페이지 | 이유: BE 동작과 일치해야 함 (이번 단계는 `RefundRequest.kt` 문서대로 전액 환불만 지원)
- 작업: 사이트 푸터에 사업자 정보 — 상호, 대표자, 사업자등록번호, 통신판매업 신고번호, 주소, 연락 이메일 | 이유: 통신판매업 신고에 따라 공개 게시 의무
- 작업: 회원가입 폼 — 약관 / 개인정보 동의 체크박스 | 이유: 법적 동의 캡처

## Phase 7 — End-to-End 시나리오
- 시나리오: 정상 카드 (`4330-1234-1234-1234` 등) → confirm | 기대: success 페이지 노출, 주문 상태 = PAID
- 시나리오: 결제창에서 취소 버튼 클릭 | 기대: failUrl 로 리다이렉트, 주문 상태는 PENDING 유지
- 시나리오: 한도 초과 테스트 카드 | 기대: failUrl 진입 + `code` 채워짐 + 친화적 메시지 노출
- 시나리오: 결제 중 브라우저 닫기 | 기대: 주문은 PENDING 유지 (PR7 웹훅으로 추후 보정 — 심사 단계 범위 외)
- 시나리오: success URL 새로고침 (confirm 재호출) | 기대: BE 멱등 — 이중 청구 없음, 두번째 응답이 첫번째와 동일
- 시나리오: PAID 이후 환불 | 기대: REFUNDED 상태 + 토스 콘솔에서 취소 기록 확인
- 시나리오: 같은 주문 재환불 | 기대: BE가 거부 (이미 취소됨)
- 시나리오: DevTools 로 `amount` 변조 후 confirm | 기대: BE가 `AmountMismatchException` 으로 거부 | 이유: 금액 검증의 source of truth가 BE임을 검증

## Phase 8 — 지속적 위생 관리
- 작업: 모든 흐름에서 DevTools 콘솔 무에러 유지 | 이유: 토스 심사가 사용자 흐름을 직접 재현하는데, 콘솔 에러는 그 자체로 레드 플래그
- 작업: 결제마다 Network 탭 순서 검증 — orders → SDK → confirm (최소 3개 호출) | 이유: confirm이 영영 안 불리는 식의 조용한 실패 잡아냄
- 작업: SDK 호출 전부 try/catch + 사용자에게 보이는 에러 UI (`alert()` 금지) | 이유: alert는 현대 UX 심사에서 거부됨
- 작업: confirm의 4xx/5xx 응답은 액션 가능한 에러 UI + 재시도 경로로 렌더링 | 이유: 실제 사용자가 일시 장애를 만나고, 심사자가 시뮬레이션할 수 있음

## 코딩 전에 결정 필요한 사항
- 결정: SDK 버전 (v1 payment-window vs v2 payment-widget) | 영향: Phase 4 코드 전체 구조
- 결정: JWT 저장 위치 (localStorage vs httpOnly 쿠키) | 영향: SSR/CSR 아키텍처, CSRF 자세
- 결정: 심사용으로 어떤 인증 제공자 출시 (이메일/패스워드 vs Google OAuth vs 카카오) | 영향: Phase 2 구현 범위
- 결정: 주문 상세 페이지 안에 환불 버튼을 둘지, 별도 페이지로 분리할지 | 영향: Phase 5 라우팅

## 가장 흔한 실패 모드
- 모드: v2 위젯의 결제수단 선택 화면에서 멈춤 | 근본 원인: `requestPayment` 호출 전에 `renderPaymentMethods` 또는 `renderAgreement` 를 `await` 하지 않음 | 해결: Phase 4 보충 블록의 순서 준수
- 모드: SDK가 amount를 거부 | 근본 원인: BE의 `BigDecimal` 이 `1000.00` 으로 직렬화돼 그대로 전달됨 | 해결: SDK 호출 전 `Number(amount)` 또는 `Math.floor(amount)` 처리
- 모드: 팝업 차단 | 근본 원인: `requestPayment` 가 사용자 제스처 핸들러 밖에서 호출됨 | 해결: 반드시 `onClick` 내부에서만 호출
- 모드: confirm 단계에서 amount mismatch | 근본 원인: FE가 success 페이지에서 합계를 다시 계산해서 보냄 | 해결: 주문 생성 응답의 값을 sessionStorage 또는 쿼리에 그대로 보관·재사용
- 모드: 콘솔에 CORS 에러 폭주 | 근본 원인: 현재 BE `app/SecurityConfig.kt` 가 dev에서는 `*` 허용이지만 staging은 다를 수 있음 | 해결: `NEXT_PUBLIC_API_BASE_PATH` 호스트가 BE CORS 화이트리스트와 일치하는지 확인

## 참고 자료
- BE API 계약: `slunch-backend/docs/openapi.json`
- 결제 플랜 (BE): `slunch-backend/md/implPlan.md` §6 PR1~PR6
- 토스 공식 문서: https://docs.tosspayments.com
- 가맹점 셋업 가이드: `slunch-backend/md/toss-payments-merchant-setup-guide.html`
- 단건 결제 흐름 레퍼런스: `slunch-backend/md/toss-payments-single-payment.html`

## 프로덕트 / 백엔드에 묻고 갈 것
- 질문: "결제 중 브라우저 닫음" 으로 생긴 PENDING 주문은 PR7 도입 전까지 자동 만료시킬지, 영원히 둘지? | 영향: Phase 4 엣지케이스 UX
- 질문: 환불 사유는 `RefundRequest.kt` 기준 자유 텍스트인데, 최대 길이 또는 고정 enum이 추후 들어오는지? | 영향: Phase 5 폼 검증
- 질문: MVP에서 비회원 결제를 지원할지, 주문 단계에서 로그인 강제할지? | 영향: Phase 2/3 게이팅 로직
