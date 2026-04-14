"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";

type ModalType = "GRADE" | "COUPON" | "POINT" | null;

interface ProfileStatsProps {
  grade?: string;
  couponCount?: number;
  points?: number;
}

export function ProfileStats({
  grade = "FRESH",
  couponCount = 2,
  points = 1500,
}: ProfileStatsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      {/* Stats Bar */}
      <section className="grid grid-cols-3 border-t border-b border-black mb-8">
        {(
          [
            { key: "GRADE" as const, label: "회원등급", value: grade },
            { key: "COUPON" as const, label: "보유쿠폰", value: `${couponCount}장` },
            { key: "POINT" as const, label: "포인트", value: `${points.toLocaleString()}P` },
          ] as const
        ).map((item, idx) => (
          <button
            key={item.key}
            onClick={() => setActiveModal(item.key)}
            className={`flex flex-col items-center justify-center gap-1 px-5 py-4 bg-transparent border-none cursor-pointer ${
              idx < 2 ? "border-r border-[#E5E5E5]" : ""
            }`}
          >
            <span className="text-[12px] text-[#6B6B6B]">{item.label}</span>
            <span className="text-[16px] text-black">{item.value}</span>
          </button>
        ))}
      </section>

      {/* Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-[400px] border border-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black">
              <h3 className="text-[15px] text-black">
                {activeModal === "GRADE" && "멤버십 등급"}
                {activeModal === "COUPON" && "나의 쿠폰함"}
                {activeModal === "POINT" && "포인트 내역"}
              </h3>
              <button onClick={closeModal} className="p-1 bg-transparent border-none cursor-pointer">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {/* Grade */}
              {activeModal === "GRADE" && (
                <div>
                  <div className="text-center mb-5">
                    <p className="text-[12px] text-[#6B6B6B] mb-1">현재 등급</p>
                    <h2 className="text-[24px] text-black">{grade}</h2>
                  </div>
                  <div className="bg-[#E5E5E5] h-1 mb-2">
                    <div className="bg-black h-1 w-[30%]" />
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] text-center mb-6">
                    다음 <span className="text-black">GREEN</span> 등급까지 70,000원 남았어요!
                  </p>
                  <div className="bg-[#F9F9F9] p-4">
                    <h4 className="text-[13px] text-black mb-3">{grade} 등급 혜택</h4>
                    <ul className="text-[12px] text-[#6B6B6B] pl-4 m-0 space-y-1.5">
                      <li>구매 금액의 1% 포인트 적립</li>
                      <li>생일 축하 5,000원 쿠폰 지급</li>
                      <li>신규 레시피 등록 시 추가 포인트</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Coupon */}
              {activeModal === "COUPON" && (
                <div>
                  <div className="flex gap-2 mb-5">
                    <input
                      type="text"
                      placeholder="쿠폰 번호를 입력하세요"
                      className="flex-1 px-3 py-2.5 text-[13px] border border-[#E5E5E5] border-b-black outline-none"
                    />
                    <button className="px-4 py-2.5 text-[13px] bg-black text-white border border-black cursor-pointer">
                      등록
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: "신규 회원 환영 쿠폰", discount: "10%", date: "2026.02.01 까지" },
                      { name: "배송비 무료 쿠폰", discount: "Free", date: "2026.01.15 까지" },
                    ].map((coupon, idx) => (
                      <div key={idx} className="border border-[#E5E5E5] p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-[13px] text-black mb-1">{coupon.name}</h4>
                          <p className="text-[11px] text-[#6B6B6B]">{coupon.date}</p>
                        </div>
                        <span className="text-[18px] text-black">{coupon.discount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Point */}
              {activeModal === "POINT" && (
                <div>
                  <div className="flex justify-between items-end border-b border-black pb-4 mb-4">
                    <span className="text-[12px] text-[#6B6B6B]">사용 가능 포인트</span>
                    <span className="text-[20px] text-black">{points.toLocaleString()}P</span>
                  </div>
                  <ul className="list-none p-0 m-0">
                    {[
                      { title: "첫 레시피 등록", date: "2026.01.02", amount: "+500", type: "earn" },
                      { title: "상품 구매 (김치볶음밥)", date: "2024.12.10", amount: "+1,000", type: "earn" },
                      { title: "포인트 사용", date: "2024.11.20", amount: "-2,000", type: "use" },
                    ].map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center py-3 border-b border-[#E5E5E5]">
                        <div>
                          <p className="text-[13px] text-black mb-0.5">{item.title}</p>
                          <p className="text-[11px] text-[#6B6B6B]">{item.date}</p>
                        </div>
                        <span className={`text-[14px] ${item.type === "use" ? "text-[#E53935]" : "text-[#1565C0]"}`}>
                          {item.amount}P
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#F9F9F9] px-5 py-3 flex justify-end">
              <button className="text-[11px] text-[#6B6B6B] bg-transparent border-none cursor-pointer flex items-center gap-0.5">
                자세히 보기 <ChevronRight size={12} strokeWidth={1} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
