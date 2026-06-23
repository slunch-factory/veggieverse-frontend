"use client";

import { ImageOff } from "lucide-react";
import type { CSSProperties } from "react";
import { supabaseRenderUrl } from "@/lib/supabaseImage";

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
  loading?: "lazy" | "eager";
  /** Supabase 변환 가로 px. 표시 크기의 2배 정도(레티나)를 권장. 기본 400. */
  width?: number;
  /** true면 다운스케일 없이 원본(풀스케일)을 그대로 로드. 상세 모달 등 화질 우선 영역용. */
  full?: boolean;
}

/** 메뉴 이미지 — src가 비어있으면 placeholder를 렌더한다.
 *  DB의 imageUrl이 비어있는 메뉴를 시각적으로 식별 가능하게 함.
 *  Supabase 원본(2~3MB PNG)은 render/image 엔드포인트로 다운스케일·WebP 변환해 불러온다. */
export function MealImage({ src, alt, className, style, draggable, loading = "lazy", width = 400, full = false }: Props) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className ?? ""} flex items-center justify-center bg-[#e9e3dc]`}
        style={style}
      >
        <ImageOff size={22} strokeWidth={1.3} className="text-[#9a928c]" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={full ? src : supabaseRenderUrl(src, { width })}
      alt={alt}
      className={className}
      style={style}
      draggable={draggable}
      loading={loading}
      decoding="async"
    />
  );
}
