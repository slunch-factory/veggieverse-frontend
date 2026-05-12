"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PRODUCE_ITEMS } from "@/constants";
import type { VegetableItem } from "@/types";
import { HomeEditorialContent } from "@/components/home/HomeEditorialContent";

// ─── FloatingItem 타입 ───
interface FloatingItem extends VegetableItem {
  size: number;
  labelColor: string;
  labelOffsetX: number;
  labelOffsetY: number;
  labelRotation: number;
  animationDuration: number;
  animationDelay: number;
  floatAmplitude: number;
  rotationDuration: number;
  driftX: number;
  driftY: number;
  rotateDirection: number;
  zIndex: number;
  vx: number;
  vy: number;
  moveX1: number;
  moveY1: number;
  moveX2: number;
  moveY2: number;
  moveX3: number;
  moveY3: number;
  moveX4: number;
  moveY4: number;
  floatDuration: number;
  floatDelay: number;
}


// ─── 메인 홈페이지 ───
export default function HomePage() {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<FloatingItem[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 초기 아이템 생성 - 그리드 기반 랜덤 배치
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const sizeMultiplier = isMobile ? 0.78 : 1;
    const baseSize = 180;

    const cols = isMobile ? 5 : 7;
    const rows = isMobile ? 8 : 6;
    const xMin = 5, xMax = 95, yMin = 5, yMax = 95;
    const cellW = (xMax - xMin) / cols;
    const cellH = (yMax - yMin) / rows;

    const gridPositions: { x: number; y: number }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        gridPositions.push({
          x: xMin + (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.6,
          y: yMin + (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.6,
        });
      }
    }
    // Shuffle
    for (let i = gridPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridPositions[i], gridPositions[j]] = [gridPositions[j], gridPositions[i]];
    }

    const initialItems: FloatingItem[] = PRODUCE_ITEMS.map((produce, index) => {
      const pos = gridPositions[index];
      const scale = (0.8 + Math.random() * 0.5) * sizeMultiplier;
      return {
        id: `produce-${index}`,
        name: produce.name,
        x: pos.x,
        y: pos.y,
        scale,
        rotation: Math.random() * 360,
        imageUrl: produce.image,
        color: "",
        size: baseSize,
        labelColor: produce.color,
        labelOffsetX: (Math.random() - 0.5) * 30,
        labelOffsetY: -20,
        labelRotation: (Math.random() - 0.5) * 20,
        animationDuration: 4 + Math.random() * 2,
        animationDelay: Math.random() * 2,
        floatAmplitude: 20 + Math.random() * 15,
        rotationDuration: 22 + Math.random() * 12,
        driftX: (Math.random() - 0.5) * 70,
        driftY: (Math.random() - 0.5) * 50,
        rotateDirection: Math.random() > 0.5 ? 1 : -1,
        zIndex: 1 + index,
        vx: 0,
        vy: 0,
        moveX1: (Math.random() - 0.5) * 120,
        moveY1: (Math.random() - 0.5) * 120,
        moveX2: (Math.random() - 0.5) * 150,
        moveY2: (Math.random() - 0.5) * 150,
        moveX3: (Math.random() - 0.5) * 130,
        moveY3: (Math.random() - 0.5) * 130,
        moveX4: (Math.random() - 0.5) * 100,
        moveY4: (Math.random() - 0.5) * 100,
        floatDuration: 10 + Math.random() * 8,
        floatDelay: Math.random() * 4,
      };
    });
    setItems(initialItems);
  }, []);

  // CSS keyframes 동적 주입
  useEffect(() => {
    if (items.length === 0) return;
    const css = items
      .map((item) => {
        const itemId = item.id.replace(/[^a-zA-Z0-9]/g, "");
        return `
        @keyframes float-${itemId} {
          0%   { transform: translate(0px, 0px); }
          20%  { transform: translate(${item.moveX1}px, ${item.moveY1}px); }
          40%  { transform: translate(${item.moveX2}px, ${item.moveY2}px); }
          60%  { transform: translate(${item.moveX3}px, ${item.moveY3}px); }
          80%  { transform: translate(${item.moveX4}px, ${item.moveY4}px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes rotate-${itemId} {
          from { transform: rotate(0deg); }
          to   { transform: rotate(${item.rotateDirection * 360}deg); }
        }
        .vegetable-rotate-${itemId} {
          animation: rotate-${itemId} ${item.rotationDuration}s linear infinite;
        }
      `;
      })
      .join("");
    const styleEl = document.createElement("style");
    styleEl.id = "vegetable-animations";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    return () => {
      document.getElementById("vegetable-animations")?.remove();
    };
  }, [items]);

  const handleItemClick = useCallback((item: FloatingItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id);
      if (isSelected) return prev.filter((i) => i.id !== item.id);
      if (prev.length < 3) return [...prev, item];
      return prev;
    });
  }, []);

  const removeSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      {/* ════════════════════════════════════════════
          HERO - 나의 슬로우 스피릿 찾기
          ════════════════════════════════════════════ */}
      <section
        ref={containerRef}
        className="relative w-full bg-white flex flex-col pt-[clamp(40px,8vw,80px)] px-[clamp(20px,5vw,60px)]"
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/bg.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "calc(100vh - var(--header-h, 0px))",
          height: "calc(100vh - var(--header-h, 0px))",
          clipPath: "inset(-40px -50px 0 -50px)",
        }}
      >
        {/* 야채 플로팅 영역 */}
        <div className="absolute -top-[40px] -left-[50px] -right-[50px] -bottom-[40px] pointer-events-none">
          {items.map((item) => {
            const isSelected = selectedItems.some((i) => i.id === item.id);
            const itemId = item.id.replace(/[^a-zA-Z0-9]/g, "");
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                className="absolute group cursor-pointer pointer-events-auto isolate"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.size * item.scale}px`,
                  height: `${item.size * item.scale}px`,
                  marginLeft: `-${(item.size * item.scale) / 2}px`,
                  marginTop: `-${(item.size * item.scale) / 2}px`,
                  zIndex: isSelected ? 19 : (item.zIndex % 10) + 1,
                  animation: isSelected ? "none" : `float-${itemId} ${item.floatDuration}s ease-in-out infinite`,
                  animationDelay: isSelected ? undefined : `${item.floatDelay}s`,
                }}
              >
                <div
                  className={`w-full h-full relative ${!isSelected ? `vegetable-rotate-${itemId}` : ""}`}
                  style={{ animationPlayState: isSelected ? "paused" : undefined }}
                >
                  {/* 원본 이미지 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-contain absolute inset-0 z-[1]"
                    style={{ opacity: isSelected || hoveredItemId === item.id ? 0 : 1 }}
                    draggable={false}
                  />
                  {/* 컬러 실루엣 */}
                  <div
                    className="w-full h-full absolute inset-0 z-[2] pointer-events-none"
                    style={{
                      backgroundColor: item.labelColor,
                      WebkitMaskImage: `url(${item.imageUrl})`,
                      WebkitMaskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskImage: `url(${item.imageUrl})`,
                      maskSize: "contain",
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                      opacity: isSelected || hoveredItemId === item.id ? 1 : 0,
                    }}
                  />
                  {/* 호버 시 이름 */}
                  <div
                    className="absolute inset-0 flex items-center justify-center z-[30] pointer-events-none"
                    style={{ opacity: hoveredItemId === item.id && !isSelected ? 1 : 0 }}
                  >
                    <span className="text-white text-sm px-3 py-1.5 rounded bg-black/70 backdrop-blur-[4px]">
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 간격 유지 */}
        <div className="flex-1 min-h-[300px]" />

        {/* 서브헤드라인 */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gray-50 mb-4 md:mb-6 z-30 relative text-center mx-auto text-[clamp(16px,2vw,20px)] leading-[1.6] tracking-[-0.01em] max-w-[700px] px-10 text-[#C8A000]"
        >
          &ldquo;뭐 먹지?&rdquo; 고민은 내려놓고, 나에게 맞는 한 끼를 발견하세요.
          <br />
          끌리는 재료 3가지만 고르면, 당신의 취향에 꼭 맞는 테이블이 완성됩니다.
        </motion.p>

        {/* 본문 */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gray-50 text-stone-600 mb-8 md:mb-12 z-30 relative text-center mx-auto text-[16px] leading-[1.8] tracking-[-0.01em] max-w-[800px] px-10"
        >
        슬런치는 맛있는 한 끼가 거창할 필요 없다고 믿습니다. 바쁜 하루 속에서도 나를 위한 시간, 천천히 음미하는 식사. 우리는 당신의 취향과 라이프스타일에 맞춰 매일의 식탁을 설계합니다. 건강을 위해 맛을 포기하거나, 맛을 위해 건강을 타협하지 않아도 됩니다. 그냥 맛있게 먹었을 뿐인데, 몸도 마음도 가벼워지는 경험. 슬런치가 그 테이블을 열어드릴게요.
        </motion.p>

        {/* 하단 선택 UI */}
        {selectedItems.length >= 1 && (
          <motion.div
            initial={{ y: "100%", x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-40 w-[860px] max-w-full left-1/2 bottom-0 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full z-[1] bg-[#DCFD4A] rounded-t-[16px]" style={{ clipPath: "polygon(3.49% 0, 96.51% 0, 100% 100%, 0 100%)" }} />
            <div className="absolute top-0 left-[3.49%] right-[3.51%] h-4 bg-[#DCFD4A] rounded-t-[16px] z-[3] pointer-events-none" />
            <div className="mx-auto w-full relative z-[2]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-5">
                {/* 선택된 야채 실루엣 */}
                <div className="flex items-center gap-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="relative w-[60px] h-[60px] flex items-center justify-center shrink-0">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: item.labelColor,
                          WebkitMaskImage: `url(${item.imageUrl})`,
                          WebkitMaskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskImage: `url(${item.imageUrl})`,
                          maskSize: "contain",
                          maskRepeat: "no-repeat",
                          maskPosition: "center",
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSelection(item.id); }}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full z-10 cursor-pointer bg-[#8C451D]"
                        aria-label="선택 해제"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 스피릿 찾기 버튼 */}
                <Link
                  href="/spirit"
                  onClick={() => {
                    localStorage.setItem("spirit-finder-selected-items", JSON.stringify(selectedItems));
                  }}
                  className="px-6 py-3 text-[15px] text-white transition-colors bg-[#8C451D] min-h-[44px] min-w-[120px] inline-flex items-center justify-center"
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6B3514"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#8C451D"; }}
                >
                  나의 슬로우 스피릿 찾기
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      <HomeEditorialContent />
    </div>
  );
}
