"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Minus, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface SubItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  subItems?: SubItem[];
  external?: boolean;
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSearchClick: () => void;
  onLogoutClick: () => void;
  showTopBanner?: boolean;
}

const menuItems: MenuItem[] = [
  { name: "About", path: "/about" },
  {
    name: "Store",
    path: "/store",
    subItems: [
      { name: "전체", path: "/store" },
      { name: "밀키트", path: "/store?productType=밀키트" },
      { name: "베이커리", path: "/store?productType=베이커리" },
      { name: "소스/오일", path: "/store?productType=소스/오일" },
      { name: "세트", path: "/store?productType=세트" },
    ],
  },
  { name: "Subscription", path: "/subscribe" },
  { name: "Recipe", path: "/recipe" },
  { name: "Newsletter", path: "/newsletter" },
  // 이벤트 기능 임시 숨김 — 재오픈 시 주석 해제
  // { name: "Event", path: "/event" },
  { name: "Experts", path: "https://catalogue.slunch.co.kr/ko/fob", external: true },
  { name: "OEM", path: "https://catalogue.slunch.co.kr/ko/oemodm", external: true },
];

export function NavigationDrawer({
  isOpen,
  onClose,
  isLoggedIn,
  onLoginClick,
  onSearchClick,
  onLogoutClick,
  showTopBanner = false,
}: NavigationDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.name ? null : item.name);
    } else if (item.external) {
      window.open(item.path, "_blank", "noopener,noreferrer");
      onClose();
    } else {
      router.push(item.path);
      onClose();
    }
  };

  const handleSubItemClick = (path: string) => {
    router.push(path);
    onClose();
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="drawer-left"
      ariaLabel="메뉴"
      overlayClassName="!bg-transparent"
      zIndex={100}
      className="w-[80vw] max-w-[400px] bg-white flex flex-col overflow-y-auto border-r border-black"
      style={{ marginTop: showTopBanner ? "var(--promo-h)" : 0 }}
    >
        {/* 헤더 영역 */}
        <div className="h-[var(--header-h)] flex items-center justify-end px-4 border-b border-black shrink-0">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
            aria-label="메뉴 닫기"
          >
            <X size={24} strokeWidth={1} color="#000" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              <div
                className="flex items-center justify-between px-6 py-4 border-b border-black cursor-pointer"
                onClick={() => handleMenuClick(item)}
              >
                <span
                  className={`text-lg ${isActive(item.path) ? "text-black" : "text-[#333]"}`}
                >
                  {item.name}
                </span>
                {item.subItems && (
                  <button
                    className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedMenu(expandedMenu === item.name ? null : item.name);
                    }}
                  >
                    {expandedMenu === item.name ? (
                      <Minus size={18} color="#000" strokeWidth={1} />
                    ) : (
                      <Plus size={18} color="#000" strokeWidth={1} />
                    )}
                  </button>
                )}
              </div>

              {/* Sub Menu (Accordion) */}
              {item.subItems && (
                <div
                  className="overflow-hidden transition-[max-height] duration-300 ease-out bg-white"
                  style={{
                    maxHeight: expandedMenu === item.name ? "500px" : "0",
                  }}
                >
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.path}
                      className="py-3.5 pr-6 pl-10 border-b border-black cursor-pointer"
                      onClick={() => handleSubItemClick(subItem.path)}
                    >
                      <span className="text-[15px] text-[#666]">
                        {subItem.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 border-t border-black mt-auto">
          <button
            onClick={() => { onClose(); onSearchClick(); }}
            className="text-[15px] text-black bg-transparent border-none cursor-pointer text-left p-0 mb-4"
          >
            Search
          </button>

          <div className="flex flex-col gap-4">
            <Link href="/mypage" onClick={onClose} className="text-[15px] text-black">
              My Page
            </Link>
            {isLoggedIn ? (
              <button
                onClick={() => { onClose(); onLogoutClick(); }}
                className="text-[15px] text-[#666] bg-transparent border-none cursor-pointer text-left p-0"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => { onLoginClick(); onClose(); }}
                className="text-[15px] text-black bg-transparent border-none cursor-pointer text-left p-0"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
    </Modal>
  );
}
