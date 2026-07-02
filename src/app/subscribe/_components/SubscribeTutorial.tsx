"use client";

import { useEffect, useRef, useState } from "react";

interface Step {
  target: "menu" | "schedule";
  title: string;
  desc: string;
  button: string;
}

/** 카드 타로를 거쳐 진입했을 때: 완성된 스케줄 → 수정 안내 */
const SPIRIT_STEPS: Step[] = [
  {
    target: "schedule",
    title: "구독이 완성되었습니다",
    desc: "추천 식단으로 스케줄을 자동으로 채웠어요.",
    button: "다음",
  },
  {
    target: "menu",
    title: "메뉴가 마음에 안 드시나요?",
    desc: "왼쪽 식단에서 원하는 메뉴로 자유롭게 수정할 수 있어요.",
    button: "시작하기",
  },
];

/** 타로 없이 직접 진입했을 때: 메뉴 추가 방법 안내 */
const DIRECT_STEPS: Step[] = [
  {
    target: "menu",
    title: "여기서 식단을 골라요",
    desc: "메뉴를 클릭하면 상세 정보를 보고 담을 수 있어요. 바로 담으려면 카드의 + 버튼을 누르세요.",
    button: "다음",
  },
  {
    target: "schedule",
    title: "그러면 여기에 담겨요",
    desc: "추가한 메뉴가 오른쪽 구독 스케줄에 채워져요.",
    button: "시작하기",
  },
];

const DIM = "rgba(0,0,0,0.4)";
/**
 * 직접 진입 튜토리얼 노출 여부 — 모듈 메모리(페이지 로드당 1회).
 * 하드 리로드 시 모듈이 다시 평가되어 초기화 → 다시 노출.
 * 같은 세션 내 SPA 네비게이션으로 재진입할 때는 반복 노출하지 않는다.
 */
let directTutorialShown = false;

/**
 * 구독 페이지 스포트라이트 튜토리얼.
 * - 카드 타로 경유(sessionStorage 'spirit-tutorial') → SPIRIT_STEPS
 * - 타로 없이 직접 진입(첫 1회) → DIRECT_STEPS
 * 강조 영역(data-tutorial) 외 화면을 어둡게 덮어 시선을 유도한다. 데스크톱 2열 레이아웃 전용.
 */
export function SubscribeTutorial() {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  // StrictMode의 effect 이중 실행에도 결정이 1회만 일어나게 하는 가드.
  // (가드 없이 플래그를 지우면 두 번째 실행 때 플래그가 사라져 모드가 잘못 선택된다.)
  const decidedRef = useRef(false);

  // 모드 결정 + 시작 (데스크톱 전용, 마운트당 1회)
  useEffect(() => {
    if (decidedRef.current) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const fromSpirit = sessionStorage.getItem("spirit-tutorial") === "1";
    let chosen: Step[] | null = null;
    if (fromSpirit) chosen = SPIRIT_STEPS;
    else if (!directTutorialShown) chosen = DIRECT_STEPS;
    if (!chosen) return;
    decidedRef.current = true;
    // 결정한 뒤에만 플래그를 소비한다.
    if (fromSpirit) sessionStorage.removeItem("spirit-tutorial");
    else directTutorialShown = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSteps(chosen);
  }, []);

  // 현재 스텝 타깃 위치 측정 (스텝 변경/리사이즈 시)
  useEffect(() => {
    if (!steps) return;
    const target = steps[step].target;
    const measure = () => {
      const el = document.querySelector(`[data-tutorial="${target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [steps, step]);

  if (!steps || !rect) return null;

  const s = steps[step];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dimBox = (style: React.CSSProperties): React.CSSProperties => ({
    position: "fixed",
    background: DIM,
    transition: "all 0.25s ease",
    ...style,
  });

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSteps(null);
      setRect(null);
      setStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[150]" aria-live="polite">
      {/* 강조 영역 주변 4면 딤 (영역 자체는 또렷이 노출) */}
      <div style={dimBox({ top: 0, left: 0, width: vw, height: Math.max(0, rect.top) })} />
      <div style={dimBox({ top: rect.bottom, left: 0, width: vw, height: Math.max(0, vh - rect.bottom) })} />
      <div style={dimBox({ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height })} />
      <div style={dimBox({ top: rect.top, left: rect.right, width: Math.max(0, vw - rect.right), height: rect.height })} />

      {/* 강조 링 */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: "inset 0 0 0 2px #000",
          transition: "all 0.25s ease",
        }}
      />

      {/* 안내 카드 — 강조 영역 중앙 (영역이 화면보다 길면 뷰포트 안으로 클램프) */}
      <div
        className="fixed z-[152]"
        style={{
          top: Math.max(160, Math.min(rect.top + rect.height / 2, vh - 180)),
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="w-[300px] max-w-[80vw] text-center"
          style={{
            background: "var(--bg-white, #fff)",
            border: "1px solid var(--ink, #250a00)",
            borderRadius: "var(--r-modal, 16px)",
            padding: "24px 22px",
            boxShadow: "0 12px 32px rgba(26,10,5,0.28)",
          }}
        >
          <p className="text-[16px] font-bold mb-2" style={{ color: "var(--ink, #250a00)" }}>
            {s.title}
          </p>
          <p className="text-[13px] leading-[1.6] mb-5" style={{ color: "var(--ink-light, #6e5035)" }}>
            {s.desc}
          </p>
          <button type="button" onClick={next} className="btn btn-dark btn-lg w-full">
            {s.button}
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === step ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === step ? "var(--ink, #250a00)" : "rgba(37,10,0,0.2)",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
