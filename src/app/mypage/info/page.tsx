"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AtSign,
  Image as ImageIcon,
  Lock,
  MapPin,
  Upload,
  User,
} from "lucide-react";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";
import { useUser } from "@/contexts/UserContext";

interface FormState {
  userId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  phone: string;
  name: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  profileImageUrl: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^01[0-9]-\d{3,4}-\d{4}$/;
const URL_RE = /^(https?:\/\/|data:image\/).+/i;
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

export default function EditProfilePage() {
  const { user, userProfile } = useUser();

  const [form, setForm] = useState<FormState>(() => ({
    userId: user?.id || "vegan_user",
    password: "",
    passwordConfirm: "",
    email: user?.email || "",
    phone: "010-0000-0000",
    name: user?.name || "",
    postalCode: "",
    address: "",
    addressDetail: "",
    profileImageUrl: userProfile.profileImage || "",
  }));

  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하로 업로드해 주세요.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, profileImageUrl: reader.result as string }));
        setUploadedFileName(file.name);
        setImagePreviewError(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearProfileImage = () => {
    setForm((prev) => ({ ...prev, profileImageUrl: "" }));
    setUploadedFileName(null);
    setImagePreviewError(false);
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.password && form.password.length < 8)
      e.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.passwordConfirm && form.password !== form.passwordConfirm)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (form.email && !EMAIL_RE.test(form.email))
      e.email = "올바른 이메일 형식이 아닙니다.";
    if (form.phone && !PHONE_RE.test(form.phone))
      e.phone = "010-0000-0000 형식으로 입력해 주세요.";
    if (form.name && !NAME_RE.test(form.name))
      e.name = "한글/영문만 사용할 수 있습니다.";
    if (form.profileImageUrl && !URL_RE.test(form.profileImageUrl))
      e.profileImageUrl = "올바른 이미지 URL이 아닙니다.";
    return e;
  }, [form]);

  const canSubmit = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    return Boolean(
      form.email.trim() &&
        form.phone.trim() &&
        form.name.trim() &&
        form.postalCode.trim() &&
        form.address.trim(),
    );
  }, [form, errors]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    alert("회원정보가 수정되었습니다.");
  };

  const showImagePreview =
    form.profileImageUrl.trim().length > 0 &&
    URL_RE.test(form.profileImageUrl) &&
    !imagePreviewError;

  return (
    <>
      <KakaoPostcodeModal
        isOpen={postcodeOpen}
        onClose={() => setPostcodeOpen(false)}
        onSelect={({ postalCode, address }) => {
          setForm((prev) => ({
            ...prev,
            postalCode,
            address,
            addressDetail: "",
          }));
          setPostcodeOpen(false);
        }}
      />

      <div className="mx-auto max-w-[560px]">
        <form
          onSubmit={handleSubmit}
          className="edit-profile-form flex flex-col gap-5"
        >
          {/* 계정 정보 */}
          <FormSection icon={<User size={16} strokeWidth={1.5} />} title="계정 정보">
            <FormField label="로그인 아이디">
              <input
                className="ds-input"
                value={form.userId}
                readOnly
                style={{ background: "var(--bg-off)", color: "var(--ink-light)" }}
              />
              <p className="t-caption mt-1.5" style={{ color: "var(--neutral-stone)" }}>
                아이디는 변경할 수 없습니다.
              </p>
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
          </FormSection>

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

            <FormField label="이메일" required errorMessage={errors.email}>
              <input
                type="email"
                className={`ds-input${errors.email ? " is-error" : ""}`}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="example@slunch.com"
                autoComplete="email"
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
          </FormSection>

          {/* 주소 */}
          <FormSection icon={<MapPin size={16} strokeWidth={1.5} />} title="주소">
            <FormField label="주소" required>
              <div className="flex items-stretch gap-2">
                <input
                  value={form.postalCode}
                  readOnly
                  placeholder="우편번호"
                  className="ds-input"
                  style={{ width: 140, flexShrink: 0 }}
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

          {/* 프로필 사진 */}
          <FormSection icon={<ImageIcon size={16} strokeWidth={1.5} />} title="프로필 사진">
            <div className="flex items-center gap-4">
              <div
                className="flex shrink-0 items-center justify-center overflow-hidden"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "var(--bg-off)",
                  border: "1px solid var(--ink)",
                }}
              >
                {showImagePreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.profileImageUrl}
                    alt="프로필 미리보기"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreviewError(true)}
                  />
                ) : (
                  <User size={32} color="var(--neutral-stone)" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <FormField label="프로필 이미지" errorMessage={errors.profileImageUrl}>
                  {uploadedFileName ? (
                    <div className="flex items-stretch gap-2">
                      <input
                        type="text"
                        className="ds-input"
                        value={`📎 ${uploadedFileName}`}
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={clearProfileImage}
                        className="btn btn-ghost edit-aligned-btn flex-shrink-0"
                        style={{ border: "1px solid var(--neutral-stone)" }}
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-stretch gap-2">
                      <input
                        type="url"
                        className={`ds-input${errors.profileImageUrl ? " is-error" : ""}`}
                        value={form.profileImageUrl}
                        onChange={(e) => {
                          update("profileImageUrl", e.target.value);
                          setImagePreviewError(false);
                        }}
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-ghost edit-aligned-btn flex-shrink-0 gap-1.5"
                        style={{ border: "1px solid var(--neutral-stone)" }}
                      >
                        <Upload size={14} />
                        업로드
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {!uploadedFileName && (
                    <p className="t-caption mt-1.5" style={{ color: "var(--neutral-stone)" }}>
                      URL 입력 또는 이미지 파일 업로드 (최대 5MB)
                    </p>
                  )}
                </FormField>
              </div>
            </div>
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

      <style>{`
        .edit-profile-form .ds-input {
          height: 44px;
          padding-top: 0;
          padding-bottom: 0;
        }
        .edit-profile-form .edit-aligned-btn {
          height: 44px;
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
        className="px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--neutral-stone)", color: "var(--ink)" }}
      >
        {icon}
        <h2 className="t-h3" style={{ color: "var(--ink)" }}>{title}</h2>
      </header>
      <div className="px-5 py-5 flex flex-col gap-4">{children}</div>
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
