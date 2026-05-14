"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { getUserProfile } from "@/lib/api/user";
import { NavigationDrawer } from "./NavigationDrawer";
import { LoginModal } from "../modals/LoginModal";
import { SearchModal } from "../modals/SearchModal";
import { LogoutConfirmModal } from "../modals/LogoutConfirmModal";

interface HeaderProps {
  showTopBanner?: boolean;
}

export function Header({ showTopBanner = false }: HeaderProps) {
  const router = useRouter();
  const { user, userProfile, isLoggedIn, isLoadingSession, profileVersion } = useUser();
  const { totalCount } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    userProfile.profileImage,
  );

  useEffect(() => {
    if (isLoadingSession) return;
    if (!isLoggedIn) {
      setProfileImageUrl(null);
      return;
    }
    // localStorage 캐시(스피릿 테스트 결과 등)로 즉시 채운 뒤 백엔드 응답으로 덮어쓰기
    setProfileImageUrl(userProfile.profileImage);
    getUserProfile().then((profile) => {
      if (profile?.profileImageUrl) setProfileImageUrl(profile.profileImageUrl);
    });
  }, [isLoggedIn, isLoadingSession, userProfile.profileImage, profileVersion]);

  const getSpiritImageUrl = (spiritName: string | null): string | null => {
    if (!spiritName) return null;
    const spiritSlug = spiritName.toLowerCase().replace(/\s+/g, "-");
    return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/spirits/${spiritSlug}.png`;
  };

  const spiritImageUrl = user?.spiritName ? getSpiritImageUrl(user.spiritName) : null;
  const avatarUrl = profileImageUrl ?? spiritImageUrl;

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
              ({totalCount})
            </Link>

            {/* User Profile */}
            <button
              type="button"
              onClick={() => isLoggedIn ? router.push("/mypage") : setIsLoginModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
              aria-label="마이페이지"
            >
              {isLoggedIn && avatarUrl ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt="프로필"
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
            </button>
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
