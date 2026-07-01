'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface CarouselOption {
  label: string;
  value: string;
  description?: string;
  tarot?: { number: string; title: string; image: string };
}

interface Props {
  options: CarouselOption[];
  selectedValues: string[];
  onSelect: (value: string, screenX: number, screenY: number) => void;
  onCenterChange?: (opt: CarouselOption | null) => void;
  isMobile?: boolean;
  isExclusion?: boolean;
  /** 다중선택 스텝: 중앙 공개 없이 제자리 플립 + 면 위 누적. */
  isMulti?: boolean;
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const CARD_BACK = `${BASE}/images/tarot/card-back.png`;

// 뽑기 모션 총 길이(ms) — 이 시점에 onSelect 발화(선택 확정).
const FLIP_MS = 820;

/**
 * 카드 뽑기(Phase 1).
 * - 카드는 위에서 건네주듯 180° 뒤집혀(reversed) 정갈한 일렬로 배치되고, 진입 시 위→아래로 내려온다.
 * - 무엇을 뽑는지는 카드 위 글자가 아니라 하단 리드아웃(정방향)으로 알려준다(설문이므로).
 * - 탭하면 카드가 화면 아래로 쭉 사라졌다가, 앞면으로 뒤집히며 화면 중앙으로 떠올라 배치된다.
 *
 * 기존 TarotCarousel3DSurvey와 props 계약 동일 — 오케스트레이터는 컴포넌트만 교체하면 된다.
 */
export default function TarotFanDraw({
  options,
  selectedValues,
  onSelect,
  onCenterChange,
  isMobile = false,
  isMulti = false,
}: Props) {
  const reduced = useReducedMotion();
  const N = options.length;

  const [drawingValue, setDrawingValue] = useState<string | null>(null);
  const [focusValue, setFocusValue] = useState<string | null>(null);
  const drawTimer = useRef<number | null>(null);

  // 진입 연출: 마운트 시 initial(위쪽) → animate(제자리)로 Framer가 자동 드롭인.
  // entranceDone은 stagger 지연을 진입 직후에만 주기 위한 타이머(이후 뽑기엔 지연 0).
  const [entranceDone, setEntranceDone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setEntranceDone(true), 950);
    return () => window.clearTimeout(t);
  }, []);

  // 카드가 많은 스텝(영양 5장·제외 8장)은 카드를 작게 잡아 더 넓게 펼친다.
  const baseCardW = isMobile ? 104 : 156;
  const CARD_W = Math.round(baseCardW * (N >= 6 ? 0.7 : N >= 4 ? 0.86 : 1));
  const CARD_H = Math.round(CARD_W * 1.449);
  // 정갈한 일렬 — 가능하면 안 겹치게 카드폭+여백, 넓은 가용폭을 넘으면 균등 축소.
  const availW = isMobile ? 340 : 980;
  const gap = isMobile ? 8 : 18;
  const stepX = N > 1 ? Math.min(CARD_W + gap, (availW - CARD_W) / (N - 1)) : 0;
  // 우측 스텝 패널(≈296px) 공간만큼 팬을 왼쪽으로 옮겨 가용 영역 가운데 정렬.
  const centerShiftX = isMobile ? 0 : -150;

  // 뽑기: 아래로 사라지는 깊이 → 다시 중앙으로 떠오르는 위치/크기
  const offDownY = isMobile ? 660 : 780;
  const centerY = isMobile ? 110 : 140;
  const centerScale = isMobile ? 1.34 : 1.5;

  const selected = new Set(selectedValues);

  const focusOpt = options.find((o) => o.value === focusValue) ?? null;
  const selectedOpt = options.find((o) => selected.has(o.value)) ?? null;
  // 리드아웃에 띄울 카드: 호버 중이면 그 카드, 아니면 (단일선택) 선택된 카드.
  const readoutOpt = focusOpt ?? selectedOpt;

  const setFocus = (opt: CarouselOption | null) => {
    setFocusValue(opt?.value ?? null);
    onCenterChange?.(opt);
  };

  const handleDraw = (opt: CarouselOption, x: number, y: number) => {
    // 다중선택: 중앙 공개 모션 없이 즉시 토글(제자리 플립). 빠르게 여러 장 고르기 위함.
    // 단일선택에서 이미 선택된 카드 다시 탭 = 선택 취소 → 역시 즉시 토글.
    if (isMulti || selected.has(opt.value)) {
      onSelect(opt.value, x, y);
      return;
    }
    if (reduced) {
      onSelect(opt.value, x, y);
      return;
    }
    if (drawTimer.current) window.clearTimeout(drawTimer.current);
    setDrawingValue(opt.value);
    setFocus(opt);
    drawTimer.current = window.setTimeout(() => {
      onSelect(opt.value, x, y);
      setDrawingValue(null);
    }, FLIP_MS);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: 1500, touchAction: 'manipulation' }}>
      {/* 라벨 리드아웃(정방향) — 무엇을 뽑는지 알려준다 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: isMobile ? '13%' : '12%',
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
          zIndex: 95,
          transition: 'opacity 0.3s',
          opacity: readoutOpt ? 1 : 0.5,
        }}
      >
        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#D5FE00', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {readoutOpt ? readoutOpt.label : '카드를 골라 뽑아보세요'}
        </div>
        {readoutOpt?.description ? (
          <div style={{ marginTop: 8, fontSize: isMobile ? 12 : 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
            {readoutOpt.description}
          </div>
        ) : null}
      </div>

      {/* 카드 */}
      {options.map((opt, i) => {
        const offset = i - (N - 1) / 2;
        const baseX = centerShiftX + offset * stepX;
        const reversedRot = 180; // 카드 자체 반전(위에서 건네주는 시점). 일렬이라 기울임 없음.
        const isDrawing = drawingValue === opt.value;
        const isSelected = selected.has(opt.value);
        const isRevealed = isSelected || isDrawing;
        const isFocus = focusValue === opt.value && !drawingValue;

        const aboveY = -480; // 진입 전 — 화면 위쪽
        // 단일선택: 앞면으로 (패널 제외) 가용 영역 중앙에 크게 공개.
        const centerState = { x: centerShiftX, y: centerY, rotate: 0, scale: centerScale, zIndex: 90, opacity: 1 };
        // 다중선택: 중앙으로 안 가고 제자리(행)에서 앞면으로 펼쳐 누적(똑바로·살짝 위로·글로우).
        const rowSelectedState = { x: baseX, y: isMobile ? -8 : -10, rotate: 0, scale: 1.06, zIndex: 55, opacity: 1 };
        const restState = isDrawing
          ? // 뽑기 4단계: ① 회전 없이 똑바로 아래로 내려가 사라짐(0→0.38)
            // ② 화면 밖에서 잠깐 멈춰 un-reverse + 앞면으로 뒤집기(0.38→0.55)
            // ③ 똑바로(회전 없이) 위로 올라와 화면 중앙에 배치(0.55→1)
            {
              x: [baseX, baseX, centerShiftX, centerShiftX],
              y: [0, offDownY, offDownY, centerY],
              rotate: [reversedRot, reversedRot, 0, 0],
              scale: [1, 0.92, 0.92, centerScale],
              zIndex: 100,
              opacity: 1,
            }
          : isSelected
            ? (isMulti ? rowSelectedState : centerState)
            : { x: baseX, y: isFocus ? (isMobile ? 16 : 22) : 0, rotate: reversedRot, scale: isFocus ? 1.06 : 1, zIndex: isFocus ? 70 : 10 + i, opacity: 1 };
        const cardTransition = isDrawing
          ? { duration: 0.8, ease: 'easeInOut' as const, times: [0, 0.26, 0.46, 1] }
          : { type: 'spring' as const, stiffness: 260, damping: 24, mass: 0.7, delay: entranceDone ? 0 : i * 0.06 };

        return (
          <motion.button
            key={opt.value}
            type="button"
            aria-label={`${opt.label}${isSelected ? ' (선택됨)' : ''}`}
            aria-pressed={isSelected}
            onPointerEnter={() => { if (!isMobile && !drawingValue) setFocus(opt); }}
            onPointerLeave={() => { if (!isMobile) setFocus(null); }}
            onClick={(e) => handleDraw(opt, e.clientX, e.clientY)}
            initial={{ x: baseX, y: aboveY, rotate: reversedRot, scale: 0.95, opacity: 0 }}
            animate={restState}
            transition={cardTransition}
            style={{
              position: 'absolute',
              left: '50%',
              top: isMobile ? '15%' : '16%',
              width: CARD_W,
              height: CARD_H,
              marginLeft: -CARD_W / 2,
              transformOrigin: '50% 50%',
              transformStyle: 'preserve-3d',
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* 플립퍼 — 뽑을 때는 떠오르는 구간(0.55s 이후)에 앞면으로 뒤집힌다 */}
            <motion.div
              style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
              initial={false}
              animate={{ rotateY: isRevealed ? 180 : 0 }}
              transition={isDrawing ? { duration: 0.16, delay: 0.23, ease: 'easeInOut' } : { type: 'spring', stiffness: 220, damping: 20 }}
            >
              {/* 뒷면 */}
              <CardFace img={CARD_BACK} isFront={false} />
              {/* 앞면 (뽑혀서 공개되는 타로 일러스트) */}
              <CardFace img={opt.tarot?.image} isFront selected={isSelected} />
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}

function CardFace({
  img,
  isFront,
  selected = false,
}: {
  img?: string;
  isFront: boolean;
  selected?: boolean;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 14,
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isFront ? 'rotateY(180deg)' : 'none',
        border: selected ? '1.5px solid rgba(220,253,74,0.85)' : '1.5px solid rgba(255,255,255,0.14)',
        boxShadow: selected
          ? '0 0 32px rgba(220,253,74,0.6), 0 10px 32px rgba(0,0,0,0.5)'
          : '0 12px 40px rgba(0,0,0,0.5)',
        background: '#1a0a05',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img ? <img src={img} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}

      {/* 앞면 선택 체크 */}
      {isFront && selected && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#dcfd4a',
            color: '#250a00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}
