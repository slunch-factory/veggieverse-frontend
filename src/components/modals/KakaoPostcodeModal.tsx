"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface KakaoPostcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: { postalCode: string; address: string }) => void;
}

const SCRIPT_SRC = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadDaumScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.daum?.Postcode === "function") {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function KakaoPostcodeModal({ isOpen, onClose, onSelect }: KakaoPostcodeModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const el = containerRef.current;
    el.innerHTML = "";

    loadDaumScript().then(() => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address = data.roadAddress || data.jibunAddress;
          onSelectRef.current({ postalCode: data.zonecode, address });
          onCloseRef.current();
        },
        width: "100%",
        height: "100%",
      }).embed(el);
    });
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  // <main>(z-0 스태킹 컨텍스트)에 갇혀 헤더/푸터 위로 못 덮는 문제 방지 — body로 portal.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-white border border-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-black">
          <span className="text-[14px] text-black">주소 검색</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="bg-transparent border-none cursor-pointer p-0 flex items-center"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div ref={containerRef} style={{ width: "100%", height: "460px" }} />
      </div>
    </div>,
    document.body,
  );
}
