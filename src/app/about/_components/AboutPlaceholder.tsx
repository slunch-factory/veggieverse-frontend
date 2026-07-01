import { ImageIcon } from "lucide-react";

/**
 * About 페이지용 이미지 자리표시자.
 * 디자이너 실사진(#67) 전까지 쓰는 임시 비주얼 — dev용 `[텍스트]` 대신
 * 브랜드 톤의 그라데이션 + 라벨로 "준비된 자리"처럼 보이게 한다.
 */
export function AboutPlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{ background: "linear-gradient(135deg, #ECE8E2 0%, #D4CFC7 60%, #C8C2B8 100%)" }}
    >
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <ImageIcon className="h-6 w-6" style={{ color: "var(--warm-gray)" }} />
        <span className="text-[12px] tracking-[0.02em]" style={{ color: "var(--muted)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
