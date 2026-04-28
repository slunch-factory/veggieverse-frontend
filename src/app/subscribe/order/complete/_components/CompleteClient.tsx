"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_RESULT_KEY, type PaymentResponse } from "@/lib/api/payment";
import { clearOrder } from "@/app/subscribe/_data/order";

function toKoreanDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export function CompleteClient() {
  const router = useRouter();
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    const raw = sessionStorage.getItem(PAYMENT_RESULT_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(raw) as PaymentResponse);
      sessionStorage.removeItem(PAYMENT_RESULT_KEY);
      clearOrder();
    } catch {
      router.replace("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[13px] text-gray-400">
        결제 정보를 불러오는 중...
      </div>
    );
  }

  const discount = result.discountInfo?.discountAmount ?? 0;

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-[560px] mx-auto px-5 pt-16 pb-12">

        {/* 완료 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 border-2 border-black mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-[26px] tracking-tight text-black mb-2">결제가 완료되었습니다</h1>
          <p className="text-[13px] text-gray-500">주문 번호 {result.orderNumber}</p>
          <p className="text-[12px] text-gray-400 mt-1">{toKoreanDate(result.orderDate)} 결제</p>
        </div>

        {/* 구독 기간 */}
        <section className="border border-black mb-4">
          <header className="px-5 py-3 border-b border-black bg-[#f7f4ef]">
            <h2 className="text-[12px] tracking-[0.1em] uppercase text-[#8c451d]">Subscription Period</h2>
          </header>
          <div className="px-5 py-4 flex justify-between text-[13px]">
            <span className="text-gray-500">구독 기간</span>
            <span className="text-black">{toKoreanDate(result.startDate)} ~ {toKoreanDate(result.endDate)}</span>
          </div>
        </section>

        {/* 주문 상품 */}
        {result.products && result.products.length > 0 && (
          <section className="border border-black mb-4">
            <header className="px-5 py-3 border-b border-black bg-[#f7f4ef]">
              <h2 className="text-[12px] tracking-[0.1em] uppercase text-[#8c451d]">Products</h2>
            </header>
            <ul>
              {result.products.map((p, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3 border-b border-[#e5e2dc] last:border-b-0">
                  {p.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover bg-[#EDEAE5] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-black truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">수량 {p.quantity}</p>
                  </div>
                  <span className="text-[13px] text-black shrink-0">{p.price.toLocaleString()}원</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 결제 금액 */}
        <section className="border border-black mb-8">
          <header className="px-5 py-3 border-b border-black bg-[#f7f4ef]">
            <h2 className="text-[12px] tracking-[0.1em] uppercase text-[#8c451d]">Payment</h2>
          </header>
          <div className="px-5 py-4 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">상품 금액</span>
              <span>{result.originalAmount.toLocaleString()}원</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">할인</span>
                <span className="text-[#e05858]">- {discount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">배송비</span>
              <span className="text-gray-500">{result.shippingFee === 0 ? "무료" : `${result.shippingFee.toLocaleString()}원`}</span>
            </div>
            <div className="pt-3 mt-1 border-t border-[#e5e2dc] flex justify-between">
              <span className="text-[14px] text-black">최종 결제 금액</span>
              <span className="text-[22px] leading-tight tracking-tight text-[#8c451d]">
                {result.finalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        {/* 홈으로 */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full h-12 bg-black text-[#dcfd4a] text-[14px] tracking-wide hover:bg-[#8c451d] transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
