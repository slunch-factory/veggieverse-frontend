"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const { logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] mx-[16px] bg-white border border-black rounded-[16px] px-[24px] py-[32px] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] text-black mb-[24px] leading-[1.5]">
          로그아웃 하시겠습니까?
        </p>

        <div className="flex gap-[12px]">
          <button
            onClick={onClose}
            className="flex-1 p-[12px] text-[14px] text-black bg-transparent border border-black rounded-[8px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 p-[12px] text-[14px] text-white bg-black border border-black rounded-[8px] cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
