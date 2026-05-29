'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useMotionValue, animate } from 'framer-motion';

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
  titleRef?: React.RefObject<HTMLDivElement | null>;
  labelRef?: React.RefObject<HTMLDivElement | null>;
  hoverTitleRef?: React.RefObject<HTMLDivElement | null>;
  hoverLabelRef?: React.RefObject<HTMLDivElement | null>;
  hoverDescRef?: React.RefObject<HTMLDivElement | null>;
  hoverPanelRef?: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
  isExclusion?: boolean;
}

const DRAG_SENS         = 175;  // px per card step
const SWIPE_UP_THRESHOLD = 70;  // px to trigger mobile selection
const FLOAT_AMP         = 4;    // px, vertical bob amplitude
const FLOAT_SPD         = 0.001; // rad/ms

// Shortest-path circular offset: maps rawOff into (-N/2, N/2]
function circularOff(rawOff: number, N: number): number {
  return rawOff - N * Math.round(rawOff / N);
}

export default function TarotCarousel3DSurvey({
  options, selectedValues, onSelect, onCenterChange,
  titleRef, labelRef,
  hoverTitleRef, hoverLabelRef, hoverDescRef, hoverPanelRef,
  isMobile, isExclusion,
}: Props) {
  const N = options.length;
  const isMobileLayout = isMobile ?? false;

  // Layout constants (derived from isMobile, stable for the component lifetime)
  const CARD_W     = isMobileLayout ? 157 : 210;
  const CARD_H     = Math.round(CARD_W * 1.449); // standard tarot aspect ratio
  const X_STEP     = isMobileLayout ? 140 : 240;  // slightly tighter gap
  const BASE_SCALE = isMobileLayout ? 0.72 : 1.0;
  const SCALE_DROP = 0.12;
  const ROT_Y_DROP = 22;   // degrees per offset step
  const DIM_DROP   = 0.22;

  const containerRef    = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const checkRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const descRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const descTitleRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const descTextRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const selectedRef     = useRef(new Set(selectedValues));
  const onSelectRef     = useRef(onSelect);
  const centerIdxRef    = useRef(0);
  const isDraggingRef   = useRef(false);
  const hasMovedRef     = useRef(false);
  const dragStartXRef   = useRef(0);
  const dragStartYRef   = useRef(0);
  const dragStartPosRef = useRef(0);
  const gestureRef      = useRef<'none' | 'h' | 'v'>('none');
  const verticalPullRef = useRef(0);
  const animCtrlRef     = useRef<{ stop: () => void } | null>(null);
  // pointerdown 시점에 어떤 카드가 클릭됐는지 기록 — 카드 위에서만 탭이 인식됨
  const tappedCardIdxRef = useRef(-1);

  // Framer-motion motion value: continuous floating-point carousel position
  const position = useMotionValue(0);

  useEffect(() => { selectedRef.current = new Set(selectedValues); }, [selectedValues]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  const updatePanel = useCallback((idx: number) => {
    const i = ((Math.round(idx) % N) + N) % N;
    const opt = options[i];
    if (!opt) return;
    onCenterChange?.(opt);
    if (hoverTitleRef?.current)  hoverTitleRef.current.textContent   = '';
    if (hoverLabelRef?.current)  hoverLabelRef.current.textContent   = opt.label;
    if (hoverDescRef?.current)   hoverDescRef.current.textContent    = opt.description ?? '';
    if (hoverPanelRef?.current)  hoverPanelRef.current.style.opacity = '1';
    if (titleRef?.current)       titleRef.current.textContent        = opt.tarot?.title ?? opt.label;
    if (labelRef?.current)       labelRef.current.textContent        = opt.label;
  }, [options, N, onCenterChange, hoverTitleRef, hoverLabelRef, hoverDescRef, hoverPanelRef, titleRef, labelRef]);

  // Initial panel content
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { updatePanel(centerIdxRef.current); }, []);

  // rAF loop — reads framer-motion position value, applies CSS transforms imperatively
  useEffect(() => {
    if (N === 0) return;
    let raf: number;
    const t0 = performance.now();

    const tick = () => {
      const t   = (performance.now() - t0) * FLOAT_SPD;
      const pos = position.get();

      cardRefs.current.forEach((el, i) => {
        if (!el || i >= N) return;

        const rawOff = i - pos;
        const vOff   = circularOff(rawOff, N);
        const dist   = Math.abs(vOff);

        // Hide cards that are too far away
        if (dist > N / 2 + 0.5) {
          el.style.opacity      = '0';
          el.style.pointerEvents = 'none';
          return;
        }

        const floatY    = isDraggingRef.current ? 0 : Math.sin(t * 0.8 + i * 0.8) * FLOAT_AMP;
        const x         = vOff * X_STEP;
        const scale     = Math.max(isMobileLayout ? 0.3 : 0.4, (1 - dist * SCALE_DROP) * BASE_SCALE);
        const rotY      = -Math.max(-55, Math.min(55, vOff)) * ROT_Y_DROP;
        const brightness = Math.max(0.3, 1 - dist * DIM_DROP);
        const zIndex    = Math.round(50 - dist * 10);
        const isCenter  = dist < 0.5;
        const selected  = selectedRef.current.has(options[i]?.value ?? '');

        el.style.transform    = `translateX(${x}px) translateY(${floatY}px) rotateY(${rotY}deg) scale(${scale})`;
        el.style.filter       = `brightness(${brightness})`;
        el.style.zIndex       = String(zIndex);
        el.style.opacity      = dist < 3.5 ? '1' : '0';
        el.style.pointerEvents = dist < 2.5 ? 'auto' : 'none';

        // 카드 하단 설명 — 회전 없이 카드의 x/floatY/scale만 따라감 (텍스트는 읽기 좋게 평면 유지)
        const descEl = descRefs.current[i];
        if (descEl) {
          descEl.style.transform = `translateX(${x}px) translateY(${floatY}px) scale(${scale})`;
          // center 카드에 가까울수록 진하게, 멀어질수록 흐려짐
          const descOpacity = Math.max(0, 1 - dist * 0.38);
          descEl.style.opacity = String(dist < 3 ? descOpacity : 0);
          descEl.style.zIndex = String(zIndex);
        }

        // 라벨/설명 색상 — 가운데 카드만 point 컬러, 나머지는 ink 컬러
        const titleEl = descTitleRefs.current[i];
        const textEl  = descTextRefs.current[i];
        if (titleEl) titleEl.style.color = isCenter ? '#D5FE00' : '#250a00';
        if (textEl)  textEl.style.color  = isCenter ? 'rgba(213,254,0,0.7)' : 'rgba(37,10,0,0.7)';

        // 체크 마크 — 선택된 카드(중앙/사이드 무관)에 표시
        const checkEl = checkRefs.current[i];
        if (checkEl) checkEl.style.opacity = selected ? '1' : '0';

        // Overlay (exclusion mode) vs glow (normal mode)
        const overlayEl = overlayRefs.current[i];
        if (isExclusion) {
          if (overlayEl) overlayEl.style.opacity = selected ? '0.5' : '0';
          el.style.boxShadow   = isCenter ? '0 10px 48px rgba(0,0,0,0.55)' : 'none';
          el.style.borderColor = isCenter ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)';
        } else {
          if (overlayEl) overlayEl.style.opacity = '0';
          if (isCenter && selected) {
            el.style.boxShadow   = '0 0 36px rgba(220,253,74,0.75), 0 0 10px rgba(220,253,74,0.45)';
            el.style.borderColor = 'rgba(220,253,74,0.85)';
          } else if (isCenter) {
            el.style.boxShadow   = '0 10px 48px rgba(0,0,0,0.55)';
            el.style.borderColor = 'rgba(255,255,255,0.18)';
          } else if (selected) {
            el.style.boxShadow   = '0 0 18px rgba(220,253,74,0.45)';
            el.style.borderColor = 'rgba(220,253,74,0.65)';
          } else {
            el.style.boxShadow   = 'none';
            el.style.borderColor = 'rgba(255,255,255,0.06)';
          }
        }
      });

      // Swipe-hint visibility during vertical drag
      const hintEl = containerRef.current?.querySelector<HTMLElement>('[data-swipe-hint]');
      if (hintEl) {
        hintEl.style.opacity = (isDraggingRef.current && gestureRef.current === 'v') ? '0' : '0.65';
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [N, X_STEP, BASE_SCALE, SCALE_DROP, ROT_Y_DROP, DIM_DROP, isMobileLayout, position, options, isExclusion]);

  // Snap to a card index using framer-motion spring animation
  const snapTo = useCallback((rawIdx: number) => {
    const idx = ((rawIdx % N) + N) % N;

    const currentPos = position.get();
    const diff   = circularOff(idx - currentPos, N);
    const target = currentPos + diff;

    if (animCtrlRef.current) animCtrlRef.current.stop();
    animCtrlRef.current = animate(position, target, {
      type:      'spring',
      stiffness: 220,
      damping:   30,
      mass:      0.7,
      onComplete: () => {
        position.set(((Math.round(target) % N) + N) % N);
      },
    });

    centerIdxRef.current = idx;
    updatePanel(idx);
  }, [N, position, updatePanel]);

  // Pointer event handling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      // pointerdown이 실제로 어떤 카드 위에 떨어졌는지 기록 — 빈 공간 탭은 무시한다
      tappedCardIdxRef.current = -1;
      const target = e.target as Node;
      for (let i = 0; i < N; i++) {
        const cardEl = cardRefs.current[i];
        if (cardEl && cardEl.contains(target)) {
          tappedCardIdxRef.current = i;
          break;
        }
      }

      isDraggingRef.current   = true;
      hasMovedRef.current     = false;
      dragStartXRef.current   = e.clientX;
      dragStartYRef.current   = e.clientY;
      dragStartPosRef.current = position.get();
      gestureRef.current      = 'none';
      verticalPullRef.current = 0;
      if (animCtrlRef.current) animCtrlRef.current.stop();
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      const dy = e.clientY - dragStartYRef.current;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) hasMovedRef.current = true;
      if (!hasMovedRef.current) return;

      // Lock gesture direction once the user has moved far enough
      if (gestureRef.current === 'none' && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        gestureRef.current = (isMobileLayout && Math.abs(dy) > Math.abs(dx)) ? 'v' : 'h';
      }

      if (gestureRef.current === 'h') {
        // Update the framer-motion value directly — rAF loop reads it every frame
        position.set(dragStartPosRef.current - dx / DRAG_SENS);
      } else if (gestureRef.current === 'v') {
        verticalPullRef.current = Math.max(0, -dy);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (!hasMovedRef.current) {
        // Tap: pointerdown 때 기록해둔 카드 인덱스로만 처리 (빈 공간 탭은 -1 → 무시)
        const idx = tappedCardIdxRef.current;
        if (idx >= 0 && idx < N) {
          const opt = options[idx];
          // 카드가 중앙에 없으면 먼저 스냅, 즉시 선택 — 한 번 탭으로 선택까지
          if (idx !== centerIdxRef.current) snapTo(idx);
          onSelectRef.current(opt.value, e.clientX, e.clientY);
        }
      } else if (gestureRef.current === 'v') {
        if (verticalPullRef.current >= SWIPE_UP_THRESHOLD) {
          const centerOpt = options[centerIdxRef.current];
          if (centerOpt) {
            onSelectRef.current(centerOpt.value, e.clientX, e.clientY);
          }
        }
        verticalPullRef.current = 0;
      } else {
        // Momentum snap: use framer-motion's velocity for natural deceleration
        const vel       = position.getVelocity(); // units per second
        const rawTarget = position.get() + vel * 0.1;
        const snapped   = Math.round(rawTarget);
        const target    = ((snapped % N) + N) % N;
        snapTo(target);
      }

      gestureRef.current      = 'none';
      verticalPullRef.current = 0;
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [N, X_STEP, isMobileLayout, position, options, snapTo]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        // 배경 위에서는 기본 커서 — 카드 위에서만 pointer로 바뀐다 (개별 카드의 cursor: pointer)
        cursor: 'default',
        touchAction: 'none',
        overflow: 'hidden',
        background: 'transparent',
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* Cards — imperatively transformed by the rAF loop */}
      {options.map((opt, i) => (
        <div key={opt.value}>
          <div
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position:   'absolute',
              left:       '50%',
              top:        isMobileLayout ? '53%' : '45%',
              marginLeft: -CARD_W / 2,
              marginTop:  -CARD_H / 2,
              width:      CARD_W,
              height:     CARD_H,
              borderRadius: 14,
              overflow:   'hidden',
              border:     '1.5px solid rgba(255,255,255,0.12)',
              willChange: 'transform, filter, opacity',
              cursor:     'pointer',
              userSelect: 'none',
              transition: 'border-color 0.25s, box-shadow 0.25s',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={opt.tarot?.image}
              alt={opt.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable={false}
            />
            {/* Exclusion overlay — opacity controlled imperatively by rAF */}
            <div
              ref={(el) => { overlayRefs.current[i] = el; }}
              style={{
                position: 'absolute', inset: 0,
                background: '#250a00',
                opacity: 0,
                transition: 'opacity 0.25s',
                pointerEvents: 'none',
              }}
            />
            {/* 선택 체크 표시 — selected 카드에만 표시 (rAF가 opacity 토글) */}
            <div
              ref={(el) => { checkRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: '#dcfd4a',
                color: '#250a00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 800,
                lineHeight: 1,
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.18s ease-out, transform 0.18s ease-out',
                boxShadow: '0 2px 10px rgba(0,0,0,0.45), 0 0 12px rgba(220,253,74,0.55)',
                zIndex: 3,
              }}
            >
              ✓
            </div>
          </div>
          {/* 카드 하단 라벨 + 설명 — rAF로 각 카드 위치 따라 움직이며 항상 표시 */}
          <div
            ref={(el) => { descRefs.current[i] = el; }}
            style={{
              position:      'absolute',
              left:          '50%',
              top:           isMobileLayout ? '53%' : '45%',
              marginLeft:    -(isMobileLayout ? 150 : 200) / 2,
              marginTop:     CARD_H / 2 + 16, // 카드 하단 + 16px gap
              width:         isMobileLayout ? 150 : 200,
              textAlign:     'center',
              pointerEvents: 'none',
              userSelect:    'none',
              willChange:    'transform, opacity',
            }}
          >
            <div
              ref={(el) => { descTitleRefs.current[i] = el; }}
              style={{
                fontSize:      isMobileLayout ? 15 : 17,
                fontWeight:    700,
                color:         '#250a00',
                letterSpacing: '-0.01em',
                lineHeight:    1.2,
                marginBottom:  6,
              }}
            >
              {opt.label}
            </div>
            {opt.description ? (
              <div
                ref={(el) => { descTextRefs.current[i] = el; }}
                style={{
                  fontSize:   isMobileLayout ? 11 : 12.5,
                  lineHeight: 1.45,
                  color:      'rgba(37,10,0,0.7)',
                  letterSpacing: '0.005em',
                }}
              >
                {opt.description}
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {/* 라디얼 비넷 — 사용자 요청으로 제거됨 (배경은 #868686 단색) */}

      {/* Swipe-up hint — mobile only */}
      <div
        data-swipe-hint
        aria-hidden
        style={{
          position:       'absolute',
          top:            '34%',
          left:           '50%',
          transform:      'translateX(-50%)',
          display:        isMobile ? 'flex' : 'none',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            3,
          pointerEvents:  'none',
          zIndex:         12,
          opacity:        0.65,
          transition:     'opacity 0.2s',
        }}
      >
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path
            d="M9 20V2M9 2L2 9M9 2L16 9"
            stroke="#D5FE00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{
          fontSize:      10,
          color:         'rgba(213,254,0,0.6)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight:    600,
        }}>
          선택
        </span>
      </div>

      {/* Grain overlay */}
      <div
        aria-hidden
        style={{
          position:            'absolute',
          inset:               0,
          pointerEvents:       'none',
          zIndex:              9,
          backgroundImage:     "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundRepeat:    'repeat',
          backgroundSize:      '256px 256px',
          opacity:             0.10,
          mixBlendMode:        'overlay',
        }}
      />
    </div>
  );
}
