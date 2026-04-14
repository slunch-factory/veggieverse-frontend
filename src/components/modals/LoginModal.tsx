"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 로그인 API 연동
    onLoginSuccess?.();
    onClose();
  };

  const handleSocialLogin = (provider: "kakao" | "naver" | "google" | "apple") => {
    // TODO: 소셜 로그인 API 연동
    onLoginSuccess?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-white border border-black rounded-2xl p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
          aria-label="닫기"
        >
          <X size={20} strokeWidth={1} color="#000" />
        </button>

        {/* 헤더 */}
        <h2 className="text-center mb-8 text-[20px] text-black">
          Log-in
        </h2>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="이메일 또는 아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-[14px] mb-3 border border-black rounded-lg text-[14px] outline-none box-border"
            required
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-[14px] mb-4 border border-black rounded-lg text-[14px] outline-none box-border"
            required
          />

          {/* 옵션 */}
          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-black"
              />
              <span className="text-[13px] text-black">아이디 저장</span>
            </label>
            <span className="text-[13px] text-[#888]">보안접속</span>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full p-[14px] mb-3 bg-black border-none rounded-lg text-[14px] text-white cursor-pointer"
          >
            Log-in
          </button>

          {/* 게스트 주문 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="w-full p-[14px] mb-5 bg-transparent border border-black rounded-lg text-[14px] text-black cursor-pointer"
          >
            Guest-Order
          </button>
        </form>

        {/* 링크 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-xs text-[#888]">
            <button className="bg-transparent border-none cursor-pointer text-[#888] text-xs">
              아이디 찾기
            </button>
            <span>|</span>
            <button className="bg-transparent border-none cursor-pointer text-[#888] text-xs">
              비밀번호 찾기
            </button>
            <span>|</span>
            <button className="bg-transparent border-none cursor-pointer text-[#888] text-xs">
              회원가입
            </button>
          </div>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="flex flex-col gap-2">
          {(["kakao", "naver", "google", "apple"] as const).map((provider) => {
            const labels: Record<string, string> = {
              kakao: "Kakao로 로그인",
              naver: "NAVER로 로그인",
              google: "Google로 로그인",
              apple: "Apple로 로그인",
            };
            return (
              <button
                key={provider}
                onClick={() => handleSocialLogin(provider)}
                className="w-full h-12 flex items-center justify-center gap-2 bg-transparent border border-black rounded-lg text-[14px] text-black cursor-pointer"
              >
                <span>{labels[provider]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
