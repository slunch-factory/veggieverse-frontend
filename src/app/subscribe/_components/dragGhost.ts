import type React from "react";
import type { DisplayMenuData } from "../_data/subscription";

/**
 * 네이티브 드래그의 기본 고스트(원본 카드 그대로 = 큰 사진) 대신,
 * 스케줄 칸 크기에 맞춘 작은 미리보기를 드래그 이미지로 사용한다.
 * 오프스크린에 임시 노드를 그린 뒤 브라우저가 스냅샷을 찍게 하고 다음 틱에 제거한다.
 */
export function setSlotDragImage(
  e: React.DragEvent,
  meal: Pick<DisplayMenuData, "image" | "displayName">,
) {
  if (typeof document === "undefined") return;

  const ghost = document.createElement("div");
  ghost.style.cssText =
    "position:fixed;top:-1000px;left:-1000px;pointer-events:none;z-index:-1;" +
    "display:flex;align-items:center;gap:8px;box-sizing:border-box;" +
    "width:176px;height:46px;padding:0 8px;border-radius:10px;overflow:hidden;" +
    "background:#faf8f5;border:1px solid rgba(26,10,5,0.18);" +
    "box-shadow:0 8px 18px rgba(26,10,5,0.22);";

  const img = document.createElement("img");
  img.src = meal.image;
  img.draggable = false;
  img.style.cssText =
    "width:32px;height:32px;flex:0 0 auto;border-radius:7px;object-fit:cover;";

  const name = document.createElement("span");
  name.textContent = meal.displayName;
  name.style.cssText =
    "min-width:0;font:500 12px/1.2 sans-serif;color:#1a0a05;" +
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";

  ghost.append(img, name);
  document.body.appendChild(ghost);

  // 고스트 중앙쯤에 커서가 오도록 오프셋 지정.
  e.dataTransfer.setDragImage(ghost, 88, 23);

  // 스냅샷 후 제거 (다음 틱).
  setTimeout(() => ghost.remove(), 0);
}
