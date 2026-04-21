"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DELIVERY_CYCLE_OPTIONS,
  PACK_COMPOSITION_OPTIONS,
  SUBSCRIPTION_DISCOUNT_RATE,
  type DeliveryCycle,
  type PackComposition,
  type PurchaseType,
  formatPrice,
} from "../_data/subscription";

interface CheckoutBarProps {
  purchaseType: PurchaseType;
  deliveryCycle: DeliveryCycle | "";
  packComposition: PackComposition | "";
  totalPrice: number;
  filledSlots: number;
  totalSlots: number;
  onChangePurchaseType: (t: PurchaseType) => void;
  onChangeDeliveryCycle: (c: DeliveryCycle | "") => void;
  onChangePackComposition: (p: PackComposition | "") => void;
  onSubmit: () => void;
}

export function CheckoutBar({
  purchaseType,
  deliveryCycle,
  packComposition,
  totalPrice,
  filledSlots,
  totalSlots,
  onChangePurchaseType,
  onChangeDeliveryCycle,
  onChangePackComposition,
  onSubmit,
}: CheckoutBarProps) {
  const [optionsOpen, setOptionsOpen] = useState(true);

  const subscriptionReady =
    purchaseType === "subscription" ? deliveryCycle !== "" && packComposition !== "" : true;
  const disabled = filledSlots === 0 || !subscriptionReady;

  let label: string;
  if (filledSlots === 0) label = "식단을 먼저 구성해주세요";
  else if (purchaseType === "subscription" && !subscriptionReady) label = "정기배송 옵션을 선택해주세요";
  else if (purchaseType === "subscription") label = "정기배송 신청하기";
  else if (filledSlots === totalSlots) label = "결제하기";
  else label = "구독 시작";

  const finalPrice =
    purchaseType === "subscription"
      ? Math.round(totalPrice * (1 - SUBSCRIPTION_DISCOUNT_RATE))
      : totalPrice;

  const handleCheckout = () => {
    if (disabled) return;
    onSubmit();
  };

  return (
    <section
      className="relative flex shrink-0 flex-col overflow-hidden bg-white"
      aria-label="구매 옵션 및 결제"
    >
      {/* 옵션 토글 바 */}
      <button
        type="button"
        onClick={() => setOptionsOpen((v) => !v)}
        aria-expanded={optionsOpen}
        aria-label={optionsOpen ? "구매 옵션 접기" : "구매 옵션 펼치기"}
        className="shrink-0 flex items-center justify-center gap-1 py-1.5 border-t border-black bg-white text-[11px] text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        {optionsOpen ? (
          <>
            <span>구매 옵션 접기</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <span>구매 옵션 펼치기</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* 옵션 영역 */}
      {optionsOpen && (
      <div className="shrink-0 bg-white">
        <div className="px-4 py-4 flex flex-col gap-3">
          <OptionRow label="배송비">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-black">조건부 무료</span>
              <span className="inline-flex items-center px-1.5 py-0.5 border border-[#7C8BBF] text-[#7C8BBF] text-[10px]">
                배송비할인
              </span>
            </div>
          </OptionRow>

          <OptionRow label="구매방법" align="start">
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <RadioOption
                  name="purchaseType"
                  checked={purchaseType === "once"}
                  onChange={() => {
                    onChangePurchaseType("once");
                    onChangeDeliveryCycle("");
                    onChangePackComposition("");
                  }}
                  label="1회구매"
                />
                <RadioOption
                  name="purchaseType"
                  checked={purchaseType === "subscription"}
                  onChange={() => onChangePurchaseType("subscription")}
                  label="정기배송"
                />
              </div>
              {purchaseType === "subscription" && (
                <SelectOption
                  value={deliveryCycle}
                  onChange={(v) => onChangeDeliveryCycle(v as DeliveryCycle | "")}
                  placeholder="[필수] 배송주기를 선택해 주세요."
                  options={DELIVERY_CYCLE_OPTIONS}
                />
              )}
            </div>
          </OptionRow>

          {purchaseType === "subscription" && (
            <OptionRow label="배송주기" align="start">
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-black">정기배송 할인</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 border border-[#E57373] text-[#E57373] text-[10px]">
                    save
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">
                  1회 결제 시 :{" "}
                  <span className="text-[#E57373]">
                    {Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100)}%(
                    {formatPrice(Math.round(totalPrice * SUBSCRIPTION_DISCOUNT_RATE))}) ↓
                  </span>
                </div>
                <div className="text-[11px] text-gray-600">
                  3회 결제 시 :{" "}
                  <span className="text-[#E57373]">
                    {Math.round(SUBSCRIPTION_DISCOUNT_RATE * 2 * 100)}%(
                    {formatPrice(Math.round(totalPrice * SUBSCRIPTION_DISCOUNT_RATE * 2))}) ↓
                  </span>
                </div>
              </div>
            </OptionRow>
          )}

          {purchaseType === "subscription" && (
            <OptionRow label="상품구성">
              <div className="flex-1 min-w-0">
                <SelectOption
                  value={packComposition}
                  onChange={(v) => onChangePackComposition(v as PackComposition | "")}
                  placeholder="- [필수] 옵션을 선택해 주세요 -"
                  options={PACK_COMPOSITION_OPTIONS}
                />
              </div>
            </OptionRow>
          )}
        </div>
      </div>
      )}

      {/* 가격 + 결제 */}
      <div className="flex shrink-0 items-center gap-3 border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {totalPrice > 0 && purchaseType === "once" && (
            <span className="inline-flex w-fit items-center gap-0.5 px-2 py-0.5 bg-[#E6F0FB] text-[#4A8CCB] text-[10px] rounded-full whitespace-nowrap">
              정기배송 시 최대 {Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100)}%(
              {formatPrice(Math.round(totalPrice * SUBSCRIPTION_DISCOUNT_RATE))}) ↓
            </span>
          )}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className="text-[20px] leading-tight tracking-tight">{formatPrice(finalPrice)}</p>
            {totalPrice > 0 && purchaseType === "subscription" && (
              <>
                <span className="text-[11px] text-gray-400 line-through">{formatPrice(totalPrice)}</span>
                <span className="text-[10px] text-red-500">
                  {Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100)}%
                </span>
              </>
            )}
          </div>
        </div>
        {filledSlots > 0 && purchaseType === "once" && (
          <button className="flex h-10 shrink-0 items-center justify-center gap-0.5 bg-[#03C75A] px-3 text-[13px] text-white transition-colors hover:bg-[#02b351]">
            <span>N</span>Pay
          </button>
        )}
        <button
          disabled={disabled}
          onClick={handleCheckout}
          className={`h-10 shrink-0 px-4 text-[13px] transition-all ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-300"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {label}
        </button>
      </div>
    </section>
  );
}

/* ─ internals ─ */

function OptionRow({
  label,
  align = "center",
  children,
}: {
  label: string;
  align?: "center" | "start";
  children: React.ReactNode;
}) {
  return (
    <div className={`flex gap-3 ${align === "start" ? "items-start" : "items-center"}`}>
      <span
        className={`w-16 shrink-0 text-[11px] text-gray-500 ${align === "start" ? "pt-0.5" : ""}`}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function RadioOption({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`inline-flex w-4 h-4 items-center justify-center rounded-full border-[1.5px] transition-colors ${
          checked ? "border-[#8C451D]" : "border-gray-400"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#8C451D]" />}
      </span>
      <span className={`text-[12px] ${checked ? "text-black" : "text-gray-700"}`}>{label}</span>
    </label>
  );
}

function SelectOption<T extends string>({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: T | "";
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-300 pl-3 pr-9 py-2.5 text-[12px] cursor-pointer"
        style={{ color: value ? "#000" : "#888", borderRadius: 0 }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
    </div>
  );
}
