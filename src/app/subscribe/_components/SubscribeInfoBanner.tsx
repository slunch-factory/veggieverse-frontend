"use client";

import { Info, X } from "lucide-react";

/**
 * 구독 플래너 상단 안내 배너.
 * - 이 서비스가 무엇인지(재료·취향 기반 메뉴 추천) 한 줄 설명
 * - 표시되는 영양성분 일부가 추정값이라 실제와 다를 수 있다는 고지
 * 높이는 SubscribeClient가 측정해 SubscribeShell 높이(--subscribe-banner-h)에서 빼준다.
 */
export function SubscribeInfoBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full bg-[#250a00] text-white">
      <div className="relative mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-12 py-2.5 text-center">
        <Info size={15} strokeWidth={2} className="shrink-0 text-[#dcfd4a]" aria-hidden />
        <p className="text-[12px] leading-[1.5] md:text-[13px]">
          <span className="font-bold text-[#dcfd4a]">끌리는 재료로 나에게 어울리는 한 끼를 추천</span>해 드리는 슬런치 구독 서비스예요.{" "}
          <span className="text-white/70">
            표시되는 영양성분 중 일부는 추정값이라 실제와 다를 수 있어요.
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="안내 닫기"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-white/60 transition-colors hover:text-white"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
