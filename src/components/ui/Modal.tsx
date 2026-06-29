"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { lockBodyScroll } from "./scrollLock";

export type ModalPosition =
  | "center"
  | "sheet-bottom"
  | "drawer-right"
  | "drawer-left";

export interface ModalProps {
  /** 열림 여부 — 닫힐 때 종료 애니메이션 후 언마운트된다. */
  isOpen: boolean;
  /** Esc · 배경 클릭 · 닫기 의도가 발생했을 때 호출. */
  onClose: () => void;
  children: ReactNode;

  /** 제목 요소의 id — `aria-labelledby`에 연결. (children 안의 제목 id를 넘긴다) */
  labelledBy?: string;
  /** DOM에 보이는 제목이 없을 때 쓰는 접근성 라벨. labelledBy가 우선. */
  ariaLabel?: string;

  /** 패널 위치/전환 프리셋. 기본 center. */
  position?: ModalPosition;
  /** Esc로 닫기. 기본 true. */
  closeOnEsc?: boolean;
  /** 배경(오버레이) 클릭으로 닫기. 기본 true. */
  closeOnBackdropClick?: boolean;
  /** 배경 스크롤 잠금. 기본 true. */
  lockScroll?: boolean;
  /** 열릴 때 포커스를 줄 요소. 미지정 시 첫 포커스 가능 요소. */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /** 다이얼로그 패널 className (크기·레이아웃 커스터마이즈). */
  className?: string;
  /** 패널 inline style. */
  style?: CSSProperties;
  /** 위치 래퍼 className에 덧붙일 클래스 (반응형 정렬 등). */
  wrapperClassName?: string;
  /** 오버레이 className에 덧붙일 클래스. */
  overlayClassName?: string;
  /** 패널 전환 variants 재정의 (특수 모션이 필요한 경우만). */
  variants?: Variants;
  /** z-index 베이스. 오버레이=z, 패널=z+1. 기본 1000. */
  zIndex?: number;
  /** 패널 mousedown 시 배경 닫힘 방지를 위해 전파를 막을지. 기본 true. */
  stopPropagation?: boolean;
}

const POSITION_VARIANTS: Record<ModalPosition, Variants> = {
  center: {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
  },
  "sheet-bottom": {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" },
  },
  "drawer-right": {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  },
  "drawer-left": {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" },
  },
};

/** 모션 축소 시: 위치 무관하게 opacity만, 즉시 전환. */
const REDUCED_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const POSITION_WRAPPER: Record<ModalPosition, string> = {
  center: "items-center justify-center p-4",
  "sheet-bottom": "items-end justify-center",
  "drawer-right": "items-stretch justify-end",
  "drawer-left": "items-stretch justify-start",
};

/**
 * 공용 모달 프리미티브 — UI 상태(포커스/스크롤/접근성)를 한곳에 캡슐화한다.
 *
 * 책임:
 * - 포커스 트랩 + 포커스 복귀(열기 직전 요소 저장→닫을 때 복귀) — `useFocusTrap`
 * - Esc 닫기 / 배경 클릭 닫기
 * - 배경 스크롤 잠금(중첩 카운팅) — `lockBodyScroll`
 * - 접근성 기본값: `role="dialog"` + `aria-modal` + `aria-labelledby`/`aria-label`
 * - `prefers-reduced-motion` 존중 전환(framer-motion)
 * - body로 portal (z-index 스태킹 일관성)
 *
 * children에는 패널 "내용"만 넣는다(오버레이/포커스/스크롤락은 프리미티브가 처리).
 */
export function Modal({
  isOpen,
  onClose,
  children,
  labelledBy,
  ariaLabel,
  position = "center",
  closeOnEsc = true,
  closeOnBackdropClick = true,
  lockScroll = true,
  initialFocusRef,
  className,
  style,
  wrapperClassName,
  overlayClassName,
  variants,
  zIndex = 1000,
  stopPropagation = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // portal 타깃은 클라이언트에서만 존재.
  useEffect(() => setMounted(true), []);

  // 포커스 트랩 + 복귀.
  useFocusTrap(panelRef, isOpen, initialFocusRef);

  // 배경 스크롤 잠금 (열려 있는 동안).
  useEffect(() => {
    if (!isOpen || !lockScroll) return;
    const release = lockBodyScroll();
    return release;
  }, [isOpen, lockScroll]);

  // Esc 닫기.
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  if (!mounted) return null;

  const resolvedVariants = variants ?? (reduced ? REDUCED_VARIANTS : POSITION_VARIANTS[position]);
  const panelTransition = reduced
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const };
  const overlayTransition = reduced ? { duration: 0 } : { duration: 0.2 };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={`fixed inset-0 bg-black/50 ${overlayClassName ?? ""}`}
            style={{ zIndex }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            aria-hidden="true"
            onClick={closeOnBackdropClick ? onClose : undefined}
          />
          <div
            className={`fixed inset-0 flex ${POSITION_WRAPPER[position]} ${wrapperClassName ?? ""}`}
            style={{ zIndex: zIndex + 1 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              aria-label={labelledBy ? undefined : ariaLabel}
              className={className}
              style={style}
              variants={resolvedVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={panelTransition}
              onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
