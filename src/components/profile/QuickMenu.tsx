"use client";

import { Package, RefreshCcw, MessageSquare, Heart, Bookmark, MapPin, UserCog, Gift } from "lucide-react";

const menuItems = [
  { icon: Package, label: "주문내역" },
  { icon: RefreshCcw, label: "취소/반품" },
  { icon: Heart, label: "찜한 상품" },
  { icon: Bookmark, label: "북마크" },
  { icon: MessageSquare, label: "나의 리뷰" },
  { icon: Gift, label: "이벤트" },
  { icon: MapPin, label: "배송지 관리" },
  { icon: UserCog, label: "정보 수정" },
];

export function QuickMenu() {
  return (
    <section className="mb-8">
      <h2 className="text-[15px] text-black mb-3">Quick Menu</h2>
      <div className="grid grid-cols-4 border-t border-b border-black py-5">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              aria-label={item.label}
              className="flex flex-col items-center justify-center gap-2 py-3 bg-transparent border-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <IconComponent size={18} strokeWidth={1} color="#000" />
              </div>
              <span className="text-[11px] text-[#6B6B6B]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
