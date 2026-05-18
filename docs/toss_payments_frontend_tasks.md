# Frontend Task List — Toss Payments Test Drive

## Summary
- Purpose: enumerate the frontend work required to exercise the full Toss Payments test-key flow end-to-end before live review submission.
- Scope: Veggieverse Store single-payment flow (PR1~PR6 backend already merged).
- Out of scope: PR7 (webhook), PR8 (reconciliation), production CORS tightening — backend-side, not frontend.
- Critical path: Phase 1 → 2 → 3 → 4 → 6 → 7.
- Phases 5, 8 run in parallel with the critical path.

## Phase 1 — Environment Setup
- task: Toss Payments developer console signup + test merchant info entry | reason: test keys behave like dead keys until merchant profile (business name, payment methods) is filled in
- task: issue test client + secret keys | output: `test_ck_...`, `test_sk_...` | reason: required for SDK init and BE confirm calls
- task: decide SDK package — payment-widget (v2) vs payment-window (v1) | output: `package.json` dependency line | reason: API surface differs entirely; mixing them causes "stuck before card input" failures
- task: register env vars in `.env.local` | keys: `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `NEXT_PUBLIC_API_BASE_URL` | reason: keys must not be hard-coded; base URL flips between local/staging/prod
- decision-point: SDK choice — `@tosspayments/payment-sdk` (v1, simpler, redirect-based) vs `@tosspayments/tosspayments-sdk` (v2, embedded widget, requires render order) | recommendation: v1 for review-first MVP, v2 for richer UX after review

## Phase 2 — Auth and Account Flow
- task: login page + JWT issue flow | api: `POST /api/v1/veggieverse/auth/token` | reason: every payment-side endpoint requires bearer JWT
- task: signup page (profile create) | api: `POST /api/v1/veggieverse/users/profile` | reason: cart→order requires a Consumer user
- task: email duplicate check | api: `GET /api/v1/veggieverse/users/email-check` | reason: prevents UX dead-end at signup submit
- task: JWT storage policy decision (localStorage vs httpOnly cookie) + interceptor injection | reason: every store/cart/order/payment call attaches `Authorization: Bearer ...`
- task: token-expiry handling (redirect to login on 401) | reason: long sessions on order page must not silently fail at confirm

## Phase 3 — Catalog and Cart
- task: product list page | api: `GET /api/v1/veggieverse/store/products` | reason: reviewer needs at least one visible product
- task: product detail page + add-to-cart button | api: `GET /api/v1/veggieverse/store/products/{slug}` | reason: entry into cart flow
- task: anonymous cart session issue | api: `POST /api/v1/veggieverse/store/cart/session` | reason: lets unauthenticated visitors hold items before signup
- task: cart page (view/update qty/remove) | apis: `GET /cart`, `PATCH /cart/items`, `DELETE /cart/items/{productId}` | reason: must demonstrate normal e-commerce behavior
- task: anonymous→authenticated cart merge on login | api: `POST /api/v1/veggieverse/store/cart/merge` | reason: prevents item loss across signup

## Phase 4 — Payment Flow (Critical)
- task: order sheet page (shipping address + cart summary + total) | reason: must show final amount that matches what BE will validate
- task: on "결제하기" click — call PENDING order create | api: `POST /api/v1/veggieverse/store/orders` | response: `{ tossOrderId, amount, orderName }`
- task: pass response into Toss SDK | important: `amount` must be coerced to integer (`Math.floor(amount)` or `Number(amount)`) | reason: BE returns `BigDecimal`; SDK rejects non-integer KRW
- task: invoke `requestPayment` strictly inside user click handler | reason: browser popup blocker fires if called from `useEffect` or load-time
- task: define routes `/payments/success` and `/payments/fail` | absolute urls required by Toss
- task: success page parses `paymentKey`, `orderId`, `amount` from query then calls confirm | api: `POST /api/v1/veggieverse/store/payments/confirm` | constraint: `amount` MUST equal value from order-create response | reason: BE raises `AmountMismatchException` otherwise
- task: success page renders `OrderDetailResponse` on confirm success | reason: gives reviewer visible completion state
- task: fail page parses `code` and `message` from query, renders human-friendly message + retry CTA | reason: review checks both happy and sad paths

### Phase 4 special — Widget SDK (v2) render order
- rule: `renderPaymentMethods` + `renderAgreement` MUST complete before `requestPayment` | reason: skipping either causes the widget to halt at method-selection screen — the most common failure mode reported as "stuck before card input"
- order:
  1. `const widgets = tossPayments.widgets({ customerKey })`
  2. `await widgets.setAmount({ currency: 'KRW', value: Number(amount) })`
  3. `await widgets.renderPaymentMethods({ selector: '#payment-methods' })`
  4. `await widgets.renderAgreement({ selector: '#agreement' })`
  5. `await widgets.requestPayment({ orderId, orderName, successUrl, failUrl })`

## Phase 5 — Order History and Refund
- task: order history list page | api: `GET /api/v1/veggieverse/store/users/orderHistory` | reason: reviewers occasionally walk this path
- task: order detail page | api: `GET /api/v1/veggieverse/store/users/orderHistory/{orderId}` | reason: entry into refund flow
- task: refund request modal (reason input) | api: `POST /api/v1/veggieverse/store/orders/{orderDbId}/refund` | reason: refund policy must be exercisable from the UI, not buried
- task: post-refund status refresh (REFUNDED visible) | reason: prevents duplicate refund requests from confused users

## Phase 6 — Legal and Static Pages
- task: `/terms` — terms of service page | reason: required by Toss review checklist
- task: `/privacy` — privacy policy page | reason: required by Korean Personal Information Protection Act + Toss review
- task: `/refund-policy` — refund and cancellation policy page | reason: must match BE behavior (full-refund-only this phase per `RefundRequest.kt` docs)
- task: site footer with business info — corp name, representative, business registration number, mail-order registration number, address, contact email | reason: telecom-sales-business notification requires public display
- task: signup form — checkboxes for terms + privacy consent | reason: legal consent capture

## Phase 7 — End-to-End Scenarios
- scenario: success card (`4330-1234-1234-1234` etc.) → confirm | expected: success page shown, order status = PAID
- scenario: payment-window cancel button | expected: redirect to failUrl, order status remains PENDING
- scenario: over-limit test card | expected: failUrl with `code` populated, friendly message shown
- scenario: close browser mid-payment | expected: order stays PENDING (PR7 webhook would reconcile later — out of scope for review)
- scenario: refresh success URL (re-invoke confirm) | expected: BE idempotent — no double charge, second response equals first
- scenario: refund after PAID | expected: REFUNDED status + Toss console shows cancel record
- scenario: re-refund same order | expected: BE rejects (already cancelled)
- scenario: tamper with `amount` via DevTools before confirm | expected: BE rejects via `AmountMismatchException` | reason: validates BE-side amount-gate is the source of truth

## Phase 8 — Continuous Hygiene
- task: keep DevTools Console error-free during all flows | reason: Toss review reproduces the user flow; any console error is a red flag
- task: verify Network tab sequence per payment — orders → SDK → confirm (3 calls minimum) | reason: catches silent failures where confirm never fires
- task: wrap all SDK calls in try/catch with user-visible error UI (no `alert()`) | reason: alert dialogs are rejected by modern UX reviewers
- task: render confirm 4xx/5xx as actionable error UI with retry path | reason: real users hit transient failures; reviewer may simulate

## Decisions Required Before Coding
- decision: SDK version (v1 payment-window vs v2 payment-widget) | impact: shapes entire Phase 4 code
- decision: JWT storage (localStorage vs httpOnly cookie) | impact: SSR vs CSR architecture, CSRF posture
- decision: which auth provider(s) to ship for review (email/password vs Google OAuth vs Kakao) | impact: Phase 2 implementation surface
- decision: order detail page can co-locate refund button or refund needs separate page | impact: Phase 5 routing

## Top Failure Modes Observed
- mode: stuck at payment-method selection in v2 widget | root cause: `renderPaymentMethods` or `renderAgreement` not awaited before `requestPayment` | fix: enforce order per Phase 4 special block
- mode: SDK rejects amount | root cause: `BigDecimal` from BE serialized as `1000.00` and forwarded unchanged | fix: `Number(amount)` or `Math.floor(amount)` before SDK call
- mode: popup blocked | root cause: `requestPayment` called outside user-gesture handler | fix: only invoke inside `onClick`
- mode: confirm fails with amount mismatch | root cause: frontend recalculated total on success page instead of using value from order-create response | fix: persist values from order-create response (sessionStorage or query) and reuse verbatim
- mode: console flooded with CORS errors | root cause: backend `app/SecurityConfig.kt` currently allows `*` in dev but staging env may differ | fix: verify `NEXT_PUBLIC_API_BASE_URL` host matches BE CORS allowlist

## References
- backend api contract: `slunch-backend/docs/openapi.json`
- payment plan (backend): `slunch-backend/md/implPlan.md` §6 PR1~PR6
- toss official docs: https://docs.tosspayments.com
- merchant setup guide: `slunch-backend/md/toss-payments-merchant-setup-guide.html`
- single-payment flow reference: `slunch-backend/md/toss-payments-single-payment.html`

## Open Questions for Product/Backend
- question: should "결제 중 브라우저 닫기" PENDING orders auto-expire before PR7 lands, or remain forever? | impact: Phase 4 edge-case UX
- question: refund reason is free text per `RefundRequest.kt` — is there a max length or fixed enum coming? | impact: Phase 5 form validation
- question: anonymous checkout supported in MVP or login required at order step? | impact: Phase 2/3 gating logic
