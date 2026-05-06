"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Check,
  User,
  MapPin,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import {
  getOrderSnapshot,
  getServerOrderSnapshot,
  subscribeOrderStore,
} from "../../_data/order";
import { getCustomedPlan, type CustomPlanResponse } from "@/lib/api/subscription";
import { getUserProfile } from "@/lib/api/user";
import {
  postPayment,
  FIXED_USER_ID,
  PAYMENT_RESULT_KEY,
} from "@/lib/api/payment";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";

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
  paymentMethod: "card" | "toss";
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
  sameAsCustomer: true,
  recipientName: "",
  recipientPhone: "",
  recipientPostalCode: "",
  recipientAddress: "",
  recipientAddressDetail: "",
  deliveryNote: "",
  paymentMethod: "card",
  agreeOrder: false,
  agreePrivacy: false,
  agreeThirdParty: false,
  agreeMarketing: false,
};

const PAYMENT_METHODS: { value: FormState["paymentMethod"]; label: string }[] = [
  { value: "card", label: "신용/체크카드" },
  { value: "toss", label: "토스 페이먼츠" },
];

const DELIVERY_NOTE_PRESETS = [
  "문 앞에 놓아주세요",
  "경비실에 맡겨주세요",
  "부재 시 연락주세요",
  "직접 전달해 주세요",
];

