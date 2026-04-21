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
import { OrderSummaryCard } from "./OrderSummaryCard";

interface FormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  sameAsCustomer: boolean;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  deliveryNote: string;
  entryPassword: string;
  paymentMethod: "card" | "kakaopay" | "naverpay" | "bank";
  agreeOrder: boolean;
  agreePrivacy: boolean;
  agreeThirdParty: boolean;
  agreeMarketing: boolean;
}

const INITIAL_FORM: FormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  sameAsCustomer: true,
  recipientName: "",
  recipientPhone: "",
  postalCode: "",
  address: "",
  addressDetail: "",
  deliveryNote: "",
  entryPassword: "",
  paymentMethod: "card",
  agreeOrder: false,
  agreePrivacy: false,
  agreeThirdParty: false,
  agreeMarketing: false,
};

const PAYMENT_METHODS: { value: FormState["paymentMethod"]; label: string }[] = [
  { value: "card", label: "신용/체크카드" },
  { value: "kakaopay", label: "카카오페이" },
  { value: "naverpay", label: "네이버페이" },
  { value: "bank", label: "계좌이체" },
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

  useEffect(() => {
    if (order === null || Object.keys(order.mealPlan).length === 0) {
      router.replace("/subscribe");
    }
  }, [order, router]);

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

  /** 필수 값 검증 */
  const canSubmit = useMemo(() => {
    if (!order) return false;
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.customerEmail.trim())
      return false;
    if (!form.sameAsCustomer) {
      if (!form.recipientName.trim() || !form.recipientPhone.trim()) return false;
    }
    if (!form.postalCode.trim() || !form.address.trim()) return false;
    const requiredTerms =
      form.agreeOrder &&
      form.agreePrivacy &&
      (order.purchaseType === "subscription" ? form.agreeThirdParty : true);
    return requiredTerms;
  }, [form, order]);

  const handleSubmit = useCallback(() => {
    if (!order || !canSubmit) return;
    const label = order.purchaseType === "subscription" ? "정기배송 신청" : "주문";
    alert(`${label}이 완료되었습니다.\n입력하신 정보로 곧 연락드릴게요.`);
    clearOrder();
    router.push("/");
  }, [order, canSubmit, router]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[13px] text-gray-400">
        주문 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 lg:pb-8">
      <div className="max-w-[1280px] mx-auto lg:px-6 lg:pt-6">
        {/* Top header */}
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
                <FormField label="연락처" required>
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
            </FormSection>

            {/* 배송지 */}
            <FormSection title="배송지">
              <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
                <input
                  type="checkbox"
                  checked={form.sameAsCustomer}
                  onChange={(e) => update("sameAsCustomer", e.target.checked)}
                  className="sr-only"
                />
                <CheckBox checked={form.sameAsCustomer} />
                <span className="text-[13px] text-black">주문자 정보와 동일</span>
              </label>
              {!form.sameAsCustomer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <FormField label="받는 분" required>
                    <TextInput
                      value={form.recipientName}
                      onChange={(v) => update("recipientName", v)}
                      placeholder="받는 사람 이름"
                    />
                  </FormField>
                  <FormField label="연락처" required>
                    <TextInput
                      type="tel"
                      value={form.recipientPhone}
                      onChange={(v) => update("recipientPhone", v)}
                      placeholder="010-0000-0000"
                    />
                  </FormField>
                </div>
              )}
              <FormField label="주소" required>
                <div className="flex gap-2">
                  <TextInput
                    value={form.postalCode}
                    onChange={(v) => update("postalCode", v)}
                    placeholder="우편번호"
                    className="w-[120px]"
                  />
                  <button
                    type="button"
                    onClick={() => alert("주소 검색은 추후 연동 예정입니다.")}
                    className="h-10 px-3 text-[12px] border border-black bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    주소 검색
                  </button>
                </div>
              </FormField>
              <TextInput
                value={form.address}
                onChange={(v) => update("address", v)}
                placeholder="기본 주소"
              />
              <TextInput
                value={form.addressDetail}
                onChange={(v) => update("addressDetail", v)}
                placeholder="상세 주소 (동/호수)"
              />
              <FormField label="배송 요청사항">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DELIVERY_NOTE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => update("deliveryNote", preset)}
                      className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                        form.deliveryNote === preset
                          ? "border-[#8C451D] bg-[#FDEEE8] text-[#8C451D]"
                          : "border-gray-300 bg-white text-gray-700 hover:border-black"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <TextInput
                  value={form.deliveryNote}
                  onChange={(v) => update("deliveryNote", v)}
                  placeholder="직접 입력"
                />
              </FormField>
              <FormField label="공동현관 출입 (선택)">
                <TextInput
                  value={form.entryPassword}
                  onChange={(v) => update("entryPassword", v)}
                  placeholder="예: #1234, 자유출입"
                />
              </FormField>
            </FormSection>

            {/* 결제 수단 */}
            <FormSection title="결제 수단">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

          {/* 우: 요약 */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <OrderSummaryCard order={order} canSubmit={canSubmit} onSubmit={handleSubmit} />
            </div>
          </div>

          {/* 모바일: 요약 카드 하단에 */}
          <div className="lg:hidden px-4 pt-4">
            <OrderSummaryCard order={order} canSubmit={canSubmit} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-10 px-3 border border-gray-300 text-[14px] bg-white focus:border-black focus:outline-none ${className}`}
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
