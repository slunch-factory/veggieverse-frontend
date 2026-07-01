"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
} from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 메인페이지 자산은 로컬 public/main/ 에서 직접 서빙한다(외부/Supabase 의존 제거).
const IMG = {
  why1:   `${BASE}/main/why-1.png`,
  why2:   `${BASE}/main/why-2.png`,
  why3:   `${BASE}/main/why-3.png`,
  menu1:  `${BASE}/main/menu_1.png`,
  menu2:  `${BASE}/main/menu_2.png`,
  menu3:  `${BASE}/main/menu_3.png`,
  menu4:  `${BASE}/main/menu_4.png`,
  menu5:  `${BASE}/main/menu_5.png`,
  menu6:  `${BASE}/main/menu_6.png`,
  menu7:  `${BASE}/main/menu_7.png`,
  menu8:  `${BASE}/main/menu_8.png`,
  menu9:  `${BASE}/main/menu_9.png`,
  menu10: `${BASE}/main/menu_10.png`,
  menu11: `${BASE}/main/menu_11.png`,
  menu12: `${BASE}/main/menu_12.png`,
  how1:   `${BASE}/main/how-1.png`,
  how2:   `${BASE}/main/how-2.png`,
  how3:   `${BASE}/main/how-3.png`,
  review: `${BASE}/main/review.png`,
};

// "매일 먹는 한 끼…" 섹션 배경 영상 (로컬, 웹 최적화 mp4)
const WEEKLY_VIDEO = `${BASE}/main/weekly.mp4`;

// ── 디자인 토큰 ─────────────────────────────────────────────────────
const INK       = "var(--ink)";
const INK_LIGHT = "var(--ink-light)";
const MUTED     = "var(--neutral-stone)";
const HAIRLINE  = "rgba(37,10,0,0.1)";

// ── 패럴랙스 유틸 ───────────────────────────────────────────────────

function usePanScrollProgress(ref: RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = ref.current;
      if (!el) { progress.set(0); return; }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const travel = Math.max(1, vh + rect.height);
      progress.set(Math.min(1, Math.max(0, (vh - rect.top) / travel)));
    };
    const schedule = () => { if (raf) return; raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", schedule, { passive: true });
    document.scrollingElement?.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      document.scrollingElement?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, progress]);
  return progress;
}

function useObservedHeight(ref: RefObject<HTMLElement | null>) {
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setH(el.getBoundingClientRect().height);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

// ── 애니메이션 variants ──────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const imgReveal = {
  hidden: { clipPath: "inset(100% 0 0% 0)" },
  show: {
    clipPath: "inset(0% 0 0% 0)",
    transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] as const },
  },
};

