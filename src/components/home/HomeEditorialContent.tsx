"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
} from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const IMG = {
  hero:           `${BASE}/images/menus/08_roasted_vegetable_lasagna.png`,
  feat1:          `${BASE}/14meals.png`,
  feat2:          `${BASE}/dawn.png`,
  feat3:          `${BASE}/images/menus/15_gochujang_tofu_bowl.png`,
  menu1:          `${BASE}/images/menus/22_avocado_sushi_bowl.png`,
  menu2:          `${BASE}/images/menus/27_roasted_vegetable_quinoa_salad.png`,
  menu3:          `${BASE}/images/menus/04_kale_waldorf_salad.png`,
  menu4:          `${BASE}/images/menus/01_roasted_beet_carpaccio.png`,
  menu5:          `${BASE}/images/menus/29_tofu_poke_bowl.png`,
  menu6:          `${BASE}/images/menus/20_mediterranean_vegetable_pasta.png`,
  menu7:          `${BASE}/images/menus/07_crispy_tofu_steak.png`,
  menu8:          `${BASE}/images/menus/05_mediterranean_quinoa_salad.png`,
  step1:          `${BASE}/images/menus/15_gochujang_tofu_bowl.png`,
  step2:          `${BASE}/images/menus/27_roasted_vegetable_quinoa_salad.png`,
  step3:          `${BASE}/dawn.png`,
  testimonialImg: `${BASE}/images/menus/04_kale_waldorf_salad.png`,
};

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" loading="eager" decoding="async" />
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
    <ParallaxHero src={IMG.hero}>
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
          맛있는 한 끼가<br />거창할 필요는 없어요
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
    img:   IMG.feat1,
    num:   "01",
    title: "하루 2끼 × 7일",
    desc:  "잘 먹고 싶은데 매번 챙기기는 쉽지 않죠. 슬런치 위클리는 하루 2끼, 주 14끼 식단을 매주 새벽에 보내드려요. 식단 고민, 장보기, 칼로리 계산은 저희한테 맡겨두세요.",
  },
  {
    img:   IMG.feat2,
    num:   "02",
    title: "신선 새벽 배송",
    desc:  "매주 월요일 아침, 문 앞까지 신선하게. 재료는 새벽에 출발해요. 월요일 아침에 문을 열면, 일주일이 조금 가벼워질 거예요.",
  },
  {
    img:   IMG.feat3,
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
              <motion.div variants={imgReveal} className="overflow-hidden rounded-sm aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
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

const MENUS = [
  { img: IMG.menu1, name: "아보카도 스시볼",       tag: "비건" },
  { img: IMG.menu2, name: "퀴노아 채소 샐러드",    tag: "채식" },
  { img: IMG.menu3, name: "케일 월도프 샐러드",    tag: "비건" },
  { img: IMG.menu4, name: "구운 비트 카르파치오",   tag: "채식" },
  { img: IMG.menu5, name: "두부 포케볼",            tag: "비건" },
  { img: IMG.menu6, name: "지중해 채소 파스타",     tag: "채식" },
  { img: IMG.menu7, name: "크리스피 두부 스테이크", tag: "비건" },
  { img: IMG.menu8, name: "지중해 퀴노아 샐러드",   tag: "채식" },
];

const CARD_GAP   = 12;   // px
const LOOP_SPEED = 0.055; // px per ms (≈ 18s for ~1000px set)

function MenuShowcase() {
  const singleRef   = useRef<HTMLDivElement>(null);
  const singleW     = useRef(0);
  const x           = useMotionValue(0);
  const hoveredRef  = useRef(false);

  useLayoutEffect(() => {
    if (singleRef.current) {
      singleW.current = singleRef.current.scrollWidth + CARD_GAP;
    }
  }, []);

  useAnimationFrame((_, delta) => {
    if (hoveredRef.current || singleW.current <= 0) return;
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
            이번 주 슬런치 테이블
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-[14px] leading-[1.75] max-w-md"
            style={{ color: INK_LIGHT }}
          >
            같은 메뉴를 반복하는 게 아니라, 같은 취향의 결 위에서 매주 새롭게 이어지는 식탁입니다.
          </motion.p>
        </motion.div>
      </div>

      {/* 슬라이드 트랙 */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => { hoveredRef.current = true; }}
        onMouseLeave={() => { hoveredRef.current = false; }}
      >
        <motion.div
          className="flex"
          style={{ x, gap: `${CARD_GAP}px`, paddingLeft: "20px", willChange: "transform" }}
        >
          {/* 원본 세트 — 폭 측정 기준 */}
          <div ref={singleRef} className="flex" style={{ gap: `${CARD_GAP}px` }}>
            {MENUS.map((m) => (
              <MenuCard key={m.name} m={m} />
            ))}
          </div>
          {/* 복제 세트 — 무한 루프 */}
          <div className="flex" style={{ gap: `${CARD_GAP}px` }}>
            {MENUS.map((m) => (
              <MenuCard key={`dup-${m.name}`} m={m} />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="page-container mt-4 flex justify-end">
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

function MenuCard({ m }: { m: { img: string; name: string; tag: string } }) {
  return (
    <div className="flex-shrink-0 w-[200px] sm:w-[220px]">
      <div className="overflow-hidden rounded-sm aspect-[3/4] mb-3 bg-[var(--bg-off)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.img} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <span
        className="inline-block text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border"
        style={{ color: INK_LIGHT, borderColor: "rgba(37,10,0,0.18)" }}
      >
        {m.tag}
      </span>
      <p className="mt-1.5 text-[14px]" style={{ color: INK }}>{m.name}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 4. 이용 흐름 3단계
// ═══════════════════════════════════════════════════════════════════

const STEPS = [
  {
    num:   "1",
    title: "스피릿 테스트",
    desc:  "마음이 당기는 재료 세 가지를 고르면 나의 식취향이 분석됩니다. 그것이 당신만의 식탁이 시작되는 방식입니다.",
    img:   IMG.step1,
    cta:   { label: "테스트 시작 →", href: "/spirit" },
  },
  {
    num:   "2",
    title: "맞춤 식단 구성",
    desc:  "14끼를 구성할 때, '또 이거야'라는 말이 나오지 않도록 무게와 재료를 나눕니다. 질리지 않는 다양성—그게 슬런치가 식단을 설계하는 방식이에요.",
    img:   IMG.step2,
    cta:   { label: "식단 살펴보기 →", href: "/subscribe" },
  },
  {
    num:   "3",
    title: "월요 새벽 배송",
    desc:  "점심과 저녁이 나란히 정해지고, 배송 날짜가 맞춰지면 한 주가 조용히 완성됩니다. 손이 많이 가는 날도, 5분이 전부인 날도 슬런치는 그 옆에 맞는 한 끼를 미리 준비해 둡니다.",
    img:   IMG.step3,
    cta:   { label: "구독 시작 →", href: "/subscribe" },
  },
];

function HowItWorks() {
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
          className="mb-14"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <div className="overflow-hidden rounded-sm aspect-[4/3] mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-[12px] flex-shrink-0"
                  style={{ background: INK, color: "var(--point)" }}
                >
                  {s.num}
                </span>
                <div className="flex-1 h-px" style={{ background: HAIRLINE }} />
              </div>
              <h3
                className="text-[17px] mb-2"
                style={{ letterSpacing: "-0.01em", color: INK }}
              >
                {s.title}
              </h3>
              <p
                className="text-[14px] leading-[1.75] mb-4 flex-1"
                style={{ color: INK_LIGHT }}
              >
                {s.desc}
              </p>
              <Link
                href={s.cta.href}
                className="text-[13px] underline underline-offset-4 mt-auto"
                style={{ color: INK_LIGHT }}
              >
                {s.cta.label}
              </Link>
            </motion.div>
          ))}
        </div>
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
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* 이미지 */}
          <motion.div
            variants={imgReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="overflow-hidden rounded-sm aspect-[4/5] md:aspect-[3/4]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMG.testimonialImg}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* 텍스트 */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col gap-6"
          >
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
          </motion.div>
        </div>
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
