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

export async function postPayment(req: PaymentRequest): Promise<PaymentResponse | null> {
  try {
    const res = await apiFetch("/api/v1/veggieverse/subscription/payments", {
      method: "POST",
      body: req,
      auth: "required",
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "(body 없음)");
      if (res.status !== 401) {
        console.error("[postPayment] HTTP error:", res.status, res.statusText, "\n응답 body:", errBody);
      }
      return null;
    }
    return (await res.json()) as PaymentResponse;
  } catch (err) {
    console.error("[postPayment] fetch failed:", err);
    return null;
  }
}
