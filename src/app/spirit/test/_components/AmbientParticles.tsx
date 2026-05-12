"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;        // %
  y: number;        // %
  size: number;     // px
  duration: number; // s
  delay: number;    // s
  hue: number;      // degree
}

interface AmbientParticlesProps {
  count?: number;
}

// 배경 부유 빛 입자 — 게임/마법 감성을 위한 ambient layer
export function AmbientParticles({ count = 28 }: AmbientParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 5,
      // 라임-옐로우(85) ~ 보라(280) 사이 무작위
      hue: Math.random() < 0.5 ? 70 + Math.random() * 25 : 260 + Math.random() * 30,
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.7, 0.3, 0.8, 0],
            x: [0, 14, -10, 6, 0],
            y: [0, -22, -8, -30, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `hsl(${p.hue}, 90%, 70%)`,
            boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue}, 90%, 65%)`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
