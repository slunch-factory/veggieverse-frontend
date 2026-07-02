"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { CartItem } from "@/contexts/CartContext";
import Link from "next/link";
import { getUserProfile } from "@/lib/api/user";
import {
  ChevronLeft,
  Check,
  User,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";
import { DeliveryEstimate } from "@/components/common/DeliveryEstimate";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { createStoreOrder } from "@/lib/api/store-payment";

const SHIPPING_FEE = 3500;
const FREE_SHIPPING_THRESHOLD = 55000;

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";

export const STORE_ORDER_SNAPSHOT_KEY = "veggieverse-store-order-snapshot";

/** Toss 리다이렉트 직전에 보관하는 결제 컨텍스트. confirm 응답 전까지 UI 복원에 사용. */
export interface StoreOrderSnapshot {
  orderDbId: number;
  tossOrderId: string;
  amount: number;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

const DELIVERY_NOTE_PRESETS = [
  "문 앞에 놓아주세요",
  "경비실에 맡겨주세요",
  "부재 시 연락주세요",
  "직접 전달해 주세요",
];

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

interface FormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerPostalCode: string;
  customerAddress: string;
  customerAddressDetail: string;
  sameAsCustomer: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientPostalCode: string;
  recipientAddress: string;
  recipientAddressDetail: string;
  deliveryNote: string;
  agreeOrder: boolean;
  agreePrivacy: boolean;
  agreeThirdParty: boolean;
  agreeMarketing: boolean;
}

const INITIAL_FORM: FormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerPostalCode: "",
  customerAddress: "",
  customerAddressDetail: "",
  sameAsCustomer: false,
  recipientName: "",
  recipientPhone: "",
  recipientPostalCode: "",
  recipientAddress: "",
  recipientAddressDetail: "",
  deliveryNote: "",
  agreeOrder: false,
  agreePrivacy: false,
  agreeThirdParty: false,
  agreeMarketing: false,
};

