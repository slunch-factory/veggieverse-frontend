"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { User, Lock, ChevronDown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const VEGAN_TYPES = [
  { value: "vegan", label: "비건 (Vegan)" },
  { value: "lacto", label: "락토 (Lacto)" },
  { value: "ovo", label: "오보 (Ovo)" },
  { value: "lacto-ovo", label: "락토오보 (Lacto-Ovo)" },
  { value: "pesco", label: "페스코 (Pesco)" },
  { value: "pollo", label: "폴로 (Pollo)" },
  { value: "flexitarian", label: "플렉시테리언 (Flexitarian)" },
];

export default function EditProfilePage() {
  const { user, userProfile } = useUser();
  const profileImage = userProfile.profileImage;

  const [formData, setFormData] = useState({
    username: user?.name || "비건탐험가",
    email: user?.email || "vegan@slunch.com",
    phone: "010-0000-0000",
    veganType: userProfile.veganType || "flexitarian",
    birthYear: "1990",
    gender: "prefer-not-to-say",
    marketingEmail: true,
    marketingSms: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("회원정보가 수정되었습니다.");
  };

  return (
    <div className="mx-auto max-w-[560px]">
      {/* 프로필 이미지 */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <div
            className="flex items-center justify-center overflow-hidden mx-auto mb-3"
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
          <button
            type="button"
            className="t-caption"
            style={{
              color: "var(--ink-light)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            사진 변경
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="이름 (닉네임)">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="ds-input"
          />
        </Field>

        <Field label="이메일">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="ds-input"
          />
        </Field>

        <Field label="연락처">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            className="ds-input"
          />
        </Field>

        <Field label="채식 유형">
          <SelectWithChevron
            name="veganType"
            value={formData.veganType}
            onChange={handleChange}
          >
            {VEGAN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </SelectWithChevron>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="출생연도">
            <SelectWithChevron
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
            >
              {Array.from({ length: 80 }, (_, i) => 2024 - i).map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </SelectWithChevron>
          </Field>
          <Field label="성별">
            <SelectWithChevron
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="prefer-not-to-say">선택 안함</option>
            </SelectWithChevron>
          </Field>
        </div>

        <div style={{ borderTop: "1px solid var(--neutral-stone)", margin: "8px 0" }} />

        <button
          type="button"
          className="btn btn-ghost btn-md w-full"
          style={{ border: "1px solid var(--neutral-stone)" }}
        >
          <Lock size={16} />
          비밀번호 변경
        </button>

        <div style={{ borderTop: "1px solid var(--neutral-stone)", margin: "8px 0" }} />

        <div>
          <p className="t-caption mb-3" style={{ color: "var(--ink-light)" }}>
            마케팅 정보 수신 동의
          </p>
          <div className="flex flex-col gap-2.5">
            <label className="chk-wrap">
              <input
                type="checkbox"
                name="marketingEmail"
                checked={formData.marketingEmail}
                onChange={handleChange}
              />
              <span style={{ color: "var(--ink)" }}>이메일 수신 동의</span>
            </label>
            <label className="chk-wrap">
              <input
                type="checkbox"
                name="marketingSms"
                checked={formData.marketingSms}
                onChange={handleChange}
              />
              <span style={{ color: "var(--ink)" }}>SMS 수신 동의</span>
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-dark btn-lg w-full mt-2">
          저장하기
        </button>

        <div className="text-center mt-2">
          <button
            type="button"
            className="t-caption"
            style={{
              color: "var(--neutral-stone)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            회원 탈퇴
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="t-caption" style={{ color: "var(--ink-light)" }}>{label}</label>
      {children}
    </div>
  );
}

function SelectWithChevron({
  name,
  value,
  onChange,
  children,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="ds-input"
        style={{ appearance: "none", paddingRight: 40, cursor: "pointer" }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        color="var(--ink-light)"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}
