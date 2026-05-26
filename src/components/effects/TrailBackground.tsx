"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Biologic Elements 트레일 배경
 *
 * 마우스 움직임을 따라 셀(metaball)이 생성되어 잠시 머물다가 살짝
 * 떨어지면서 사라진다. 가까운 셀은 다크그린 외곽이 합쳐지고, 떨어진
 * 셀끼리는 얇은 회녹색 선으로 이어진다. 내부 색은 생성 시 라임이고
 * fade 중 틸로 전이한다.
 *
 * 메인 페이지, 스피릿 페이지 등 어디든 배경으로 깔 수 있도록 추출한 공용
 * 컴포넌트. 부모 컨테이너는 `position: relative` 같이 위치 컨텍스트가
 * 있어야 하며, 본 컴포넌트는 `absolute inset-0`로 채운다.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

// 색
const OUTER_COLOR = "#2D5A27";
const MID_LIME_RGB = [168, 214, 50] as const;   // #a8d632
const MID_TEAL_RGB = [50, 214, 196] as const;   // #32d6c4
const COLOR_TRANSITION_END = 0.6;

// 파티클
const PARTICLE_LIFETIME_MS = 3500;
const PARTICLE_HOLD_RATIO = 0.25;
const PARTICLE_BIRTH_RATIO = 0.09;   // birth fade-in/scale-in 구간 (~315ms)
const PARTICLE_BIRTH_SCALE_FROM = 0.55;
const PARTICLE_SPAWN_DIST = 50;
const PARTICLE_OUTER_R = 48.75;
const PARTICLE_MID_R = 28.75;
const PARTICLE_CORE_R = 12.5;
const PARTICLE_SIZE_VARIANCE = 0.1;
const PARTICLE_JITTER = 5;
const MAX_PARTICLES = 110;

// goo (외곽 metaball)
const GOO_BLUR_STD = 7;
const GOO_THRESHOLD_MULT = 19;
const GOO_THRESHOLD_OFFSET = -9;
const GOO_POST_BLUR_STD = 2.2;

// mid
const MID_BLUR_STD = 4.4;

// 그레인
const GRAIN_OPACITY = 0.45;

// 가장자리 dispersion
const EDGE_NOISE_FREQ = 0.7;
const EDGE_DISPLACE_OUTER = 14;
const EDGE_DISPLACE_MID = 6;

// 시간에 따른 드리프트
const DRIFT_VY = 12;
const DRIFT_VY_VARIANCE = 4;
const DRIFT_VX_RANGE = 3;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  birthTime: number;
  outerR: number;
  midR: number;
  coreR: number;
}

export interface TrailBackgroundProps {
  /** 배경 색. undefined면 transparent (부모 배경 노출). 기본 #868686 */
  bgColor?: string | null;
  /** 추가 className */
  className?: string;
}