export function OrderClient() {
  const router = useRouter();
  const order = useSyncExternalStore(
    subscribeOrderStore,
    getOrderSnapshot,
    getServerOrderSnapshot,
  );
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [postcodeTarget, setPostcodeTarget] = useState<"recipient" | null>(null);
  const [deliveryNoteCustom, setDeliveryNoteCustom] = useState(false);
  const [confirmedPlan, setConfirmedPlan] = useState<CustomPlanResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order === null || Object.keys(order.mealPlan).length === 0) {
      router.replace("/subscribe");
    }
  }, [order, router]);

  useEffect(() => {
    const planId = sessionStorage.getItem("veggieverse-plan-id");
    if (!planId) return;
    getCustomedPlan(planId).then((plan) => {
      if (plan) setConfirmedPlan(plan);
    });
  }, []);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (!profile) return;
      setForm((prev) => ({
        ...prev,
        ...(profile.name && { customerName: profile.name }),
        ...(profile.phone && { customerPhone: profile.phone }),
        ...(profile.email && { customerEmail: profile.email }),
        ...(profile.postalCode && { customerPostalCode: profile.postalCode }),
        ...(profile.address && { customerAddress: profile.address }),
        ...(profile.addressDetail && { customerAddressDetail: profile.addressDetail }),
      }));
    });
  }, []);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    if (!order) return false;
    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !form.customerEmail.trim()
    ) return false;
    if (!form.sameAsCustomer) {
      if (
        !form.recipientName.trim() ||
        !form.recipientPhone.trim() ||
        !form.recipientPostalCode.trim() ||
        !form.recipientAddress.trim()
      ) return false;
    }
    return (
      form.agreeOrder &&
      form.agreePrivacy &&
      (order.purchaseType === "subscription" ? form.agreeThirdParty : true)
    );
  }, [form, order]);

  const handleSubmit = useCallback(async () => {
    if (!order || !canSubmit || submitting) return;
    setSubmitting(true);

    const planId = sessionStorage.getItem("veggieverse-plan-id") ?? "";

    const startD = new Date(order.startDateISO);
    const endD = new Date(startD);
    endD.setDate(startD.getDate() + order.duration * 7 - 1);
    const toDateStr = (d: Date) => d.toISOString().split("T")[0];

    const toStr = (v: unknown): string => (typeof v === "string" ? v : "");

    const rawAddr = form.sameAsCustomer
      ? { zipCode: form.customerPostalCode, street: form.customerAddress, detail: form.customerAddressDetail }
      : { zipCode: form.recipientPostalCode, street: form.recipientAddress, detail: form.recipientAddressDetail };

    const addr = {
      zipCode: toStr(rawAddr.zipCode),
      street: toStr(rawAddr.street),
      detail: toStr(rawAddr.detail),
    };

    const result = await postPayment({
      userId: FIXED_USER_ID,
      planId,
      subscriptionStartDate: toDateStr(startD),
      subscriptionEndDate: toDateStr(endD),
      deliveryCycle: "WEEKLY",
      deliveryAddress: addr,
    });

    setSubmitting(false);

    if (!result) {
      alert("결제 중 오류가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    sessionStorage.setItem(PAYMENT_RESULT_KEY, JSON.stringify(result));
    router.push("/subscribe/order/complete");
  }, [order, canSubmit, submitting, form, router]);

  if (!order) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ background: "var(--bg-pale)" }}
      >
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          주문 정보를 불러오는 중...
        </p>
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
            href="/subscribe"
            className="inline-flex items-center gap-1 t-small mb-6"
            style={{ color: "var(--ink-light)" }}
          >
            <ChevronLeft size={16} />
            구독 식단으로 돌아가기
          </Link>

          <h1 className="t-h2 mb-8" style={{ color: "var(--ink)" }}>주문·결제</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 좌: 폼 */}
            <div className="flex-1 flex flex-col gap-5">

              {/* 주문자 정보 */}
              <FormSection
                icon={<User size={16} strokeWidth={1.5} />}
                title="주문자 정보"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <FormField label="이름" required className="flex-1">
                    <input
                      value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      placeholder="홍길동"
                      className="order-input"
                    />
                  </FormField>
                  <FormField label="휴대전화" required className="flex-1">
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => update("customerPhone", e.target.value)}
                      placeholder="010-0000-0000"
                      className="order-input"
                    />
                  </FormField>
                </div>
                <FormField label="이메일" required>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => update("customerEmail", e.target.value)}
                    placeholder="order@example.com"
                    className="order-input"
                  />
                </FormField>
                <FormField label="주소">
                  <input
                    value={form.customerPostalCode}
                    readOnly
                    placeholder="우편번호"
                    className="order-input"
                    style={{ width: 120, flexShrink: 0 }}
                  />
                  <input
                    value={form.customerAddress}
                    readOnly
                    placeholder="기본 주소"
                    className="order-input mt-2"
                  />
                  <input
                    value={form.customerAddressDetail}
                    readOnly
                    placeholder="상세 주소 (동·호수)"
                    className="order-input mt-2"
                  />
                </FormField>
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
                      onChange={(e) => update("sameAsCustomer", e.target.checked)}
                      className="sr-only"
                    />
                    <StoreCheckBox checked={form.sameAsCustomer} size={15} />
                    <span className="t-caption" style={{ color: "var(--ink)" }}>
                      주문자 정보와 동일
                    </span>
                  </label>
                }
              >
                {!form.sameAsCustomer && (
                  <>
                    <div className="flex flex-col md:flex-row gap-4">
                      <FormField label="받으시는 분" required className="flex-1">
                        <input
                          value={form.recipientName}
                          onChange={(e) => update("recipientName", e.target.value)}
                          placeholder="받으시는 분 이름"
                          className="order-input"
                        />
                      </FormField>
                      <FormField label="휴대전화" required className="flex-1">
                        <input
                          type="tel"
                          value={form.recipientPhone}
                          onChange={(e) => update("recipientPhone", e.target.value)}
                          placeholder="010-0000-0000"
                          className="order-input"
                        />
                      </FormField>
                    </div>
                    <FormField label="주소" required>
                      <div className="flex gap-2">
                        <input
                          value={form.recipientPostalCode}
                          readOnly
                          placeholder="우편번호"
                          className="order-input"
                          style={{ width: 120, flexShrink: 0 }}
                        />
                        <button
                          type="button"
                          onClick={() => setPostcodeTarget("recipient")}
                          className="btn btn-ghost btn-sm flex-shrink-0"
                          style={{ border: "1px solid var(--neutral-stone)" }}
                        >
                          주소 검색
                        </button>
                      </div>
                      <input
                        value={form.recipientAddress}
                        readOnly
                        placeholder="기본 주소"
                        className="order-input mt-2"
                      />
                      <input
                        value={form.recipientAddressDetail}
                        onChange={(e) => update("recipientAddressDetail", e.target.value)}
                        placeholder="상세 주소 (동·호수)"
                        className="order-input mt-2"
                      />
                    </FormField>
                  </>
                )}
                <FormField label="배송 메세지">
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
                    <option value="">배송 메세지를 선택해 주세요</option>
                    {DELIVERY_NOTE_PRESETS.map((preset) => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                    <option value="기타">기타 (직접 입력)</option>
                  </select>
                  {deliveryNoteCustom && (
                    <input
                      value={form.deliveryNote}
                      onChange={(e) => update("deliveryNote", e.target.value)}
                      placeholder="배송 메세지를 입력해 주세요"
                      className="order-input mt-2"
                    />
                  )}
                </FormField>
              </FormSection>

              {/* 결제 수단 */}
              <FormSection
                icon={<CreditCard size={16} strokeWidth={1.5} />}
                title="결제 수단"
              >
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((opt) => {
                    const active = form.paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("paymentMethod", opt.value)}
                        aria-pressed={active}
                        className="t-small transition-colors cursor-pointer"
                        style={{
                          height: 48,
                          border: `1px solid ${active ? "var(--ink)" : "var(--neutral-stone)"}`,
                          borderRadius: "var(--r-btn)",
                          background: active ? "var(--point)" : "var(--bg-white)",
                          color: "var(--ink)",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
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
                    required={order.purchaseType === "subscription"}
                  />
                  <TermsRow
                    checked={form.agreeMarketing}
                    onChange={(v) => update("agreeMarketing", v)}
                    label="마케팅 정보 수신 동의"
                  />
                </div>
              </FormSection>
            </div>

            {/* 우: 요약 */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky" style={{ top: "calc(var(--header-area-h) + 16px)" }}>
                <OrderSummaryCard
                  order={order}
                  canSubmit={canSubmit && !submitting}
                  onSubmit={handleSubmit}
                  confirmedPlan={confirmedPlan}
                  submitting={submitting}
                />
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
