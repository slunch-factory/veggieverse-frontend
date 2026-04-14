"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { PRODUCE_ITEMS } from "@/constants";
import type { VegetableItem } from "@/types";

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


// ─── 뉴스레터 데이터 ───
const NEWSLETTER_ITEMS = [
  { id: 1, category: "Health", title: "멈춰야 보이는 것들", subtitle: "번아웃을 겪고 나서야 알게 된 것들", author: "Miso", date: "2024.12.12", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" },
  { id: 2, category: "Culture", title: "2060년, 나는 마흔이 된다", subtitle: "초고령 사회를 앞둔 Z세대의 고민", author: "Huna", date: "2024.12.05", thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80" },
  { id: 3, category: "Food", title: "냉장고를 열면 한 끼가 보인다", subtitle: "배달 앱 골드 등급이 집밥을 시작한 이유", author: "ChaCha", date: "2024.11.28", thumbnail: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=600&q=80" },
  { id: 4, category: "Life", title: '"그 영화 재밌어" 다음에 할 말', subtitle: "소개팅에서 영화 이야기 잘하는 법", author: "Jin", date: "2024.11.20", thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80" },
];


// ─── CTA 버튼 공통 스타일 ───
function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block px-6 py-3 text-[15px] transition-colors bg-[#B2B2B2] text-white"
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8C451D"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#B2B2B2"; }}
    >
      {children}
    </Link>
  );
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
        <p className="bg-gray-50 mb-4 md:mb-6 z-30 relative text-center mx-auto text-[clamp(16px,2vw,20px)] leading-[1.6] tracking-[-0.01em] max-w-[700px] px-10 text-[#C8A000]">
          &ldquo;뭐 먹지?&rdquo; 고민은 내려놓고, 나에게 맞는 한 끼를 발견하세요.
          <br />
          끌리는 재료 3가지만 고르면, 당신의 취향에 꼭 맞는 테이블이 완성됩니다.
        </p>

        {/* 본문 */}
        <p className="bg-gray-50 text-stone-600 mb-8 md:mb-12 z-30 relative text-center mx-auto text-[16px] leading-[1.8] tracking-[-0.01em] max-w-[800px] px-10">
        슬런치는 맛있는 한 끼가 거창할 필요 없다고 믿습니다. 바쁜 하루 속에서도 나를 위한 시간, 천천히 음미하는 식사. 우리는 당신의 취향과 라이프스타일에 맞춰 매일의 식탁을 설계합니다. 건강을 위해 맛을 포기하거나, 맛을 위해 건강을 타협하지 않아도 됩니다. 그냥 맛있게 먹었을 뿐인데, 몸도 마음도 가벼워지는 경험. 슬런치가 그 테이블을 열어드릴게요.
        </p>

        {/* 하단 선택 UI */}
        <style>{`
          @keyframes slideUpPush {
            from { transform: translate(-50%, 100%); }
            to { transform: translate(-50%, 0); }
          }
        `}</style>

        {selectedItems.length >= 1 && (
          <div className="absolute z-40 w-[860px] max-w-full left-1/2 bottom-0 overflow-hidden" style={{ transform: "translate(-50%, 0)", animation: "slideUpPush 0.5s ease-out" }}>
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
                  href="/spirit/step"
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
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════
          Slunch Weekly - 3열 그리드
          ════════════════════════════════════════════ */}
      <section className="scroll-snap-section-flex py-20 bg-white">
        <div className="page-container mb-12">
          <div className="max-w-3xl">
            <h2 className="text-[length:var(--font-size-h2)] tracking-[var(--letter-spacing-tight)] leading-[var(--line-height-h2)] text-black mb-4">
              Slunch Weekly
            </h2>
            <p className="text-stone-600 text-[length:var(--font-size-body)] leading-[var(--line-height-body)]">
            잘 먹고 싶은데 매번 챙기기는 쉽지 않죠. Slunch Weekly는 하루 2끼, 주 14끼 식단을 매주 새벽에 보내드려요. 영양은 이미 맞춰뒀고, 재료는 새벽에 신선하게 출발해요. 식단 고민, 장보기, 칼로리 계산 같은 건 저희한테 맡겨두세요. 월요일 아침에 문 열면, 일주일이 조금 가벼워질 거예요.
            </p>
          </div>
        </div>
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: "/14meals.png", title: "주 14끼 식단", desc: "하루 2끼, 일주일치 식단을 한번에" },
              { img: "/dawn.png", title: "신선 새벽 배송", desc: "매주 월요일 아침, 문 앞까지 신선하게" },
              { img: "/balance.png", title: "영양 밸런스 완벽 설계", desc: "전문가와 AI가 설계한 균형 잡힌 식단" },
            ].map((card) => (
              <div key={card.title} className="bg-white flex flex-col">
                <div className="border border-[#eee] rounded-xl overflow-hidden aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                </div>
                <div className="pt-3">
                  <h3 className="text-[16px] tracking-[-0.01em] text-[#1a1a1a] mb-1">{card.title}</h3>
                  <p className="text-xs leading-[1.6] text-[#666]">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <CTAButton href="/subscribe">구독 알아보기</CTAButton>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          Featured Recipes - 무한 롤링
          ════════════════════════════════════════════ */}
      <section className="scroll-snap-section-flex py-20 bg-[#FDFBF7] overflow-hidden">
        <div className="page-container mb-12">
          <div className="max-w-3xl">
            <h2 className="text-[length:var(--font-size-h2)] tracking-[var(--letter-spacing-tight)] leading-[var(--line-height-h2)] text-black mb-4">
              누군가의 테이블에서 영감을
            </h2>
            <p className="text-stone-600 text-[length:var(--font-size-body)] leading-[var(--line-height-body)]">
              슬런치 멤버들이 직접 만들고 공유하는 레시피.
            </p>
          </div>
        </div>
        <div className="relative w-full">
          <style>{`
            @keyframes scrollLeft {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .infinite-scroll-track {
              display: flex;
              gap: 12px;
              animation: scrollLeft 60s linear infinite;
              width: fit-content;
            }
            .infinite-scroll-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="infinite-scroll-track">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-3">
                {[
                  { id: 101, title: "콩나물 비빔밥", author: "비건셰프", type: "tall" as const },
                  { id: 102, title: "당근 라페 샌드위치", author: "채식러버", type: "wide" as const },
                  { id: 103, title: "올리브 파스타", author: "이탈리안", type: "standard" as const },
                  { id: 104, title: "피스타치오 페스토", author: "홈쿡러", type: "tall" as const },
                  { id: 105, title: "무화과 샐러드", author: "계절요리", type: "wide" as const },
                  { id: 201, title: "비빔국수", author: "면요리사", type: "wide" as const },
                  { id: 202, title: "샐러드 랩", author: "다이어터", type: "standard" as const },
                  { id: 203, title: "버섯 덮밥", author: "버섯사랑", type: "tall" as const },
                  { id: 301, title: "코코넛 푸딩", author: "디저트왕", type: "wide" as const },
                  { id: 302, title: "블루베리 타르트", author: "베이커리", type: "standard" as const },
                ].map((recipe) => {
                  const cardStyle = recipe.type === "tall" ? { width: "220px", height: "320px" } : recipe.type === "wide" ? { width: "320px", height: "220px" } : { width: "240px", height: "240px" };
                  return (
                    <Link key={`${setIndex}-${recipe.id}`} href={`/recipe/${recipe.id}`} className="block shrink-0 relative overflow-hidden rounded-lg bg-[#e5e5e0]" style={cardStyle}>
                      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-[10px] uppercase tracking-[0.1em] mb-1.5 opacity-80">@{recipe.author}</p>
                        <h3 className="text-[13px] leading-[1.3] m-0">{recipe.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-12">
          <CTAButton href="/recipe">View all</CTAButton>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          Newsletter Preview - 4열 그리드
          ════════════════════════════════════════════ */}
      <section className="scroll-snap-section-flex bg-[#D7D7D7] py-20">
        <div className="page-container">
          <h2 className="text-[24px] tracking-[-0.02em] leading-[1.2] text-black mb-8">뉴스레터</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {NEWSLETTER_ITEMS.map((article) => (
              <Link key={article.id} href={`/newsletter/${article.id}`} className="group">
                <div className="relative w-full overflow-hidden aspect-[4/3] bg-[#E5E5E0] rounded-[4px] mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <p className="text-[11px] tracking-[0.05em] text-[#6B6B6B] mb-2 uppercase">{article.category}</p>
                <h3 className="group-hover:underline line-clamp-2 text-[16px] leading-[1.3] text-black mb-1.5">{article.title}</h3>
                <p className="line-clamp-1 text-[13px] leading-[1.5] text-[#6B6B6B] mb-3">{article.subtitle}</p>
                <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                  <span>{article.author}</span>
                  <span>·</span>
                  <span>{article.date}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <CTAButton href="/newsletter">View all</CTAButton>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          이미지 영역
          ════════════════════════════════════════════ */}
      <section className="w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=1920&q=80"
          alt="건강한 식탁"
          className="w-full h-[980px] object-cover"
        />
      </section>

      {/* ════════════════════════════════════════════
          하단 CTA
          ════════════════════════════════════════════ */}
      <section className="w-full bg-black py-20">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-[length:var(--font-size-h2)] tracking-[var(--letter-spacing-tight)] leading-[var(--line-height-h2)] text-white">
              지금 시작해보세요
            </h2>
            <p className="mb-10 max-w-2xl mx-auto text-[length:var(--font-size-body)] leading-[var(--line-height-body)] text-white">
              슬런치와 함께 느긋한 식탁 문화를 경험하고, AI가 제안하는 개인화된 건강 관리를 시작해보세요.
              <br />
              첫 방문 고객을 위한 특별 할인 혜택도 준비되어 있습니다.
            </p>
            <button
              onClick={() => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="px-6 py-3 text-[15px] cursor-pointer transition-colors border-none bg-[#B2B2B2] text-white"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8C451D"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#B2B2B2"; }}
            >
              지금 테스트하고 식단 추천받기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