export function TrailBackground({ bgColor = "#868686", className }: TrailBackgroundProps) {
  // useId는 SSR/CSR 동일한 값을 보장 — 같은 페이지에 여러 인스턴스가 떠도 충돌 없음
  const reactId = useId();
  const idPrefix = `trail-${reactId.replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const outerGroupRef = useRef<SVGGElement>(null);
  const midGroupRef = useRef<SVGGElement>(null);
  const coreGroupRef = useRef<SVGGElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef({ x: -9999, y: -9999 });
  const outerCirclesRef = useRef<SVGCircleElement[]>([]);
  const midCirclesRef = useRef<SVGCircleElement[]>([]);
  const coreCirclesRef = useRef<SVGCircleElement[]>([]);

  // SVG 풀 사전 생성
  useEffect(() => {
    const outerG = outerGroupRef.current;
    const midG = midGroupRef.current;
    const coreG = coreGroupRef.current;
    if (!outerG || !midG || !coreG) return;
    const outers: SVGCircleElement[] = [];
    const mids: SVGCircleElement[] = [];
    const cores: SVGCircleElement[] = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const outer = document.createElementNS(SVG_NS, "circle");
      outer.setAttribute("fill", OUTER_COLOR);
      outer.setAttribute("opacity", "0");
      outerG.appendChild(outer);
      outers.push(outer);

      const mid = document.createElementNS(SVG_NS, "circle");
      mid.setAttribute("fill", "#a8d632");
      mid.setAttribute("opacity", "0");
      midG.appendChild(mid);
      mids.push(mid);

      const core = document.createElementNS(SVG_NS, "circle");
      core.setAttribute("fill", "#a8d632");
      core.setAttribute("opacity", "0");
      coreG.appendChild(core);
      cores.push(core);
    }
    outerCirclesRef.current = outers;
    midCirclesRef.current = mids;
    coreCirclesRef.current = cores;
  }, []);

  // 마우스 + RAF
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      // 컨테이너 기준 로컬 좌표 계산 (헤더 등으로 viewport 오프셋이 있는 페이지에서도 정확히 마우스 위치에 표시)
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const last = lastSpawnRef.current;
      const dist = Math.hypot(localX - last.x, localY - last.y);
      if (dist < PARTICLE_SPAWN_DIST) return;
      const variance = 1 - PARTICLE_SIZE_VARIANCE + Math.random() * PARTICLE_SIZE_VARIANCE * 2;
      const ps = particlesRef.current;
      ps.push({
        x: localX + (Math.random() - 0.5) * PARTICLE_JITTER * 2,
        y: localY + (Math.random() - 0.5) * PARTICLE_JITTER * 2,
        vx: (Math.random() - 0.5) * DRIFT_VX_RANGE * 2,
        vy: DRIFT_VY + (Math.random() - 0.5) * DRIFT_VY_VARIANCE * 2,
        birthTime: performance.now(),
        outerR: PARTICLE_OUTER_R * variance,
        midR: PARTICLE_MID_R * variance,
        coreR: PARTICLE_CORE_R * variance,
      });
      if (ps.length > MAX_PARTICLES) ps.shift();
      lastSpawnRef.current = { x: localX, y: localY };
    };

    let raf = 0;
    const draw = () => {
      const now = performance.now();
      const ps = particlesRef.current;
      const outers = outerCirclesRef.current;
      const mids = midCirclesRef.current;
      const cores = coreCirclesRef.current;

      // 죽은 셀 제거
      for (let i = ps.length - 1; i >= 0; i--) {
        if (now - ps[i].birthTime > PARTICLE_LIFETIME_MS) ps.splice(i, 1);
      }

      // 셀 업데이트 (3 layer)
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const outer = outers[i];
        const mid = mids[i];
        const core = cores[i];
        if (!outer || !mid || !core) continue;
        if (i < ps.length) {
          const p = ps[i];
          const age = (now - p.birthTime) / PARTICLE_LIFETIME_MS;

          // Birth(부드러운 등장): 처음 PARTICLE_BIRTH_RATIO 구간에서 opacity 0→1, scale FROM→1
          // 그 이후 PARTICLE_HOLD_RATIO까지는 hold, 그 이후로 선형 fade-out
          let opacity: number;
          let scaleMult: number;
          if (age < PARTICLE_BIRTH_RATIO) {
            const t = age / PARTICLE_BIRTH_RATIO;
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            opacity = eased;
            scaleMult = PARTICLE_BIRTH_SCALE_FROM + (1 - PARTICLE_BIRTH_SCALE_FROM) * eased;
          } else {
            const remaining = 1 - age;
            const tailWindow = 1 - PARTICLE_HOLD_RATIO;
            opacity = Math.max(0, Math.min(1, remaining / tailWindow));
            scaleMult = 1;
          }

          const elapsedSec = (now - p.birthTime) / 1000;
          const renderX = p.x + p.vx * elapsedSec;
          const renderY = p.y + p.vy * elapsedSec;
          const cx = String(renderX);
          const cy = String(renderY);
          // lime → teal 전이
          const colorT = Math.max(
            0,
            Math.min(1, (age - PARTICLE_HOLD_RATIO) / (COLOR_TRANSITION_END - PARTICLE_HOLD_RATIO)),
          );
          const cr = Math.round(MID_LIME_RGB[0] + (MID_TEAL_RGB[0] - MID_LIME_RGB[0]) * colorT);
          const cg = Math.round(MID_LIME_RGB[1] + (MID_TEAL_RGB[1] - MID_LIME_RGB[1]) * colorT);
          const cb = Math.round(MID_LIME_RGB[2] + (MID_TEAL_RGB[2] - MID_LIME_RGB[2]) * colorT);
          const innerFill = `rgb(${cr},${cg},${cb})`;

          outer.setAttribute("cx", cx);
          outer.setAttribute("cy", cy);
          outer.setAttribute("r", String(p.outerR * scaleMult));
          outer.setAttribute("opacity", String(opacity));
          mid.setAttribute("cx", cx);
          mid.setAttribute("cy", cy);
          mid.setAttribute("r", String(p.midR * scaleMult));
          mid.setAttribute("fill", innerFill);
          mid.setAttribute("opacity", String(opacity));
          core.setAttribute("cx", cx);
          core.setAttribute("cy", cy);
          core.setAttribute("r", String(p.coreR * scaleMult));
          core.setAttribute("fill", innerFill);
          core.setAttribute("opacity", String(opacity * 0.95));
        } else {
          outer.setAttribute("opacity", "0");
          mid.setAttribute("opacity", "0");
          core.setAttribute("opacity", "0");
        }
      }

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className ?? ""}`}
      style={bgColor ? { background: bgColor } : undefined}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`${idPrefix}-goo-outer`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={GOO_BLUR_STD} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${GOO_THRESHOLD_MULT} ${GOO_THRESHOLD_OFFSET}`}
              result="goo"
            />
            <feGaussianBlur in="goo" stdDeviation={GOO_POST_BLUR_STD} result="softened" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={EDGE_NOISE_FREQ}
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="softened"
              in2="noise"
              scale={EDGE_DISPLACE_OUTER}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id={`${idPrefix}-mid-soft`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={MID_BLUR_STD} result="blurred" />
            <feTurbulence
              type="fractalNoise"
              baseFrequency={EDGE_NOISE_FREQ}
              numOctaves="2"
              seed="7"
              result="midNoise"
            />
            <feDisplacementMap
              in="blurred"
              in2="midNoise"
              scale={EDGE_DISPLACE_MID}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id={`${idPrefix}-core-glow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="halo" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="halo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${idPrefix}-grain`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.6" />
            </feComponentTransfer>
          </filter>
        </defs>
        <g ref={outerGroupRef} filter={`url(#${idPrefix}-goo-outer)`} />
        <g ref={midGroupRef} filter={`url(#${idPrefix}-mid-soft)`} />
        <g ref={coreGroupRef} filter={`url(#${idPrefix}-core-glow)`} />
        <rect
          width="100%"
          height="100%"
          filter={`url(#${idPrefix}-grain)`}
          style={{ mixBlendMode: "overlay", opacity: GRAIN_OPACITY }}
        />
      </svg>
    </div>
  );
}
