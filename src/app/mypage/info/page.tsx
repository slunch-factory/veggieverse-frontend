"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AtSign,
  CalendarDays,
  Lock,
  MapPin,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";
import { WithdrawConfirmModal } from "@/components/modals/WithdrawConfirmModal";
import { AvatarCropModal } from "../_components/AvatarCropModal";
import { Snackbar } from "@/app/subscribe/_components/Snackbar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { getUserProfile, updateUserProfile } from "@/lib/api/user";
import { supabaseRenderUrl } from "@/lib/supabaseImage";

interface FormState {
  password: string;
  passwordConfirm: string;
  email: string;
  phone: string;
  name: string;
  birthday: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  marketingSms: boolean;
  marketingEmail: boolean;
}

const PHONE_RE = /^01[0-9]-\d{3,4}-\d{4}$/;
const NAME_RE = /^[가-힣a-zA-Z\s]+$/;

function filterLetters(v: string) {
  return v.replace(/[^가-힣a-zA-Z\s]/g, "");
}

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function stripPhoneDashes(v: string) {
  return v.replace(/-/g, "");
}

export default function EditProfilePage() {
  const { user, userProfile, refetchProfile } = useUser();

  const [form, setForm] = useState<FormState>({
    password: "",
    passwordConfirm: "",
    email: user?.email || "",
    phone: "",
    name: user?.name || "",
    birthday: "",
    postalCode: "",
    address: "",
    addressDetail: "",
    marketingSms: false,
    marketingEmail: false,
  });

  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    userProfile.profileImage || "",
  );
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  // 크롭 모달에 넘길 원본 이미지(dataURL) — null이면 닫힘
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState("profile.jpg");
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile) {
        setForm((prev) => ({
          ...prev,
          email: profile.email || prev.email,
          name: profile.name || prev.name,
          phone: formatPhone(profile.phoneNumber || ""),
          birthday: profile.birthday || "",
          postalCode: profile.address?.zipCode || "",
          address: profile.address?.street || "",
          addressDetail: profile.address?.detail || "",
          marketingSms: profile.marketingSms ?? false,
          marketingEmail: profile.marketingEmail ?? false,
        }));
        setProfileImageUrl(profile.profileImageUrl || userProfile.profileImage || "");
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("JPG, PNG, WebP 형식만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하로 업로드해 주세요.");
      e.target.value = "";
      return;
    }
    // 바로 적용하지 않고 크롭 모달을 띄워 프레임(위치·확대)을 조절하게 한다.
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropName(file.name);
        setCropSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.password && form.password.length < 8)
      e.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.passwordConfirm && form.password !== form.passwordConfirm)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (form.phone && !PHONE_RE.test(form.phone))
      e.phone = "010-0000-0000 형식으로 입력해 주세요.";
    if (form.name && !NAME_RE.test(form.name))
      e.name = "한글/영문만 사용할 수 있습니다.";
    if (form.birthday) {
      const d = new Date(form.birthday);
      if (Number.isNaN(d.getTime()) || d > new Date())
        e.birthday = "올바른 생년월일을 입력해 주세요.";
    }
    return e;
  }, [form]);

  const canSubmit = useMemo(() => {
    if (Object.values(errors).some(Boolean)) return false;
    return Boolean(
      form.phone.trim() &&
        form.name.trim() &&
        form.birthday.trim() &&
        form.postalCode.trim() &&
        form.address.trim(),
    );
  }, [form, errors]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    if (form.password) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) {
        console.warn("[editProfile/password]", error.message);
        setSubmitting(false);
        return;
      }
    }

    const ok = await updateUserProfile({
      name: form.name.trim(),
      phoneNumber: stripPhoneDashes(form.phone),
      birthday: form.birthday,
      locale: "ko",
      marketingSms: form.marketingSms,
      marketingEmail: form.marketingEmail,
      address: {
        zipCode: form.postalCode,
        street: form.address,
        detail: form.addressDetail,
      },
      ...(profileImageFile ? { image: profileImageFile } : {}),
    });

    setSubmitting(false);
    if (!ok) return;

    // profileVersion bump → 구독 중인 헤더·마이페이지가 자동으로 fresh 데이터 재조회.
    refetchProfile();
    setToast("회원정보가 수정되었습니다.");
  };

  const displayImage = profileImagePreview || profileImageUrl;

  if (loading) {
    return (
      <div className="mx-auto max-w-[560px] flex justify-center items-center py-20">
        <p className="t-body" style={{ color: "var(--ink-light)" }}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      <KakaoPostcodeModal
        isOpen={postcodeOpen}
        onClose={() => setPostcodeOpen(false)}
        onSelect={({ postalCode, address }) => {
          setForm((prev) => ({ ...prev, postalCode, address, addressDetail: "" }));
          setPostcodeOpen(false);
        }}
      />

      <AvatarCropModal
        isOpen={cropSrc !== null}
        imageSrc={cropSrc}
        fileName={cropName}
        onClose={() => setCropSrc(null)}
        onComplete={(file, previewUrl) => {
          setProfileImageFile(file);
          setProfileImagePreview(previewUrl);
          setCropSrc(null);
        }}
      />

      <div className="mx-auto max-w-[880px]">
        <form onSubmit={handleSubmit} className="edit-profile-form flex flex-col gap-5">

          {/* 프로필 사진 + 계정 정보 (통합 헤더) */}
          <FormSection icon={<User size={16} strokeWidth={1.5} />} title="계정 정보">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 프로필 사진 */}
              <div className="flex flex-col items-center gap-3 md:w-[150px] shrink-0">
                <div
                  className="flex shrink-0 items-center justify-center overflow-hidden"
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "var(--bg-off)",
                    border: "1px solid var(--ink)",
                  }}
                >
                  {displayImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={supabaseRenderUrl(displayImage, { width: 200 })}
                      alt="프로필 미리보기"
                      className="w-full h-full object-cover"
                      decoding="async"
                    />
                  ) : (
                    <User size={34} color="var(--neutral-stone)" />
                  )}
                </div>
                {profileImageFile ? (
                  <div className="w-full flex flex-col items-center gap-1">
                    <p
                      className="t-caption truncate max-w-full"
                      title={profileImageFile.name}
                      style={{ color: "var(--ink-light)" }}
                    >
                      📎 {profileImageFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={clearProfileImage}
                      className="t-caption"
                      style={{
                        color: "var(--alert-red)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-ghost w-full gap-1.5"
                    style={{ border: "1px solid var(--neutral-stone)", height: 36 }}
                  >
                    <Upload size={14} />
                    업로드
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="t-caption text-center" style={{ color: "var(--neutral-stone)" }}>
                  JPG / PNG / WebP
                  <br />
                  최대 5MB
                </p>
              </div>

              {/* 계정 정보 입력 */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <FormField label="이메일" required>
                  <input
                    type="email"
                    className="ds-input"
                    value={form.email}
                    readOnly
                    style={{ background: "var(--bg-off)", color: "var(--ink-light)" }}
                  />
                </FormField>

                <FormField label="비밀번호" errorMessage={errors.password}>
                  <input
                    type="password"
                    className={`ds-input${errors.password ? " is-error" : ""}`}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="변경 시 8자 이상 입력"
                    autoComplete="new-password"
                  />
                </FormField>

                <FormField label="비밀번호 확인" errorMessage={errors.passwordConfirm}>
                  <input
                    type="password"
                    className={`ds-input${errors.passwordConfirm ? " is-error" : ""}`}
                    value={form.passwordConfirm}
                    onChange={(e) => update("passwordConfirm", e.target.value)}
                    placeholder="비밀번호를 한 번 더 입력해 주세요"
                    autoComplete="new-password"
                  />
                  {!errors.passwordConfirm &&
                    form.passwordConfirm.length > 0 &&
                    form.password === form.passwordConfirm && (
                      <p className="t-caption mt-1.5" style={{ color: "var(--primary)" }}>
                        비밀번호가 일치합니다.
                      </p>
                    )}
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* 연락처 + 주소 (2단) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 연락처 */}
          <FormSection icon={<AtSign size={16} strokeWidth={1.5} />} title="연락처">
            <FormField label="이름" required errorMessage={errors.name}>
              <input
                className={`ds-input${errors.name ? " is-error" : ""}`}
                value={form.name}
                onChange={(e) => update("name", filterLetters(e.target.value))}
                placeholder="홍길동"
                autoComplete="name"
              />
            </FormField>

            <FormField label="전화번호" required errorMessage={errors.phone}>
              <input
                type="tel"
                className={`ds-input${errors.phone ? " is-error" : ""}`}
                value={form.phone}
                onChange={(e) => update("phone", formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={13}
              />
            </FormField>

            <FormField label="생년월일" required errorMessage={errors.birthday}>
              <div className="flex items-stretch gap-2">
                <input
                  type="date"
                  className={`ds-input${errors.birthday ? " is-error" : ""}`}
                  value={form.birthday}
                  onChange={(e) => update("birthday", e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
                <span
                  className="edit-aligned-btn flex items-center justify-center px-3 flex-shrink-0"
                  style={{ color: "var(--ink-light)" }}
                  aria-hidden
                >
                  <CalendarDays size={16} />
                </span>
              </div>
            </FormField>
          </FormSection>

          {/* 주소 */}
          <FormSection icon={<MapPin size={16} strokeWidth={1.5} />} title="주소">
            <FormField label="주소" required>
              <div className="flex items-stretch gap-2">
                <input
                  value={form.postalCode}
                  readOnly
                  placeholder="우편번호"
                  className="ds-input edit-postal-input"
                />
                <button
                  type="button"
                  onClick={() => setPostcodeOpen(true)}
                  className="btn btn-ghost edit-aligned-btn flex-shrink-0"
                  style={{ border: "1px solid var(--neutral-stone)" }}
                >
                  주소 검색
                </button>
              </div>
              <input
                value={form.address}
                readOnly
                placeholder="기본 주소"
                className="ds-input mt-2"
              />
              <input
                value={form.addressDetail}
                onChange={(e) => update("addressDetail", e.target.value)}
                placeholder="상세 주소 (동·호수)"
                className="ds-input mt-2"
              />
            </FormField>
          </FormSection>
          </div>

          {/* 마케팅 수신 동의 */}
          <FormSection icon={<ShieldCheck size={16} strokeWidth={1.5} />} title="마케팅 수신 동의">
            <label className="chk-wrap">
              <input
                type="checkbox"
                checked={form.marketingSms}
                onChange={(e) => update("marketingSms", e.target.checked)}
              />
              <span className="t-small" style={{ color: "var(--ink)" }}>
                SMS 마케팅 수신 동의{" "}
                <span style={{ color: "var(--neutral-stone)" }}>(선택)</span>
              </span>
            </label>
            <label className="chk-wrap">
              <input
                type="checkbox"
                checked={form.marketingEmail}
                onChange={(e) => update("marketingEmail", e.target.checked)}
              />
              <span className="t-small" style={{ color: "var(--ink)" }}>
                이메일 마케팅 수신 동의{" "}
                <span style={{ color: "var(--neutral-stone)" }}>(선택)</span>
              </span>
            </label>
          </FormSection>

          {/* 제출 */}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn btn-dark btn-lg w-full mt-2"
          >
            {submitting ? (
              "처리 중..."
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} />
                저장하기
              </span>
            )}
          </button>

          <div className="text-center mt-1">
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
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

      <WithdrawConfirmModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={() => {
          // TODO(#60): 회원탈퇴 API 연동 — deleteAccount() 호출 후 로그아웃/홈 redirect.
          // 현재는 백엔드 미구현이라 안내만 노출한다.
          setWithdrawOpen(false);
          setToast("회원탈퇴 기능은 곧 제공될 예정이에요.");
        }}
      />

      <Snackbar message={toast} onClose={() => setToast(null)} />

      <style>{`
        .edit-profile-form .ds-input {
          height: 44px;
          padding-top: 0;
          padding-bottom: 0;
        }
        .edit-profile-form .edit-aligned-btn {
          height: 44px;
        }
        .edit-profile-form .edit-postal-input {
          width: 140px;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .edit-profile-form .edit-postal-input {
            width: 100%;
            min-width: 0;
            flex: 1;
          }
          .edit-profile-form .edit-aligned-btn {
            padding-left: 14px;
            padding-right: 14px;
            font-size: 13px;
          }
          .edit-profile-form .edit-section-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .edit-profile-form .edit-section-body {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── 보조 컴포넌트 ─── */

function FormSection({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <header
        className="edit-section-header px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--neutral-stone)", color: "var(--ink)" }}
      >
        {icon}
        <h2 className="t-h3" style={{ color: "var(--ink)" }}>{title}</h2>
      </header>
      <div className="edit-section-body px-5 py-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required,
  errorMessage,
  children,
}: {
  label: string;
  required?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="t-small" style={{ color: "var(--ink)" }}>
        {label}
        {required && <span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>}
      </span>
      {children}
      {errorMessage && <p className="ds-input-msg is-error">{errorMessage}</p>}
    </div>
  );
}
