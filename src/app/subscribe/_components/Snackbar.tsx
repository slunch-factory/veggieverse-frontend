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
      className={`fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 transition-all duration-300 ${
        message ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-4 bg-[#1a1a1a] px-5 py-3.5 shadow-xl min-w-[280px] max-w-[480px]">
        <span className="text-[13px] text-white leading-snug flex-1">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-[12px] text-[#dcfd4a] tracking-wide hover:underline"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
