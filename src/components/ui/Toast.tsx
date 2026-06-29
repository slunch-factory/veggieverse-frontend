"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * 공용 토스트 — 화면별로 제각각이던 피드백(recipe Toast, subscribe Snackbar, raw alert)을
 * 단일 프로바이더로 통일한다. 어디서든 `useToast()`로 호출하고, 위치/모양/접근성은 한곳에서 보장.
 *
 * 책임: 단일 viewport(body portal, 하단 중앙 스택) / 자동·수동 닫기 / variant 색상 /
 *       prefers-reduced-motion 존중 전환 / aria-live(성공·정보=polite, 오류=assertive).
 */

export type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  /** 선택 제목(굵게). 없으면 message만. */
  title?: string;
  /** 선택 이모지 아이콘. */
  emoji?: string;
  /** 선택 부가 라인(예: 쿠폰 코드). */
  detail?: string;
  variant?: ToastVariant;
  /** 자동 닫기 ms. 0이면 수동 닫기 전까지 유지. 기본 success/info/default 3500, error 5000. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  variant: ToastVariant;
  duration: number;
}

export interface ToastApi {
  show: (opts: ToastOptions) => number;
  success: (message: string, opts?: Omit<ToastOptions, "message" | "variant">) => number;
  error: (message: string, opts?: Omit<ToastOptions, "message" | "variant">) => number;
  info: (message: string, opts?: Omit<ToastOptions, "message" | "variant">) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const MAX_VISIBLE = 4;
const DOT_COLOR: Record<ToastVariant, string> = {
  default: "var(--bg-white)",
  success: "var(--point)",
  error: "var(--alert-red)",
  info: "var(--neutral-blue)",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (opts: ToastOptions): number => {
      const id = ++idRef.current;
      const variant = opts.variant ?? "default";
      const duration = opts.duration ?? (variant === "error" ? 5000 : 3500);
      const item: ToastItem = { ...opts, id, variant, duration };
      setToasts((prev) => {
        const next = [...prev, item];
        // 너무 많이 쌓이면 가장 오래된 것부터 제거
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, opts) => show({ ...opts, message, variant: "success" }),
      error: (message, opts) => show({ ...opts, message, variant: "error" }),
      info: (message, opts) => show({ ...opts, message, variant: "info" }),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** 어디서든 토스트를 띄운다. ToastProvider 하위에서만 사용. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-6 z-[2000] flex flex-col items-center gap-2 px-4 pointer-events-none"
      role="region"
      aria-label="알림"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            role={t.variant === "error" ? "alert" : "status"}
            aria-live={t.variant === "error" ? "assertive" : "polite"}
            className="toast pointer-events-auto"
          >
            <span
              className="toast-dot"
              style={{ background: DOT_COLOR[t.variant] }}
              aria-hidden
            />
            {t.emoji && (
              <span className="text-[18px] leading-none shrink-0" aria-hidden>
                {t.emoji}
              </span>
            )}
            <span className="flex-1 leading-snug">
              {t.title && <strong className="block">{t.title}</strong>}
              <span className="block">{t.message}</span>
              {t.detail && <span className="block text-white/70 text-[12px] mt-0.5">{t.detail}</span>}
            </span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="알림 닫기"
              className="shrink-0 w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors ml-1"
            >
              <X size={15} strokeWidth={1.5} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
