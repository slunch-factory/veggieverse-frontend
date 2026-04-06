"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Menu } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { NavigationDrawer } from "./NavigationDrawer";
import { LoginModal } from "../modals/LoginModal";
import { SearchModal } from "../modals/SearchModal";
import { LogoutConfirmModal } from "../modals/LogoutConfirmModal";

interface HeaderProps {
  showTopBanner?: boolean;
}

export function Header({ showTopBanner = false }: HeaderProps) {
  const { user, isLoggedIn } = useUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getSpiritImageUrl = (spiritName: string | null): string | null => {
    if (!spiritName) return null;
    const spiritSlug = spiritName.toLowerCase().replace(/\s+/g, "-");
    return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/spirits/${spiritSlug}.png`;
  };

  const spiritImageUrl = user?.spiritName ? getSpiritImageUrl(user.spiritName) : null;

  return (
    <>
      <header
        className="z-50 bg-[#DCFD4A] relative h-[var(--header-h)]"
      >
        <div className="flex items-center justify-between h-full px-4 max-w-[1440px] mx-auto relative">
          {/* Left: Hamburger Menu */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
            aria-label="메뉴 열기"
          >
            <Menu size={24} strokeWidth={1} color="#000" />
          </button>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 z-[51]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/common/logo.png`}
              alt="SLUNCH FACTORY"
              className="h-9 block object-contain"
            />
          </Link>

          {/* Right: Utility Icons */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="h-10 flex items-center justify-center px-1 text-sm text-black"
              aria-label="장바구니"
            >
              (0)
            </Link>

            {/* User Profile */}
            <Link
              href={isLoggedIn ? "/mypage" : "#"}
              onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  setIsLoginModalOpen(true);
                }
              }}
              className="w-10 h-10 flex items-center justify-center"
              aria-label={isLoggedIn ? "마이페이지" : "로그인"}
            >
              {isLoggedIn && spiritImageUrl ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={spiritImageUrl}
                    alt={user?.spiritName || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E5E5E5] flex items-center justify-center">
                  <User size={16} strokeWidth={1} color="#666" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSearchClick={() => setIsSearchModalOpen(true)}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        showTopBanner={showTopBanner}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsLoginModalOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
