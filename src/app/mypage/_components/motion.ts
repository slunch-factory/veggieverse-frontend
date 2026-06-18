import type { Variants } from "framer-motion";

/**
 * 마이페이지 카드 진입 모션 — 부모 컨테이너에서 stagger,
 * 자식 카드는 fade + slide-up. prefers-reduced-motion은
 * framer-motion이 자동으로 transform/opacity를 줄여 처리한다.
 */
export const listContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
};
