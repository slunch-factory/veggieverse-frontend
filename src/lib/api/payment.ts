import { apiFetch } from "@/lib/api/client";

const DELIVERY_CYCLE_MAP: Record<string, string> = {
  "1month": "MONTHLY",
  "2month": "BIMONTHLY",
};

export function mapDeliveryCycle(cycle: string): string {
  return DELIVERY_CYCLE_MAP[cycle] ?? cycle.toUpperCase();
}

export interface PaymentRequest {
  planId: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  deliveryCycle: string;
  deliveryAddress: {
    zipCode: string;
    street: string;
    detail: string;
  };
}

export interface PaymentProduct {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface PaymentResponse {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  startDate: string;
  endDate: string;
  deliveryCycle: string;
  deliveryAddress: {
    zipCode: string;
    street: string;
    detail: string;
  };
  originalAmount: number;
  shippingFee: number;
  discountInfo: {
    discountAmount: number;
    couponCode: string;
    couponName: string;
  };
  finalAmount: number;
  products: PaymentProduct[];
}

export const PAYMENT_RESULT_KEY = "veggieverse-payment-result";

/**
 * 구독 결제 실패 분류 코드.
 * - Retryable : 일시적 오류(5xx/네트워크) — 그대로 재시도 가능
 * - Rejected  : 결제 거절(400/402) — 결제수단·정보 확인 후 재시도
 * - Conflict  : 이미 진행 중인 구독 등(409)
 * - PlanInvalid: 플랜 만료/없음(404/410) — 식단을 다시 구성해야 함
 * - Auth      : 미인증(401) — apiFetch가 로그인 페이지로 유도
 * - Unknown   : 분류 불가
 */
export type SubscriptionPaymentErrorCode =
  | "Retryable"
  | "Rejected"
  | "Conflict"
  | "PlanInvalid"
  | "Auth"
  | "Unknown";

export class SubscriptionPaymentError extends Error {
  status: number;
  code: SubscriptionPaymentErrorCode;
  body?: string;
  constructor(
    status: number,
    code: SubscriptionPaymentErrorCode,
    message: string,
    body?: string,
  ) {
    super(message);
    this.name = "SubscriptionPaymentError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

function mapPaymentError(status: number, body: string): SubscriptionPaymentError {
  let code: SubscriptionPaymentErrorCode = "Unknown";
  let message = "";
  try {
    const parsed = JSON.parse(body) as { code?: string; message?: string };
    if (parsed?.message) message = parsed.message;
  } catch {
    // body가 JSON이 아니면 status 기반으로만 추정
  }

  if (status === 401) code = "Auth"; // apiFetch가 로그인 페이지로 redirect
  else if (status === 409) code = "Conflict";
  else if (status === 404 || status === 410) code = "PlanInvalid";
  else if (status === 503 || status >= 500) code = "Retryable";
  else if (status === 400 || status === 402) code = "Rejected";

  if (!message) message = defaultMessageFor(code);
  return new SubscriptionPaymentError(status, code, message, body || undefined);
}

function defaultMessageFor(code: SubscriptionPaymentErrorCode): string {
  switch (code) {
    case "Retryable":
      return "결제 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
    case "Rejected":
      return "결제가 거절되었습니다. 결제 정보를 확인한 뒤 다시 시도해 주세요.";
    case "Conflict":
      return "이미 진행 중인 구독이 있거나 주문 상태가 변경되었습니다.";
    case "PlanInvalid":
      return "선택하신 식단 정보가 만료되었습니다. 식단을 다시 구성해 주세요.";
    case "Auth":
      return "로그인이 필요합니다. 로그인 후 다시 시도해 주세요.";
    default:
      return "결제 중 알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.";
  }
}

/**
 * 구독 결제 관련 POST 공통 래퍼. 실패 시 분류된 `SubscriptionPaymentError`를 던진다.
 * (과거엔 모든 실패를 null로 뭉갰으나, 호출 측이 원인별 안내를 못 하므로 변경)
 */
async function postSubscription<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await apiFetch(path, {
      method: "POST",
      ...(body !== undefined ? { body } : {}),
      auth: "required",
    });
  } catch (err) {
    // 네트워크 단절 등 fetch 자체 실패 → 재시도 가능으로 분류
    throw new SubscriptionPaymentError(
      0,
      "Retryable",
      defaultMessageFor("Retryable"),
      err instanceof Error ? err.message : undefined,
    );
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    if (res.status !== 401) {
      console.error(
        `[postSubscription ${path}] HTTP error:`,
        res.status,
        res.statusText,
        "\n응답 body:",
        errBody || "(body 없음)",
      );
    }
    throw mapPaymentError(res.status, errBody);
  }

  return (await res.json()) as T;
}

// ─── 구독 정기결제(빌링) 3단계 흐름 ───────────────────────────────────
// 스테이징 백엔드가 단건 결제 → Toss 빌링(정기결제)로 전환됨. 순서:
//   1) postPayment            : PENDING 구독 주문 생성 → orderId 확보
//   2) Toss requestBillingAuth: 카드 등록(리다이렉트) → authKey·customerKey 획득
//   3) issueSubscriptionBillingKey : authKey로 빌링키 발급
//   4) chargeSubscriptionOrder     : 해당 주문 1회차 결제(charge)

/**
 * [1단계] PENDING 구독 주문 생성. 성공 시 `orderId`가 담긴 주문 정보를 반환한다.
 * 이후 Toss 빌링 등록 → 빌링키 발급 → charge 순으로 결제를 완료한다.
 */
export async function postPayment(req: PaymentRequest): Promise<PaymentResponse> {
  return postSubscription<PaymentResponse>(
    "/api/v1/veggieverse/subscription/orders",
    req,
  );
}

export interface SubscriptionBillingKeyIssueRequest {
  /** Toss 빌링 등록 성공 리다이렉트 쿼리로 전달되는 authKey */
  authKey: string;
  /** requestBillingAuth 시 사용한 것과 동일한 customerKey */
  customerKey: string;
}

export interface SubscriptionBillingKeyIssueResponse {
  billingKeyId: number;
  cardCompany?: string;
  cardLast4?: string;
  status: string;
}

/**
 * [3단계] Toss가 돌려준 authKey·customerKey로 빌링키를 발급한다.
 */
export async function issueSubscriptionBillingKey(
  req: SubscriptionBillingKeyIssueRequest,
): Promise<SubscriptionBillingKeyIssueResponse> {
  return postSubscription<SubscriptionBillingKeyIssueResponse>(
    "/api/v1/veggieverse/subscription/billing/issue",
    req,
  );
}

/**
 * [4단계] 발급된 빌링키로 해당 주문의 1회차 결제를 진행한다. 결제 완료된 주문 정보를 반환한다.
 */
export async function chargeSubscriptionOrder(
  orderId: number | string,
): Promise<PaymentResponse> {
  return postSubscription<PaymentResponse>(
    `/api/v1/veggieverse/subscription/orders/${encodeURIComponent(String(orderId))}/charge`,
  );
}
