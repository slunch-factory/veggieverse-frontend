"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

export interface ToastProps {
  id: string;
  type: "badge" | "coupon" | "success" | "info";
  title: string;
  message: string;
  badgeEmoji?: string;
  couponCode?: string;
  onClose: (id: string) => void;
  duration?: number;
}

function Toast({ id, title, message, badgeEmoji, couponCode, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className="bg-white border border-black rounded-lg p-4 min-w-[300px] max-w-[380px] animate-[slideInRight_0.3s_ease-out]">
      <div className="flex items-start gap-3">
        {badgeEmoji && <span className="text-[28px] shrink-0">{badgeEmoji}</span>}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[14px] text-black">{title}</h4>
            <button onClick={() => onClose(id)} className="w-6 h-6 flex items-center justify-center" aria-label="닫기">
              <X size={16} strokeWidth={1} />
            </button>
          </div>
          <p className="text-[13px] text-[#666] mb-1">{message}</p>
          {couponCode && (
            <p className="text-[12px] text-[#888] mt-2">
              쿠폰 코드: <span className="text-black">{couponCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </>
  );
}

/* ─── 토스트 유틸 훅 ─── */
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

