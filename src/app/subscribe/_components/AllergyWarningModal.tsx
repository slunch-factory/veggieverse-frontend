"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface AllergyWarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AllergyWarningModal({ open, onClose, onConfirm }: AllergyWarningModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      labelledBy="allergy-modal-title"
      zIndex={900}
      className="relative w-full max-w-[420px] bg-white flex flex-col mx-4"
      style={{ border: "1px solid var(--ink)", borderRadius: "2px" }}
    >
      {/* 닫기 버튼 (우측 상단) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors hover:bg-[var(--bg-off)] rounded-sm"
        style={{ color: "var(--ink)" }}
      >
        <X size={18} strokeWidth={1.5} />
      </button>

      {/* 본문 */}
      <div className="px-8 pt-10 pb-8 flex flex-col gap-4">
        {/* 아이콘 */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]"
          style={{ background: "var(--neutral-yellow)" }}
          aria-hidden
        >
          ⚠️
        </div>

        <div className="flex flex-col gap-2">
          <h2
            id="allergy-modal-title"
            className="text-[17px] leading-snug tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            알러지 정보를 확인해주세요
          </h2>
          <p
            className="text-[14px] leading-[1.75]"
            style={{ color: "var(--ink-light)" }}
          >
            추천 식단에서 메뉴를 변경하셨군요.{" "}
            <strong style={{ color: "var(--ink)" }}>새로 추가한 메뉴 중에 내 알러지 정보가 포함된 메뉴가 있을 수 있어요.</strong>
          </p>
          <p
            className="text-[14px] leading-[1.75]"
            style={{ color: "var(--ink-light)" }}
          >
            결제 전에 식단 구성을 한 번 더 확인하시거나, 이대로 진행하셔도 됩니다.
          </p>
        </div>
      </div>

      {/* 하단 버튼 (중앙) */}
      <div className="px-8 pb-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3 text-[15px] tracking-tight transition-colors"
          style={{
            background: "var(--ink)",
            color: "var(--point)",
            border: "1px solid var(--ink)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--ink-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--ink)";
          }}
        >
          결제 계속 진행하기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-[13px] transition-colors"
          style={{ color: "var(--ink-light)" }}
        >
          돌아가서 식단 확인하기
        </button>
      </div>
    </Modal>
  );
}
