import { apiFetch } from "@/lib/api/client";
import type {
  StoreOrderDetailResponse,
} from "@/lib/api/store";

/* ------------------------------------------------------------------ */
/*  Step 1 — PENDING 주문 생성                                          */
/* ------------------------------------------------------------------ */

export interface CreateStoreOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateStoreOrderDeliveryAddress {
  zipCode?: string;
  street?: string;
  detail?: string;
}

export interface CreateStoreOrderRequest {
  items: CreateStoreOrderItem[];
  deliveryAddress: CreateStoreOrderDeliveryAddress;
  isCartOrder: boolean;
  couponId?: string;
}

export interface CreateStoreOrderResponse {
  orderDbId: number;
  tossOrderId: string;
  orderName: string;
  amount: number;
  currency: string;
  customerEmail?: string | null;
  customerName?: string | null;
  customerMobilePhone?: string | null;
}

export async function createStoreOrder(
  req: CreateStoreOrderRequest,
): Promise<CreateStoreOrderResponse> {
  const res = await apiFetch("/api/v1/veggieverse/store/orders", {
    method: "POST",
    body: req,
    auth: "required",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new StorePaymentError(res.status, "CreateOrderFailed", body || res.statusText);
  }
  return (await res.json()) as CreateStoreOrderResponse;
}

/* ------------------------------------------------------------------ */
/*  Step 4 — 최종 결제 승인                                             */
/* ------------------------------------------------------------------ */

export interface ConfirmStorePaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export type ConfirmErrorCode =
  | "AmountMismatch"
  | "OrderExpired"
  | "PaymentRejected"
  | "PaymentRetryable"
  | "Unknown";

export class StorePaymentError extends Error {
  status: number;
  code: ConfirmErrorCode | string;
  body?: string;
  constructor(status: number, code: string, message: string, body?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

function mapConfirmError(status: number, body: string): StorePaymentError {
  let code: ConfirmErrorCode = "Unknown";
  let message = body || `HTTP ${status}`;
  try {
    const parsed = JSON.parse(body) as { code?: string; message?: string };
    if (parsed?.message) message = parsed.message;
    if (parsed?.code) {
      if (parsed.code.includes("AmountMismatch")) code = "AmountMismatch";
      else if (parsed.code.includes("OrderExpired")) code = "OrderExpired";
      else if (parsed.code.includes("PaymentRejected")) code = "PaymentRejected";
      else if (parsed.code.includes("PaymentRetryable")) code = "PaymentRetryable";
    }
  } catch {
    // body 가 JSON이 아니면 status 기반으로 추정
  }
  if (code === "Unknown") {
    if (status === 410) code = "OrderExpired";
    else if (status === 503) code = "PaymentRetryable";
    else if (status === 400) code = "PaymentRejected";
  }
  return new StorePaymentError(status, code, message, body);
}

export async function confirmStorePayment(
  req: ConfirmStorePaymentRequest,
): Promise<StoreOrderDetailResponse> {
  const res = await apiFetch("/api/v1/veggieverse/store/payments/confirm", {
    method: "POST",
    body: req,
    auth: "required",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw mapConfirmError(res.status, body);
  }
  return (await res.json()) as StoreOrderDetailResponse;
}

/* ------------------------------------------------------------------ */
/*  환불 요청                                                            */
/* ------------------------------------------------------------------ */

export interface RefundStoreOrderRequest {
  reason: string;
}

/**
 * 주문 환불 요청 (전액 환불).
 * 성공 시 BE는 갱신된 OrderDetailResponse(상태 REFUNDED/CANCELED 등) 반환.
 * 실패 시 StorePaymentError 던짐 — 호출 측이 사용자에게 message 노출.
 */
export async function refundStoreOrder(
  orderDbId: number | string,
  req: RefundStoreOrderRequest,
): Promise<StoreOrderDetailResponse> {
  const path = `/api/v1/veggieverse/store/orders/${encodeURIComponent(String(orderDbId))}/refund`;
  const res = await apiFetch(path, {
    method: "POST",
    body: req,
    auth: "required",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = body || `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed?.message) message = parsed.message;
    } catch {
      // body가 JSON이 아니면 raw 텍스트 사용
    }
    throw new StorePaymentError(res.status, "RefundFailed", message, body);
  }
  return (await res.json()) as StoreOrderDetailResponse;
}