// How it works 블록 — 각자 자기 쪽(좌/우)에서 슬라이드되어 들어온다.
const slideFromLeft = {
  hidden: { opacity: 0, x: -110 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  },
};
const slideFromRight = {
  hidden: { opacity: 0, x: 110 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ── 공통 컴포넌트 ────────────────────────────────────────────────────

function Label({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className="mb-4 text-[11px] tracking-[0.22em] uppercase"
      style={{ color: light ? "rgba(255,255,255,0.55)" : MUTED }}
    >
      {children}
    </p>
  );
}

// ── 풀블리드 히어로 (패럴랙스) ───────────────────────────────────────

function ParallaxHero({ src, children }: { src: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const h   = useObservedHeight(ref);
  const progress = usePanScrollProgress(ref);
  const slack  = Math.max(0, ((1.3 - 1) / 2) * h * 0.94);
  const panMax = Math.min(600, slack || 600);
  const y = useTransform(progress, [0, 1], [panMax, -panMax]);

  return (
    <section
      ref={ref}
      className="relative flex w-full min-h-[min(88svh,920px)] items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute left-0 w-full will-change-transform"
          style={{ top: "-15%", height: "130%", y }}
        >
          <video
            src={src}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/52 to-black/68" aria-hidden />
      <div className="page-container relative z-10 flex w-full flex-col items-center px-5 py-24 md:py-32 text-center">
        {children}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. 브랜드 히어로
// ═══════════════════════════════════════════════════════════════════

function HeroBrand() {
  return (
    <ParallaxHero src={WEEKLY_VIDEO}>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="flex flex-col items-center gap-6 max-w-[min(100%,42rem)]"
      >
        <motion.div variants={fadeUp}>
          <Label light>Slunch Weekly</Label>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="text-balance text-white"
          style={{
            fontSize: "clamp(26px, 4.2vw, 46px)",
            lineHeight: 1.22,
            letterSpacing: "-0.02em",
          }}
        >
          매일 먹는 한 끼가 나를<br />더 나답게 만든다면 어떨까요?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-[15px] leading-[1.85] max-w-[min(100%,30rem)]"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          다만 하루를 조용히 돌보는 식탁은 분명히 있습니다.<br />
          슬런치는 그 리듬을 한 주에 열네 번으로 나눕니다. 똑같은 메뉴표가 아니라, 같은 취향의 결 위에서 매주 새롭게 이어지는 식단을 설계합니다.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/subscribe" className="btn btn-lg btn-primary">
            구독 시작하기
          </Link>
          <Link
            href="/store"
            className="btn btn-lg"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.45)",
              color: "#ffffff",
            }}
          >
            스토어 둘러보기
          </Link>
        </motion.div>
      </motion.div>
    </ParallaxHero>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. 3대 특징
// ═══════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    img:   IMG.why1,
    num:   "01",
    title: "하루 2끼 × 7일",
    desc:  "잘 먹고 싶은데 매번 챙기기는 쉽지 않죠. 슬런치 위클리는 하루 2끼, 주 14끼 식단을 매주 새벽에 보내드려요. 식단 고민, 장보기, 칼로리 계산은 저희한테 맡겨두세요.",
  },
  {
    img:   IMG.why2,
    num:   "02",
    title: "신선 새벽 배송",
    desc:  "매주 월요일 아침, 문 앞까지 신선하게. 재료는 새벽에 출발해요. 월요일 아침에 문을 열면, 일주일이 조금 가벼워질 거예요.",
  },
  {
    img:   IMG.why3,
    num:   "03",
    title: "취향 맞춤 설계",
    desc:  "스피릿으로 나의 식취향을 파악하고, 주간 식단으로 한 주를 채워보세요. 맛과 건강, 둘 중 하나를 선택할 필요가 없다는 사실은—먹어보면서 자연스럽게 알게 됩니다.",
  },
];

function Features() {
  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "var(--bg-pale)", borderBottom: `1px solid ${HAIRLINE}` }}
    >
      <div className="page-container">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-14 md:mb-16"
        >
          <motion.div variants={fadeUp}><Label>Why Slunch</Label></motion.div>
          <motion.h2
            variants={fadeUp}
            style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              color: INK,
            }}
          >
            먹는 고민을 덜고,<br className="hidden sm:block" /> 먹는 순간에 집중하세요
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.num} variants={fadeUp} className="flex flex-col gap-5">
              <motion.div variants={imgReveal} className="relative overflow-hidden rounded-sm aspect-[4/3]">
                <Image
                  src={f.img}
                  alt={f.title}
                  fill
                  className="object-cover"
                  sizes="(min-width:640px) 33vw, 100vw"
                />
              </motion.div>
              <div>
                <p className="text-[11px] tracking-[0.18em] mb-2 uppercase" style={{ color: MUTED }}>
                  {f.num}
                </p>
                <h3
                  className="text-[17px] mb-2"
                  style={{ letterSpacing: "-0.01em", color: INK }}
                >
                  {f.title}
                </h3>
                <p className="text-[14px] leading-[1.75]" style={{ color: INK_LIGHT }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 3. 메뉴 쇼케이스 (framer-motion 자동 슬라이드)
// ═══════════════════════════════════════════════════════════════════

// 콜라주 띠 — 각 컷아웃을 클러스터로 겹쳐 흩뿌린다.
// size: 시각적 크기 = "가장 긴 변" 기준(px). 가로 긴 이미지·세로 긴 이미지 상관없이
//       체감 크기가 균일해진다. aspect(=원본 w/h)로 실제 높이를 역산.
// top: 띠 상단 기준 수직 오프셋, rotate: 기울기, ml: 좌측 간격(음수=겹침, 양수=여백)
type MenuItem = { src: string; aspect: number; size: number; top: number; rotate: number; ml: number };

// 폭·높이를 모두 명시적으로 계산한다(가장 긴 변 = size). width:auto로 두면 이미지 로드 전
// 폭이 0으로 측정돼 무한 루프 폭(singleW)이 깨지므로 반드시 폭을 고정한다.
const itemHeight = (it: MenuItem) =>
  it.aspect <= 1 ? it.size : Math.round(it.size / it.aspect);
const itemWidth = (it: MenuItem) =>
  it.aspect >= 1 ? it.size : Math.round(it.size * it.aspect);

// 썸네일 테스트.png 레퍼런스 — 거의 똑바로(회전 최소) + 클러스터로 겹침. 크기는 정규화
// 균일하게(앵커 250 · 일반 205~225 · 액센트 150), 간격은 촘촘하게.
/* 
aspect: 원본 가로/세로 비율(건들이지 말 것) 
size: 크기(앵커 250 - 일반 205~225 - 액센트 150)
top: 위 아래 위치
rotate: 회전 각도(시계 방향 회전)
ml: 왼쪽 간격(양수=벌어짐, 음수=왼쪽 당겨 겹치게)
*/
const MENU_ITEMS: MenuItem[] = [
  // ── 클러스터 A: 의자 위에 라자냐 접시
  { src: IMG.menu3,  aspect: 0.694, size: 205, top: 200, rotate: 0,  ml: 0   }, // 알록달록 의자
  { src: IMG.menu10, aspect: 1.367, size: 225, top: 58,  rotate: -2, ml: -86 }, // 라자냐 (위로 겹침)
  // ── 클러스터 B: SLUNCH 봉지 + 크레이트 + 작은 사람들
  { src: IMG.menu11, aspect: 1.263, size: 255, top: 34,  rotate: 2,  ml: -24 }, // SLUNCH 봉지 (앵커)
  { src: IMG.menu1,  aspect: 0.881, size: 210, top: 116, rotate: 0,  ml: -96 }, // 마켓 크레이트 (겹침)
  { src: IMG.menu7,  aspect: 1.629, size: 175, top: 262, rotate: 0,  ml: -118}, // 채소 든 사람들 (바닥)
  // ── 클러스터 C: 페스토 + 화분
  { src: IMG.menu12, aspect: 3.847, size: 285, top: 120, rotate: -2, ml: -44 }, // 페스토 봉지
  { src: IMG.menu2,  aspect: 0.592, size: 205, top: 24,  rotate: 0,  ml: -44 }, // 화분 (위로 겹침)
  // ── 클러스터 D: 관자 + 비트 접시 + 별
  { src: IMG.menu8,  aspect: 2.874, size: 290, top: 230, rotate: 1,  ml: -70 }, // 관자 접시
  { src: IMG.menu9,  aspect: 1.012, size: 218, top: 116, rotate: 0,  ml: -60 }, // 비트 접시 (겹침)
  { src: IMG.menu6,  aspect: 1.203, size: 150, top: 32,  rotate: 0,  ml: -44 }, // 금별 (위 액센트)
  // ── 클러스터 E: 램프 + 눈알
  { src: IMG.menu4,  aspect: 0.972, size: 198, top: 60,  rotate: 0,  ml: -16 }, // 램프
  { src: IMG.menu5,  aspect: 2.083, size: 150, top: 280, rotate: 0,  ml: -98 }, // 눈알 (바닥에 작게)
];

const BAND_HEIGHT = 420;   // px — 수직 흩뿌림을 담는 띠 높이
const SEAM_GAP    = 44;    // px — 원본/복제 세트 이음새 간격
const LOOP_SPEED  = 0.05;  // px per ms

function MenuShowcase() {
  const singleRef = useRef<HTMLDivElement>(null);
  const singleW   = useRef(0);
  const x         = useMotionValue(0);

  useLayoutEffect(() => {
    const el = singleRef.current;
    if (!el) return;
    const measure = () => { singleW.current = el.scrollWidth + SEAM_GAP; };
    measure();
    // 폭은 명시적이라 즉시 정확하지만, 폰트/이미지 디코드로 폭이 바뀔 때를 대비해 재측정
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (singleW.current <= 0) return;
    const next = x.get() - LOOP_SPEED * delta;
    x.set(next <= -singleW.current ? next + singleW.current : next);
  });

  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "var(--bg-white)", borderBottom: `1px solid ${HAIRLINE}` }}
    >
      {/* 헤더 */}
      <div className="page-container mb-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeUp}><Label>Menu</Label></motion.div>
          <motion.h2
            variants={fadeUp}
            style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              color: INK,
            }}
          >
            건강한 한 주를 채워가는 식탁
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-[14px] leading-[1.75] max-w-md"
            style={{ color: INK_LIGHT }}
          >
            같은 취향의 결 위에서 흐르듯 이어지는 슬로우 라이프.
          </motion.p>
        </motion.div>
      </div>

      {/* 콜라주 트랙 — 무한 좌측 스크롤 (hover 정지 없음) */}
      <div className="overflow-hidden">
        <motion.div
          className="flex items-start"
          style={{ x, height: `${BAND_HEIGHT}px`, paddingLeft: "20px", willChange: "transform" }}
        >
          {/* 원본 세트 — 폭 측정 기준 */}
          <div ref={singleRef} className="flex items-start" style={{ height: `${BAND_HEIGHT}px` }}>
            {MENU_ITEMS.map((item, i) => (
              <MenuCutout key={i} item={item} />
            ))}
          </div>
          {/* 복제 세트 — 무한 루프 */}
          <div
            className="flex items-start"
            style={{ height: `${BAND_HEIGHT}px`, marginLeft: `${SEAM_GAP}px` }}
            aria-hidden
          >
            {MENU_ITEMS.map((item, i) => (
              <MenuCutout key={`dup-${i}`} item={item} />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="page-container mt-10 flex justify-start">
        <Link
          href="/store"
          className="text-[13px] underline underline-offset-4"
          style={{ color: INK_LIGHT }}
        >
          전체 메뉴 보기 →
        </Link>
      </div>
    </section>
  );
}

function MenuCutout({ item }: { item: MenuItem }) {
  return (
    <div
      className="flex-shrink-0"
      style={{ marginLeft: `${item.ml}px`, marginTop: `${item.top}px`, transform: `rotate(${item.rotate}deg)` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt=""
        className="block max-w-none select-none"
        style={{
          width: `${itemWidth(item)}px`,
          height: `${itemHeight(item)}px`,
          filter: "drop-shadow(0 10px 16px rgba(37,10,0,0.08))",
        }}
        draggable={false}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 4. 이용 흐름 3단계
// ═══════════════════════════════════════════════════════════════════

// 썸네일 테스트.png 레퍼런스 — 사진 블록이 좌우 지그재그로 화면 끝까지 bleed, 반대편에 단계 텍스트.
const STEPS = [
  { title: "스피릿 테스트",   desc: "재료 3가지를 고르면 취향을 분석해드려요.", img: IMG.how1 },
  { title: "맞춤 식단",       desc: "분석한 취향으로 14끼를 구성해드려요.",   img: IMG.how2 },
  { title: "당일 새벽 배송",   desc: "짜인 식단이 새벽 문 앞에 도착해요.",     img: IMG.how3 },
];

function HowItWorks() {
  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "var(--bg-pale)", borderBottom: `1px solid ${HAIRLINE}` }}
    >
      <div className="page-container">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 md:mb-20"
        >
          <motion.div variants={fadeUp}><Label>How it works</Label></motion.div>
          <motion.h2
            variants={fadeUp}
            style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              color: INK,
            }}
          >
            3단계로 완성되는 한 주
          </motion.h2>
        </motion.div>

        {/* 행은 풀블리드를 위해 page-container 밖(섹션 폭 = 100vw)에 둔다 */}
      </div>

      <div className="flex flex-col gap-16 md:gap-28">
        {STEPS.map((s, i) => {
          const blockLeft = i % 2 === 0;
          const slide = blockLeft ? slideFromLeft : slideFromRight;
          return (
            <motion.div
              key={s.title}
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="relative w-full flex flex-col md:block md:min-h-[clamp(280px,34vw,460px)]"
            >
              {/* 사진 블록 — md에서 화면 절반(50vw)을 자기 쪽 끝까지 차지하며 슬라이드 진입 */}
              <motion.div
                variants={slide}
                className={`relative w-full aspect-[4/3] overflow-hidden md:aspect-auto md:absolute md:inset-y-0 md:w-1/2 ${
                  blockLeft ? "md:left-0" : "md:right-0"
                }`}
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(min-width:768px) 50vw, 100vw"
                />
              </motion.div>

              {/* 단계 텍스트 — 반대편 절반 */}
              <div
                className={`relative z-10 flex w-full flex-col justify-center py-10 md:py-0 md:w-1/2 md:min-h-[clamp(280px,34vw,460px)] px-[clamp(24px,6vw,40px)] ${
                  blockLeft
                    ? "md:ml-auto md:pl-[clamp(32px,5vw,80px)] md:pr-[clamp(24px,5vw,72px)]"
                    : "md:mr-auto md:pr-[clamp(32px,5vw,80px)] md:pl-[clamp(24px,5vw,72px)]"
                }`}
              >
                <motion.h3
                  variants={fadeUp}
                  style={{
                    fontSize: "clamp(22px, 2.6vw, 32px)",
                    letterSpacing: "-0.01em",
                    color: "#8a8a8a",
                  }}
                >
                  {s.title}
                </motion.h3>
                <motion.p
                  variants={fadeUp}
                  className="mt-3 text-[15px] md:text-[17px] leading-[1.7]"
                  style={{ color: "#a9a9a9" }}
                >
                  {s.desc}
                </motion.p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 5. 고객 후기
// ═══════════════════════════════════════════════════════════════════

function Testimonial() {
  return (
    <section
      className="py-20 md:py-28"
      style={{ background: "var(--bg-white)", borderBottom: `1px solid ${HAIRLINE}` }}
    >
      <div className="page-container">
        {/* 부모가 whileInView를 구동 → 이미지 reveal도 확실히 발화(독립 motion이면 clipPath가 hidden에 멈추는 버그) */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          {/* 이미지 */}
          <motion.div
            variants={imgReveal}
            className="relative overflow-hidden rounded-sm aspect-[4/5] md:aspect-[3/4]"
          >
            <Image
              src={IMG.review}
              alt="슬런치 구독 멤버 후기"
              fill
              className="object-cover"
              sizes="(min-width:768px) 50vw, 100vw"
            />
          </motion.div>

          {/* 텍스트 */}
          <div className="flex flex-col gap-6">
            <motion.div variants={fadeUp}><Label>Review</Label></motion.div>

            <motion.blockquote
              variants={fadeUp}
              style={{
                fontSize: "clamp(18px, 2.4vw, 24px)",
                lineHeight: 1.55,
                letterSpacing: "-0.01em",
                color: INK,
              }}
            >
              &ldquo;처음엔 &lsquo;내 취향에 맞을까&rsquo; 싶었는데, 일주일이 지나니 &lsquo;이게 편하다&rsquo;는 생각이 먼저 들었어요. 제철 조합이 매번 달라서 질리지 않고, 무엇보다 고민하는 시간이 줄었어요.&rdquo;
            </motion.blockquote>

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 pt-4"
              style={{ borderTop: `1px solid ${HAIRLINE}` }}
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: "var(--bg-off)" }}
              />
              <div>
                <p className="text-[13px]" style={{ color: INK }}>김서연</p>
                <p className="text-[12px]" style={{ color: INK_LIGHT }}>슬런치 구독 멤버 · 서울</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 6. 최종 CTA
// ═══════════════════════════════════════════════════════════════════

function FinalCTA() {
  return (
    <section className="py-24 md:py-32" style={{ background: INK }}>
      <div className="page-container">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5"
        >
          <motion.div variants={fadeUp}>
            <Label light>Get Started</Label>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-white"
            style={{
              fontSize: "clamp(24px, 3.5vw, 40px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            골라 담는 시간을 줄이고,<br />먹는 데 남는 시간을 늘리려고
          </motion.h2>

          <motion.div
            variants={stagger}
            className="flex flex-col gap-3 text-[15px] leading-[1.85] max-w-[30rem] text-center"
            style={{ color: "rgba(255,255,255,0.62)" }}
          >
            <motion.p variants={fadeUp}>
              슬런치는 채식·비건 식단을 하루의 자연스러운 일부로 만드는 브랜드입니다. 한 주의 끼니가 미리 정해지면, 매일의 &lsquo;뭐 먹지&rsquo; 고민이 사라지고 식탁 앞의 시간이 달라져요.
            </motion.p>
            <motion.p variants={fadeUp}>
              주간 식단 구독을 시작하면 <span style={{ color: "rgba(255,255,255,0.9)" }}>14끼</span>가 한 번에 완성됩니다. 밀키트·소스·간편 재료는 <span style={{ color: "rgba(255,255,255,0.9)" }}>스토어</span>에서 구독과 별도로 구매할 수도 있어요.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3 mt-3 w-full sm:w-auto"
          >
            <Link href="/subscribe" className="btn btn-lg btn-primary sm:min-w-[200px]">
              구독 시작하기
            </Link>
            <Link
              href="/store"
              className="btn btn-lg sm:min-w-[200px]"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.28)",
                color: "#ffffff",
              }}
            >
              스토어 둘러보기
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-[12px]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            언제든 해지 가능 · 결제·배송·품목 안내는 각 페이지 기준으로 이어집니다
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// export
// ═══════════════════════════════════════════════════════════════════

export function HomeEditorialContent() {
  return (
    <div className="w-full overflow-x-hidden">
      <HeroBrand />
      <Features />
      <MenuShowcase />
      <HowItWorks />
      <Testimonial />
      <FinalCTA />
    </div>
  );
}
