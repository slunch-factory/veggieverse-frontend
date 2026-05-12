"use client";

import { motion } from "framer-motion";

interface QuestionHeadlineProps {
  text: string;
  stepKey: number; // 변경 시 재마운트 트리거
}

// 글자 단위 wave 등장 — 게임 인트로 텍스트 느낌
export function QuestionHeadline({ text, stepKey }: QuestionHeadlineProps) {
  const chars = Array.from(text);

  return (
    <h2
      key={stepKey}
      style={{
        margin: "0 0 0.55rem",
        fontSize: "clamp(1.6rem, 4vw, 2rem)",
        fontWeight: 800,
        color: "#D5FE00",
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        wordBreak: "keep-all",
        maxWidth: "55%",
        display: "inline-block",
      }}
      aria-label={text}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={`${stepKey}-${i}`}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: 0.08 + i * 0.035,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: "inline-block",
            whiteSpace: ch === " " ? "pre" : "normal",
          }}
          aria-hidden
        >
          {ch}
        </motion.span>
      ))}
    </h2>
  );
}
