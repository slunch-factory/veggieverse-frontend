"use client";

import { useUser } from "@/contexts/UserContext";
import { Modal } from "@/components/ui/Modal";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
  const { signOut } = useUser();

  const handleLogout = async () => {
    onClose();
    // UserContext.signOut 내부에서 signOutAction → redirect("/") 까지 처리.
    await signOut();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="logout-confirm-title"
      zIndex={100}
      className="w-full max-w-[320px] mx-[16px] bg-white border border-black rounded-[16px] px-[24px] py-[32px] text-center"
    >
      <p id="logout-confirm-title" className="text-[15px] text-black mb-[24px] leading-[1.5]">
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
    </Modal>
  );
}
