"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 진입 애니메이션 지연(초) — 그리드 내 stagger용 */
  delay?: number;
  /** 시작 y 오프셋(px) */
  y?: number;
}

/**
 * 스크롤 진입 시 한 번 페이드업되는 래퍼.
 * about 싱글스크롤 섹션 콘텐츠에 적용해 동적인 느낌을 준다.
 */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
