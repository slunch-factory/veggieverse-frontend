"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Minus, X } from "lucide-react";

interface SubItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  subItems?: SubItem[];
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
  { name: "Event", path: "/event" },
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

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.name ? null : item.name);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={`absolute left-0 bottom-0 w-[80vw] max-w-[400px] bg-white flex flex-col overflow-y-auto border-r border-black transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: showTopBanner ? "var(--promo-h)" : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 영역 */}
        <div className="h-[var(--header-h)] flex items-center justify-start px-4 border-b border-black shrink-0">
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

          {isLoggedIn ? (
            <div className="flex flex-col gap-4">
              <Link href="/mypage" onClick={onClose} className="text-[15px] text-black">
                My Page
              </Link>
              <button
                onClick={() => { onClose(); onLogoutClick(); }}
                className="text-[15px] text-[#666] bg-transparent border-none cursor-pointer text-left p-0"
              >
                Logout
              </button>
            </div>
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
    </div>
  );
}
