"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import {
  clearOrder,
  getOrderSnapshot,
  getServerOrderSnapshot,
  subscribeOrderStore,
} from "../../_data/order";
import { getCustomedPlan, type CustomPlanResponse } from "@/lib/api/subscription";
import { getUserProfile } from "@/lib/api/user";
import {
  postPayment,
  mapDeliveryCycle,
  FIXED_USER_ID,
  PAYMENT_RESULT_KEY,
} from "@/lib/api/payment";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";

interface FormState {
  // 주문자 정보
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerPostalCode: string;
  customerAddress: string;
  customerAddressDetail: string;
  // 배송지
  sameAsCustomer: boolean;
  recipientName: string;
  recipientPhone: string;
  recipientPostalCode: string;
  recipientAddress: string;
  recipientAddressDetail: string;
  // 배송 메세지
  deliveryNote: string;
  // 결제
  paymentMethod: "card" | "toss";
  // 약관
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
    if (!order || !canSubmit) return;

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

    const deliveryCycle = "WEEKLY";

    const result = await postPayment({
      userId: FIXED_USER_ID,
      planId,
      subscriptionStartDate: toDateStr(startD),
      subscriptionEndDate: toDateStr(endD),
      deliveryCycle,
      deliveryAddress: addr,
    });

    if (!result) {
      alert("결제 중 오류가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    sessionStorage.setItem(PAYMENT_RESULT_KEY, JSON.stringify(result));
    router.push("/subscribe/order/complete");
  }, [order, canSubmit, form, router]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[13px] text-gray-400">
        주문 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <>
      <KakaoPostcodeModal
        isOpen={postcodeTarget !== null}
        onClose={() => setPostcodeTarget(null)}
        onSelect={({ postalCode, address }) => {
          update("recipientPostalCode", postalCode);
          update("recipientAddress", address);
          update("recipientAddressDetail", "");
        }}
      />

      <div className="bg-white min-h-screen pb-24 lg:pb-8">
        <div className="max-w-[1280px] mx-auto lg:px-6 lg:pt-6">
          {/* 헤더 */}
          <header className="flex items-center px-5 py-4 lg:px-6 lg:py-0 lg:mb-5 bg-white lg:bg-transparent border-b border-black lg:border-b-0">
            <button
              type="button"
              onClick={() => router.push("/subscribe")}
              className="inline-flex items-center gap-1.5 bg-transparent text-gray-600 hover:text-black cursor-pointer text-[12px] lg:text-[13px] leading-normal"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>구독 식단으로 돌아가기</span>
            </button>
          </header>

          <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-6">
            {/* 좌: 폼 */}
            <div className="flex flex-col">

              {/* 주문자 정보 */}
              <FormSection title="주문자 정보">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="이름" required>
                    <TextInput
                      value={form.customerName}
                      onChange={(v) => update("customerName", v)}
                      placeholder="홍길동"
                    />
                  </FormField>
                  <FormField label="휴대전화" required>
                    <TextInput
                      type="tel"
                      value={form.customerPhone}
                      onChange={(v) => update("customerPhone", v)}
                      placeholder="010-0000-0000"
                    />
                  </FormField>
                </div>
                <FormField label="이메일" required>
                  <TextInput
                    type="email"
                    value={form.customerEmail}
                    onChange={(v) => update("customerEmail", v)}
                    placeholder="order@example.com"
                  />
                </FormField>
                <FormField label="주소">
                  <div className="flex gap-2">
                    <TextInput
                      value={form.customerPostalCode}
                      onChange={() => {}}
                      placeholder="우편번호"
                      className="w-[120px]"
                      readOnly
                    />
                  </div>
                  <TextInput
                    value={form.customerAddress}
                    onChange={() => {}}
                    placeholder="기본 주소"
                    readOnly
                  />
                  <TextInput
                    value={form.customerAddressDetail}
                    onChange={() => {}}
                    placeholder="상세 주소 (동/호수)"
                    readOnly
                  />
                </FormField>
              </FormSection>

              {/* 배송지 */}
              <FormSection title="배송지">
                {/* 탭 버튼 */}
                <div className="flex border border-black overflow-hidden mb-1">
                  {(
                    [
                      { value: true, label: "주문자 정보와 동일" },
                      { value: false, label: "새로운 배송지" },
                    ] as const
                  ).map(({ value, label }, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => update("sameAsCustomer", value)}
                      className={`flex-1 h-10 text-[13px] cursor-pointer transition-colors select-none ${
                        idx === 0 ? "" : "border-l border-black"
                      } ${
                        form.sameAsCustomer === value
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 새로운 배송지 선택 시에만 필드 노출 */}
                {!form.sameAsCustomer && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField label="받으시는 분" required>
                        <TextInput
                          value={form.recipientName}
                          onChange={(v) => update("recipientName", v)}
                          placeholder="받으시는 분 이름"
                        />
                      </FormField>
                      <FormField label="휴대전화" required>
                        <TextInput
                          type="tel"
                          value={form.recipientPhone}
                          onChange={(v) => update("recipientPhone", v)}
                          placeholder="010-0000-0000"
                        />
                      </FormField>
                    </div>

                    <FormField label="주소" required>
                      <div className="flex gap-2">
                        <TextInput
                          value={form.recipientPostalCode}
                          onChange={() => {}}
                          placeholder="우편번호"
                          className="w-[120px]"
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={() => setPostcodeTarget("recipient")}
                          className="h-10 px-3 text-[12px] border border-black bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          주소 검색
                        </button>
                      </div>
                      <TextInput
                        value={form.recipientAddress}
                        onChange={() => {}}
                        placeholder="기본 주소"
                        readOnly
                      />
                      <TextInput
                        value={form.recipientAddressDetail}
                        onChange={(v) => update("recipientAddressDetail", v)}
                        placeholder="상세 주소 (동/호수)"
                      />
                    </FormField>

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
                        className="h-10 px-3 border border-gray-300 text-[14px] bg-white focus:border-black focus:outline-none w-full cursor-pointer"
                      >
                        <option value="">배송 메세지를 선택해 주세요</option>
                        {DELIVERY_NOTE_PRESETS.map((preset) => (
                          <option key={preset} value={preset}>{preset}</option>
                        ))}
                        <option value="기타">기타 (직접 입력)</option>
                      </select>
                      {deliveryNoteCustom && (
                        <TextInput
                          value={form.deliveryNote}
                          onChange={(v) => update("deliveryNote", v)}
                          placeholder="배송 메세지를 입력해 주세요"
                          className="mt-2"
                        />
                      )}
                    </FormField>
                  </div>
                )}
              </FormSection>

              {/* 결제 수단 */}
              <FormSection title="결제 수단">
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((opt) => {
                    const active = form.paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("paymentMethod", opt.value)}
                        aria-pressed={active}
                        className={`h-12 text-[13px] border transition-colors cursor-pointer ${
                          active
                            ? "border-[#8C451D] bg-[#FDEEE8] text-[#8C451D]"
                            : "border-gray-300 bg-white text-gray-700 hover:border-black"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </FormSection>

              {/* 약관 */}
              <FormSection title="이용약관 동의">
                <label className="flex items-center gap-2 cursor-pointer select-none pb-2 border-b border-gray-200 mb-2">
                  <input
                    type="checkbox"
                    checked={allTermsChecked}
                    onChange={(e) => toggleAllTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <CheckBox checked={allTermsChecked} />
                  <span className="text-[14px] text-black">전체 동의</span>
                </label>
                <TermsRow
                  checked={form.agreeOrder}
                  onChange={(v) => update("agreeOrder", v)}
                  label="주문 상품 정보 확인"
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
              </FormSection>
            </div>

            {/* 우: 요약 (데스크탑) */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <OrderSummaryCard order={order} canSubmit={canSubmit} onSubmit={handleSubmit} confirmedPlan={confirmedPlan} />
              </div>
            </div>

            {/* 모바일: 요약 카드 하단 */}
            <div className="lg:hidden px-4 pt-4">
              <OrderSummaryCard order={order} canSubmit={canSubmit} onSubmit={handleSubmit} confirmedPlan={confirmedPlan} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── 보조 컴포넌트들 ─── */

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border-b border-black lg:border lg:border-black lg:mb-4">
      <header className="px-5 lg:px-6 pt-5 pb-4 border-b border-black">
        <h2 className="text-[16px] lg:text-[18px] leading-normal tracking-tight text-black">
          {title}
        </h2>
      </header>
      <div className="px-5 lg:px-6 py-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] text-gray-500">
        {label}
        {required && <span className="ml-1 text-[#E57373]">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  readOnly = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      className={`h-10 px-3 border border-gray-300 text-[14px] bg-white focus:border-black focus:outline-none
        ${readOnly ? "bg-gray-50 cursor-default" : ""}
        ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}
        ${className}`}
    />
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex w-4 h-4 items-center justify-center border ${
        checked ? "bg-[#8C451D] border-[#8C451D]" : "bg-white border-gray-300"
      }`}
      aria-hidden
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
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
    <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <CheckBox checked={checked} />
      <span className="text-[13px] text-gray-700">
        {label}{" "}
        <span className={required ? "text-[#E57373]" : "text-gray-400"}>
          ({required ? "필수" : "선택"})
        </span>
      </span>
    </label>
  );
}
