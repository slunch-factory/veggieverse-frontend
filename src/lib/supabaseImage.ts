/**
 * Supabase Storage 이미지 변환 유틸.
 *
 * 백엔드/스토리지의 원본 이미지(대부분 2~3MB PNG)는 그대로 둔 채,
 * Supabase의 on-the-fly 변환 엔드포인트(render/image)로 URL만 바꿔
 * 표시 크기에 맞게 다운스케일한다. 브라우저 Accept 헤더에 따라
 * WebP/AVIF로 자동 협상되므로 포맷 변환도 무료로 따라온다.
 *
 * 원본 파일은 건드리지 않는다 — 순수 프론트 측 최적화.
 * Supabase 스토리지 public URL이 아니면(빈 값, /public 로컬 에셋, blob/data URL 등)
 * 입력을 그대로 반환하므로 어떤 src에 적용해도 안전하다.
 */

const PUBLIC_OBJECT = "/storage/v1/object/public/";
const RENDER_IMAGE = "/storage/v1/render/image/public/";

interface RenderOptions {
  /** 변환 후 가로 px. 보통 표시 크기의 2배(레티나)를 넘긴다. */
  width?: number;
  /** 변환 후 세로 px. 생략 시 width 기준 비율 유지. */
  height?: number;
  /** 1–100. 기본 70 (음식 사진 기준 충분). */
  quality?: number;
}

export function supabaseRenderUrl(src: string, opts: RenderOptions = {}): string {
  if (!src || !src.includes(PUBLIC_OBJECT)) return src;

  const [base, existingQuery] = src.split("?");
  const transformed = base.replace(PUBLIC_OBJECT, RENDER_IMAGE);

  const params = new URLSearchParams(existingQuery);
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("quality", String(opts.quality ?? 70));
  // width만 주면 Supabase 기본값(resize=cover)이 원본 높이를 유지한 채 폭만 줄여
  // 세로 띠로 중앙 크롭한다(이미지 확대처럼 보임). contain으로 항상 비율 유지.
  params.set("resize", "contain");

  const qs = params.toString();
  return qs ? `${transformed}?${qs}` : transformed;
}
