"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut } from "lucide-react";

const VIEWPORT = 280; // 원형 크롭 뷰포트 한 변(px)
const OUTPUT = 480; // 출력 이미지 한 변(px)
const MAX_ZOOM = 3;

interface AvatarCropModalProps {
  isOpen: boolean;
  /** 크롭할 원본 이미지(dataURL) */
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  /** 적용 시 크롭된 정사각 이미지(File)와 미리보기 dataURL 반환 */
  onComplete: (file: File, previewUrl: string) => void;
}

/**
 * 프로필 사진 크롭 모달 — 원형 프레임에 맞춰 드래그(이동)·슬라이더(확대)로 조절 후
 * 정사각 이미지로 크롭. 외부 라이브러리 없이 canvas로 출력.
 */
export function AvatarCropModal({
  isOpen,
  imageSrc,
  fileName = "profile.jpg",
  onClose,
  onComplete,
}: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const baseScale = nat ? Math.max(VIEWPORT / nat.w, VIEWPORT / nat.h) : 1;
  const scale = baseScale * zoom;
  const dw = nat ? nat.w * scale : 0;
  const dh = nat ? nat.h * scale : 0;

  // 이미지가 항상 원을 덮도록 offset을 가둔다(여백 방지).
  const clampAt = useCallback((x: number, y: number, w: number, h: number) => {
    return {
      x: Math.min(0, Math.max(VIEWPORT - w, x)),
      y: Math.min(0, Math.max(VIEWPORT - h, y)),
    };
  }, []);

  // 원본 크기 로드 → 중앙 정렬(비동기 콜백이라 effect 동기 setState 아님)
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const im = new Image();
    im.onload = () => {
      const w = im.naturalWidth;
      const h = im.naturalHeight;
      const bs = Math.max(VIEWPORT / w, VIEWPORT / h);
      setNat({ w, h });
      setZoom(1);
      setOffset({ x: (VIEWPORT - w * bs) / 2, y: (VIEWPORT - h * bs) / 2 });
    };
    im.src = imageSrc;
  }, [isOpen, imageSrc]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  const handleZoom = (z: number) => {
    const ns = baseScale * z;
    const nw = (nat?.w ?? 0) * ns;
    const nh = (nat?.h ?? 0) * ns;
    setZoom(z);
    setOffset((o) => clampAt(o.x, o.y, nw, nh));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset(clampAt(d.ox + (e.clientX - d.px), d.oy + (e.clientY - d.py), dw, dh));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const apply = () => {
    const img = imgRef.current;
    if (!img || !nat) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // 뷰포트(정사각)에 대응하는 원본 좌표 영역
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = VIEWPORT / scale;
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const base = fileName.replace(/\.[^.]+$/, "");
        const file = new File([blob], `${base}.jpg`, { type: "image/jpeg" });
        onComplete(file, canvas.toDataURL("image/jpeg", 0.92));
      },
      "image/jpeg",
      0.92,
    );
  };

  if (!isOpen || !imageSrc || typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="w-full max-w-[340px] mx-[16px]"
        style={{
          background: "var(--bg-white)",
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-modal, 16px)",
          padding: "24px 20px",
        }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <p className="t-body text-center" style={{ color: "var(--ink)" }}>
          프로필 사진 편집
        </p>
        <p className="t-caption text-center mt-1" style={{ color: "var(--ink-light)" }}>
          드래그해서 위치 조정 · 슬라이더로 확대
        </p>

        {/* 원형 크롭 뷰포트 */}
        <div className="mt-4 flex justify-center">
          <div
            className="relative touch-none select-none cursor-grab active:cursor-grabbing"
            style={{
              width: VIEWPORT,
              height: VIEWPORT,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--bg-off)",
              boxShadow: "0 0 0 2px var(--ink)",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="크롭"
              draggable={false}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: dw || "100%",
                height: dh || "100%",
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                maxWidth: "none",
              }}
            />
          </div>
        </div>

        {/* 확대 슬라이더 */}
        <div className="mt-4 flex items-center gap-2">
          <ZoomOut size={16} color="var(--ink-light)" />
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoom(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: "var(--ink)" }}
            aria-label="확대"
          />
          <ZoomIn size={16} color="var(--ink-light)" />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 t-small"
            style={{
              padding: 12,
              color: "var(--ink)",
              background: "transparent",
              border: "1px solid var(--ink)",
              borderRadius: "var(--r-btn)",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 t-small"
            style={{
              padding: 12,
              color: "var(--bg-white)",
              background: "var(--ink)",
              border: "1px solid var(--ink)",
              borderRadius: "var(--r-btn)",
              cursor: "pointer",
            }}
          >
            적용
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
