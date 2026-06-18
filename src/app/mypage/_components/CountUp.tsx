"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform, useReducedMotion } from "framer-motion";

/**
 * 숫자 0 → value 카운트업 — 뷰포트 진입 시 1회 재생.
 * React state 없이 MotionValue로 렌더(불필요한 리렌더 방지).
 * prefers-reduced-motion이면 즉시 최종값 표시.
 */
export function CountUp({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, {
      duration: reduce ? 0 : duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce, count]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
