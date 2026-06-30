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
 * 구독 결제 요청. 실패 시 분류된 `SubscriptionPaymentError`를 던진다.
 * (과거엔 모든 실패를 null로 뭉갰으나, 호출 측이 원인별 안내를 못 하므로 변경)
 */
export async function postPayment(req: PaymentRequest): Promise<PaymentResponse> {
  let res: Response;
  try {
    // 스테이징 배포본 기준 경로. 백엔드 최신 코드는 이 엔드포인트를
    // `/subscription/payments`로 변경(커밋 b334b2b)했으나 스테이징에는 아직
    // 미배포 상태(현재 staging에는 `/orders`만 존재). 스테이징이 재배포되면
    // `/api/v1/veggieverse/subscription/payments`로 되돌릴 것.
    res = await apiFetch("/api/v1/veggieverse/subscription/orders", {
      method: "POST",
      body: req,
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
        "[postPayment] HTTP error:",
        res.status,
        res.statusText,
        "\n응답 body:",
        errBody || "(body 없음)",
      );
    }
    throw mapPaymentError(res.status, errBody);
  }

  return (await res.json()) as PaymentResponse;
}
