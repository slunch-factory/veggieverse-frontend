"use client";

import { useState } from "react";
import { Hammer } from "lucide-react";

interface PreparingBannerProps {
  /** 오버레이 위에 띄울 보조 문구. 미지정 시 기본 안내 문구 사용. */
  message?: string;
  /**
   * true면 "그래도 둘러볼게요" 버튼을 노출 — 누르면 오버레이가 사라져 자유롭게 탐색 가능.
   * (구독 페이지처럼 미리보기 탐색은 허용하되 준비중임을 알리고 싶을 때)
   * false(기본)면 막이 클릭을 가로채 아래 콘텐츠 상호작용을 차단한다.
   */
  dismissible?: boolean;
}

/**
 * "준비중" 오버레이 — 페이지 콘텐츠 위에 연한 막을 깔고 가운데에 "준비중" 글씨를 띄운다.
 * 헤더 영역(--header-area-h) 아래 영역을 fixed로 덮어, 스크롤해도 글씨가 화면 가운데 고정된다.
 * 기본은 클릭을 막되(아래 콘텐츠 링크/버튼 비활성) touch-action:pan-y 로 세로 스크롤은 통과시킨다.
 * dismissible=true면 닫기 버튼으로 막을 걷어 자유 탐색을 허용한다.
 * 헤더(z-50)보다 낮은 z-30으로 두어 헤더는 덮지 않는다.
 */
export function PreparingBanner({
  message = "현재 준비 중인 페이지예요.\n표시된 내용은 미리보기이며 곧 정식 오픈됩니다.",
  dismissible = false,
}: PreparingBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-label="준비중"
      className="fixed left-0 right-0 bottom-0 z-30 flex items-center justify-center"
      style={{
        top: "var(--header-area-h)",
        // 콘텐츠가 비치도록 연하게 — 잉크색을 옅게 깔아 살짝 어둡게
        background: "color-mix(in srgb, var(--ink) 12%, transparent)",
        backdropFilter: "saturate(0.85)",
        // 클릭은 막되(이 막이 가로챔) 세로 스크롤은 그대로 통과
        touchAction: "pan-y",
      }}
    >
      <div
        className="flex flex-col items-center text-center gap-2 px-8 py-6"
        style={{
          background: "color-mix(in srgb, var(--point) 92%, transparent)",
          color: "var(--ink)",
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-card, 16px)",
          boxShadow: "0 8px 28px rgba(37, 10, 0, 0.18)",
        }}
      >
        <p className="flex items-center gap-2 text-[26px] md:text-[30px] font-bold leading-none">
          <Hammer size={26} className="shrink-0" />
          준비중
        </p>
        <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-line">
          {message}
        </p>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="mt-2 text-[14px] font-bold"
            style={{
              padding: "10px 20px",
              color: "var(--point)",
              background: "var(--ink)",
              borderRadius: "var(--r-btn)",
              cursor: "pointer",
            }}
          >
            그래도 둘러볼게요
          </button>
        )}
      </div>
    </div>
  );
}