export function OrderClient() {
  const searchParams = useSearchParams();
  const { items } = useCart();

  const isDirectBuy = searchParams.get("directBuy") === "true";

  const [directBuyItem] = useState<CartItem | null>(() => {
    if (!isDirectBuy || typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("directBuyItem");
    if (!stored) return null;
    try {
      const item = JSON.parse(stored);
      sessionStorage.removeItem("directBuyItem");
      return item;
    } catch {
      return null;
    }
  });

  const selectedIds = useMemo(() => {
    if (isDirectBuy) return new Set<number>();
    const raw = searchParams.get("items");
    if (!raw) return new Set<number>();
    return new Set(raw.split(",").map(Number).filter(Boolean));
  }, [searchParams, isDirectBuy]);

  const orderItems = useMemo(() => {
    if (isDirectBuy) return directBuyItem ? [directBuyItem] : [];
    return items.filter((i) => selectedIds.has(i.productId));
  }, [isDirectBuy, directBuyItem, items, selectedIds]);

  const subtotal = orderItems.reduce((s, i) => s + i.discountedPrice * i.quantity, 0);
  const shippingFee =
    orderItems.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deliveryNoteCustom, setDeliveryNoteCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [postcodeTarget, setPostcodeTarget] = useState<"recipient" | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);


  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile) {
        setForm((prev) => ({
          ...prev,
          customerName: profile.name || "",
          customerPhone: formatPhone(profile.phoneNumber || ""),
          customerEmail: profile.email || "",
          customerPostalCode: profile.address?.zipCode || "",
          customerAddress: profile.address?.street || "",
          customerAddressDetail: profile.address?.detail || "",
        }));
      }
      setProfileLoading(false);
    });
  }, []);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSameAsCustomer = useCallback((checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      sameAsCustomer: checked,
      ...(checked && {
        recipientName: prev.customerName,
        recipientPhone: prev.customerPhone,
        recipientPostalCode: prev.customerPostalCode,
        recipientAddress: prev.customerAddress,
        recipientAddressDetail: prev.customerAddressDetail,
      }),
    }));
  }, []);

  const allTermsChecked =
    form.agreeOrder && form.agreePrivacy && form.agreeThirdParty && form.agreeMarketing;

  const toggleAllTerms = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      agreeOrder: checked,
      agreePrivacy: checked,
      agreeThirdParty: checked,
      agreeMarketing: checked,
    }));
  };

  const canSubmit = useMemo(() => {
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.customerEmail.trim())
      return false;
    if (
      !form.recipientName.trim() ||
      !form.recipientPhone.trim() ||
      !form.recipientPostalCode ||
      !form.recipientAddress
    )
      return false;
    return form.agreeOrder && form.agreePrivacy && form.agreeThirdParty;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    if (!TOSS_CLIENT_KEY) {
      setSubmitError("결제 설정이 누락되어 있습니다 (TOSS_CLIENT_KEY).");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      // [STEP 1] PENDING 주문 생성
      const order = await createStoreOrder({
        items: orderItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          zipCode: form.recipientPostalCode || undefined,
          street: form.recipientAddress || undefined,
          detail: form.recipientAddressDetail || undefined,
        },
        isCartOrder: !isDirectBuy,
      });

      // BE가 BigDecimal을 "12810.00" 으로 직렬화하더라도 SDK가 정수만 받으므로 강제 변환
      const amountInt = Math.floor(Number(order.amount));

      // confirm 단계에서 UI 복원에 쓸 스냅샷 저장
      const snapshot: StoreOrderSnapshot = {
        orderDbId: order.orderDbId,
        tossOrderId: order.tossOrderId,
        amount: amountInt,
        items: orderItems,
        subtotal,
        shippingFee,
        total,
      };
      sessionStorage.setItem(STORE_ORDER_SNAPSHOT_KEY, JSON.stringify(snapshot));

      // [STEP 2] Toss 결제창 호출 — 결제 수단은 토스 결제창 안에서 선택
      const toss = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = toss.payment({ customerKey: ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: order.currency || "KRW", value: amountInt },
        orderId: order.tossOrderId,
        orderName: order.orderName,
        customerEmail: order.customerEmail ?? undefined,
        customerName: order.customerName ?? undefined,
        customerMobilePhone: order.customerMobilePhone ?? undefined,
        successUrl: `${window.location.origin}/order/success`,
        failUrl: `${window.location.origin}/order/fail`,
        // 브라우저별 자동 분기(크롬=새 창 / 사파리=iframe) 차이를 없애기 위해 iframe으로 통일.
        windowTarget: "iframe",
        card: {
          useEscrow: false,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
      // 정상 흐름: Toss가 successUrl 또는 failUrl로 리다이렉트.
    } catch (err: unknown) {
      console.error("[order] 결제 실패:", err);
      const message =
        err instanceof Error ? err.message : "결제를 시작하지 못했습니다. 잠시 후 다시 시도해주세요.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }, [
    canSubmit,
    submitting,
    orderItems,
    isDirectBuy,
    form.recipientPostalCode,
    form.recipientAddress,
    form.recipientAddressDetail,
    subtotal,
    shippingFee,
    total,
  ]);

  if (orderItems.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "var(--bg-pale)" }}
      >
        <p className="t-h3" style={{ color: "var(--ink)" }}>주문할 상품이 없습니다</p>
        <Link href="/cart" className="btn btn-dark btn-md">장바구니로 돌아가기</Link>
      </div>
    );
  }

  return (
    <>
      <KakaoPostcodeModal
        isOpen={postcodeTarget !== null}
        onClose={() => setPostcodeTarget(null)}
        onSelect={({ postalCode, address }) => {
          setForm((prev) => ({
            ...prev,
            recipientPostalCode: postalCode,
            recipientAddress: address,
            recipientAddressDetail: "",
          }));
          setPostcodeTarget(null);
        }}
      />

      <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 t-small mb-6"
            style={{ color: "var(--ink-light)" }}
          >
            <ChevronLeft size={16} />
            장바구니
          </Link>

          <h1 className="t-h2 mb-8" style={{ color: "var(--ink)" }}>주문·결제</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 좌: 폼 */}
            <div className="flex-1 flex flex-col gap-5">

              {/* 주문 상품 */}
              <div
                style={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--ink)",
                  borderRadius: "var(--r-btn)",
                }}
              >
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--neutral-stone)" }}>
                  <p className="t-h3" style={{ color: "var(--ink)" }}>
                    주문 상품 {orderItems.length}개
                  </p>
                </div>
                <ul>
                  {orderItems.map((item, idx) => (
                    <li
                      key={item.productId}
                      className="flex gap-3 px-5 py-4"
                      style={{ borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)" }}
                    >
                      <div
                        className="relative flex-shrink-0 overflow-hidden"
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "var(--r-btn)",
                          background: "var(--bg-off)",
                          border: "1px solid var(--neutral-stone)",
                        }}
                      >
                        {item.imageUrl && (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="t-small truncate" style={{ color: "var(--ink)" }}>{item.name}</p>
                        {item.tagline && (
                          <p className="t-caption truncate mt-0.5" style={{ color: "var(--ink-light)" }}>
                            {item.tagline}
                          </p>
                        )}
                        <p className="t-caption mt-1" style={{ color: "var(--ink-light)" }}>
                          수량 {item.quantity}개
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.discountRate > 0 && (
                          <p className="card-orig">{formatPrice(item.price * item.quantity)}원</p>
                        )}
                        <p className="t-small" style={{ color: "var(--ink)" }}>
                          {formatPrice(item.discountedPrice * item.quantity)}원
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 주문자 정보 — 회원정보에서 자동 조회 */}
              <FormSection
                icon={<User size={16} strokeWidth={1.5} />}
                title="주문자 정보"
              >
                {profileLoading ? (
                  <p className="t-small text-center py-4" style={{ color: "var(--ink-light)" }}>
                    불러오는 중...
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-4">
                      <FormField label="이름" className="flex-1">
                        <input
                          value={form.customerName}
                          readOnly
                          placeholder="이름"
                          className="order-input order-input-readonly"
                        />
                      </FormField>
                      <FormField label="휴대전화" className="flex-1">
                        <input
                          value={form.customerPhone}
                          readOnly
                          placeholder="010-0000-0000"
                          className="order-input order-input-readonly"
                        />
                      </FormField>
                    </div>
                    <FormField label="이메일">
                      <input
                        value={form.customerEmail}
                        readOnly
                        placeholder="이메일"
                        className="order-input order-input-readonly"
                      />
                    </FormField>
                    <FormField label="주소">
                      <input
                        value={form.customerPostalCode}
                        readOnly
                        placeholder="우편번호"
                        className="order-input order-input-readonly"
                        style={{ width: 120, flexShrink: 0 }}
                      />
                      <input
                        value={form.customerAddress}
                        readOnly
                        placeholder="기본 주소"
                        className="order-input order-input-readonly mt-2"
                      />
                      <input
                        value={form.customerAddressDetail}
                        readOnly
                        placeholder="상세 주소"
                        className="order-input order-input-readonly mt-2"
                      />
                    </FormField>
                  </>
                )}
              </FormSection>

              {/* 배송지 정보 */}
              <FormSection
                icon={<MapPin size={16} strokeWidth={1.5} />}
                title="배송지 정보"
                headerRight={
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.sameAsCustomer}
                      onChange={(e) => handleSameAsCustomer(e.target.checked)}
                      className="sr-only"
                    />
                    <StoreCheckBox checked={form.sameAsCustomer} size={15} />
                    <span className="t-caption" style={{ color: "var(--ink)" }}>
                      주문자 정보와 동일
                    </span>
                  </label>
                }
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <FormField label="받으시는 분" required className="flex-1">
                    <input
                      value={form.recipientName}
                      onChange={(e) => update("recipientName", e.target.value)}
                      placeholder="받으시는 분 이름"
                      disabled={form.sameAsCustomer}
                      className="order-input"
                    />
                  </FormField>
                  <FormField label="휴대전화" required className="flex-1">
                    <input
                      type="tel"
                      value={form.recipientPhone}
                      onChange={(e) => update("recipientPhone", e.target.value)}
                      placeholder="010-0000-0000"
                      disabled={form.sameAsCustomer}
                      className="order-input"
                    />
                  </FormField>
                </div>
                <FormField label="주소" required>
                  <div className="flex gap-2">
                    <input
                      value={form.recipientPostalCode}
                      readOnly
                      disabled={form.sameAsCustomer}
                      placeholder="우편번호"
                      className="order-input"
                      style={{ width: 120, flexShrink: 0 }}
                    />
                    <button
                      type="button"
                      onClick={() => setPostcodeTarget("recipient")}
                      disabled={form.sameAsCustomer}
                      className="btn btn-ghost btn-sm flex-shrink-0"
                      style={{ border: "1px solid var(--neutral-stone)" }}
                    >
                      주소 검색
                    </button>
                  </div>
                  <input
                    value={form.recipientAddress}
                    readOnly
                    disabled={form.sameAsCustomer}
                    placeholder="기본 주소"
                    className="order-input mt-2"
                  />
                  <input
                    value={form.recipientAddressDetail}
                    onChange={(e) => update("recipientAddressDetail", e.target.value)}
                    disabled={form.sameAsCustomer}
                    placeholder="상세 주소 (동·호수)"
                    className="order-input mt-2"
                  />
                </FormField>
                <FormField label="배송 메모">
                  <select
                    value={deliveryNoteCustom ? "기타" : form.deliveryNote}
                    onChange={(e) => {
                      if (e.target.value === "기타") {
                        setDeliveryNoteCustom(true);
                        update("deliveryNote", "");
                      } else {
                        setDeliveryNoteCustom(false);
                        update("deliveryNote", e.target.value);
                      }
                    }}
                    className="order-input order-select"
                  >
                    <option value="">배송 메모를 선택해주세요</option>
                    {DELIVERY_NOTE_PRESETS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="기타">기타 (직접 입력)</option>
                  </select>
                  {deliveryNoteCustom && (
                    <input
                      value={form.deliveryNote}
                      onChange={(e) => update("deliveryNote", e.target.value)}
                      placeholder="배송 메모를 입력해주세요"
                      className="order-input mt-2"
                    />
                  )}
                </FormField>
              </FormSection>

              {/* 이용약관 동의 */}
              <FormSection
                icon={<ShieldCheck size={16} strokeWidth={1.5} />}
                title="이용약관 동의"
              >
                <label
                  className="flex items-center gap-2 cursor-pointer select-none pb-3"
                  style={{ borderBottom: "1px solid var(--neutral-stone)" }}
                >
                  <input
                    type="checkbox"
                    checked={allTermsChecked}
                    onChange={(e) => toggleAllTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <StoreCheckBox checked={allTermsChecked} />
                  <span className="t-body" style={{ color: "var(--ink)", fontWeight: 600 }}>
                    전체 동의
                  </span>
                </label>
                <div className="flex flex-col gap-0.5 mt-1">
                  <TermsRow
                    checked={form.agreeOrder}
                    onChange={(v) => update("agreeOrder", v)}
                    label="주문 상품 정보 확인 및 결제 진행 동의"
                    required
                  />
                  <TermsRow
                    checked={form.agreePrivacy}
                    onChange={(v) => update("agreePrivacy", v)}
                    label="개인정보 수집·이용 동의"
                    required
                  />
                  <TermsRow
                    checked={form.agreeThirdParty}
                    onChange={(v) => update("agreeThirdParty", v)}
                    label="개인정보 제3자 제공 동의"
                    required
                  />
                  <p
                    className="t-caption pl-7"
                    style={{ color: "var(--ink-light)", marginTop: -2, marginBottom: 4 }}
                  >
                    제공받는 자: (주)토스페이먼츠(결제 처리), 배송 대행사(상품 배송).
                    자세한 항목·보유기간은{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                      개인정보 처리방침
                    </a>
                    을 참고해주세요.
                  </p>
                  <TermsRow
                    checked={form.agreeMarketing}
                    onChange={(v) => update("agreeMarketing", v)}
                    label="마케팅 정보 수신 동의"
                  />
                </div>
              </FormSection>
            </div>

            {/* 우: 요약 */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky" style={{ top: "calc(var(--header-area-h) + 16px)" }}>
                  {/* 결제 금액 */}
                  <div
                    className="p-5"
                    style={{
                      background: "var(--bg-white)",
                      border: "1px solid var(--ink)",
                      borderRadius: "var(--r-btn)",
                    }}
                  >
                    <p className="t-h3 mb-4" style={{ color: "var(--ink)" }}>결제 금액</p>
                    <dl className="flex flex-col gap-3 t-small">
                      <div className="flex justify-between">
                        <dt style={{ color: "var(--ink-light)" }}>상품 금액</dt>
                        <dd style={{ color: "var(--ink)" }}>{formatPrice(subtotal)}원</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt style={{ color: "var(--ink-light)" }}>배송비</dt>
                        <dd style={{ color: shippingFee === 0 ? "var(--primary)" : "var(--ink)" }}>
                          {shippingFee === 0 ? "무료" : `${formatPrice(shippingFee)}원`}
                        </dd>
                      </div>
                      {subtotal < FREE_SHIPPING_THRESHOLD && (
                        <p className="t-caption" style={{ color: "var(--ink-light)" }}>
                          {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}원 더 담으면 무료배송
                        </p>
                      )}
                    </dl>
                    <div className="my-4" style={{ borderTop: "1px solid var(--ink)" }} />
                    <div className="flex justify-between mb-5">
                      <span className="t-body" style={{ color: "var(--ink)" }}>합계</span>
                      <span className="t-h3" style={{ color: "var(--ink)" }}>{formatPrice(total)}원</span>
                    </div>
                    <DeliveryEstimate className="mb-4" />
                    <button
                      type="button"
                      disabled={!canSubmit || submitting}
                      onClick={handleSubmit}
                      className="btn btn-dark w-full btn-lg"
                    >
                      {submitting ? "처리 중..." : `${formatPrice(total)}원 결제하기`}
                    </button>
                    {!canSubmit && (
                      <p className="t-caption mt-3 text-center" style={{ color: "var(--ink-light)" }}>
                        필수 정보 입력과 약관 동의 후 진행할 수 있습니다
                      </p>
                    )}
                    {submitError && (
                      <p
                        className="t-caption mt-3 text-center"
                        style={{ color: "var(--alert-red)" }}
                      >
                        {submitError}
                      </p>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <style>{`
        .order-input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          font-size: 13px;
          color: var(--ink);
          background: var(--bg-white);
          border: 1px solid var(--neutral-stone);
          border-radius: var(--r-btn);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .order-input:focus {
          border-color: var(--ink);
        }
        .order-input::placeholder {
          color: var(--neutral-stone);
        }
        .order-input:disabled {
          background: var(--bg-off);
          color: var(--ink-light);
          cursor: not-allowed;
        }
        .order-input[readonly] {
          background: var(--bg-white);
          cursor: default;
        }
        .order-input[readonly]:disabled {
          background: var(--bg-off);
          color: var(--ink-light);
          cursor: not-allowed;
        }
        .order-input-readonly {
          background: var(--bg-off) !important;
          color: var(--ink-light);
          cursor: default;
        }
        .order-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236e5035' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}

/* ─── 보조 컴포넌트 ─── */

function FormSection({
  icon,
  title,
  headerRight,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <header
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <div className="flex items-center gap-2" style={{ color: "var(--ink)" }}>
          {icon}
          <h2 className="t-h3" style={{ color: "var(--ink)" }}>{title}</h2>
        </div>
        {headerRight}
      </header>
      <div className="px-5 py-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="t-small" style={{ color: "var(--ink)" }}>
        {label}
        {required && <span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>}
      </span>
      {children}
    </div>
  );
}

function StoreCheckBox({ checked, size = 18 }: { checked: boolean; size?: number }) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        border: "1px solid var(--ink)",
        borderRadius: 4,
        background: checked ? "var(--point)" : "var(--bg-white)",
        transition: "background 0.12s",
      }}
      aria-hidden
    >
      {checked && <Check size={size * 0.65} strokeWidth={2.5} style={{ color: "var(--ink)" }} />}
    </span>
  );
}

function TermsRow({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <StoreCheckBox checked={checked} />
      <span className="t-small" style={{ color: "var(--ink)" }}>
        {label}{" "}
        <span style={{ color: required ? "var(--alert-red)" : "var(--neutral-stone)" }}>
          ({required ? "필수" : "선택"})
        </span>
      </span>
    </label>
  );
}
