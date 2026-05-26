"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Ripple {
  id: number;
  x: number; // viewport px
  y: number; // viewport px
}

interface SelectRippleProps {
  ripples: Ripple[];
}

// 선택 위치에서 퍼지는 빛 ripple — 게임 SFX 같은 피드백
export function SelectRipple({ ripples }: SelectRippleProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0.85, scale: 0 }}
            animate={{ opacity: 0, scale: 6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              left: r.x - 80,
              top: r.y - 80,
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "2px solid rgba(213, 254, 0, 0.65)",
              background:
                "radial-gradient(circle, rgba(213,254,0,0.32) 0%, rgba(213,254,0,0.08) 45%, transparent 70%)",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export type { Ripple };
