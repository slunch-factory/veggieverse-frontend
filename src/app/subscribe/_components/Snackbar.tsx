"use client";

import { useEffect } from "react";

interface SnackbarProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export function Snackbar({ message, onClose, duration = 3000 }: SnackbarProps) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [message, onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 transition-all duration-200 ${
        message
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-2 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-4 bg-black border border-black px-[18px] py-3 min-w-[320px] max-w-[560px]">
        <span className="text-[13px] text-white leading-snug flex-1">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-white/70 text-[16px] leading-none hover:text-white transition-colors"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}
