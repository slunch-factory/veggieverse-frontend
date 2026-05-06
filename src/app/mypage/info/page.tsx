"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function MyInfoPage() {
  const { user, userProfile } = useUser();
  const profileImage = userProfile.profileImage;

  const infoItems = [
    { label: "이름 (닉네임)", value: user?.name || "-" },
    { label: "이메일", value: user?.email || "-" },
    { label: "채식 스피릿", value: user?.spiritName || "-" },
    { label: "채식 유형", value: userProfile.veganType || "-" },
    {
      label: "프로필 저장일",
      value: userProfile.savedAt
        ? new Date(userProfile.savedAt).toLocaleDateString("ko-KR")
        : "-",
    },
    { label: "보유 배지", value: "0개" },
  ];

  return (
    <div className="mx-auto max-w-[560px]">
      {/* 프로필 이미지 */}
      <div className="flex justify-center mb-8">
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "var(--bg-off)",
            border: "1px solid var(--ink)",
          }}
        >
          {profileImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            <User size={40} color="var(--neutral-stone)" />
          )}
        </div>
      </div>

      {/* 회원 정보 목록 */}
      <div
        style={{
          background: "var(--bg-white)",
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-btn)",
          overflow: "hidden",
        }}
      >
        {infoItems.map((item, idx) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-5 py-4"
            style={{
              borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
            }}
          >
            <span className="t-small" style={{ color: "var(--ink-light)" }}>{item.label}</span>
            <span className="t-small" style={{ color: "var(--ink)" }}>{item.value}</span>
          </div>
        ))}
      </div>

      <Link
        href="/mypage/info/edit-profile"
        className="btn btn-dark btn-md w-full mt-6"
      >
        정보 수정
      </Link>
    </div>
  );
}
