"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, AtSign, MapPin, Image as ImageIcon, ShieldCheck, Upload } from "lucide-react";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";

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
  agreeAge: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

const INITIAL_FORM: FormState = {
  userId: "",
  password: "",
  passwordConfirm: "",
  email: "",
  phone: "",
  name: "",
  postalCode: "",
  address: "",
  addressDetail: "",
  profileImageUrl: "",
  agreeAge: false,
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
};

type UserIdCheckStatus = "unchecked" | "checking" | "available" | "duplicate";

/** 임시 중복 ID 목록 — 실제 API 연동 시 교체 */
const RESERVED_IDS = ["admin", "test", "user", "slunch", "guest"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^01[0-9]-\d{3,4}-\d{4}$/;
const URL_RE = /^(https?:\/\/|data:image\/).+/i;
const USERID_RE = /^[a-zA-Z0-9]+$/;
const NAME_RE = /^[가-힣a-zA-Z\s]+$/;

/** 입력 시 비허용 문자를 즉시 걸러냄 */
function filterAlphanumeric(v: string) {
  return v.replace(/[^a-zA-Z0-9]/g, "");
}
function filterLetters(v: string) {
  return v.replace(/[^가-힣a-zA-Z\s]/g, "");
}
/** 숫자만 남기고 010-XXXX-XXXX 형태로 자동 포맷 (최대 11자리) */
function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function SignupClient() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [userIdCheck, setUserIdCheck] = useState<UserIdCheckStatus>("unchecked");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateUserId = (value: string) => {
    const filtered = filterAlphanumeric(value);
    setForm((prev) => ({ ...prev, userId: filtered }));
    setUserIdCheck("unchecked");
  };

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

  const checkUserIdDuplicate = async () => {
    if (userIdCheck === "checking") return;
    if (!form.userId.trim() || form.userId.length < 4) return;
    setUserIdCheck("checking");
    // TODO: 실제 중복확인 API 연동
    await new Promise((r) => setTimeout(r, 400));
    const isReserved = RESERVED_IDS.includes(form.userId.trim().toLowerCase());
    setUserIdCheck(isReserved ? "duplicate" : "available");
  };

  const allAgreed = form.agreeAge && form.agreeTerms && form.agreePrivacy && form.agreeMarketing;
  const toggleAllAgreements = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      agreeAge: checked,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.userId && form.userId.length < 4) e.userId = "아이디는 4자 이상이어야 합니다.";
    else if (form.userId && !USERID_RE.test(form.userId))
      e.userId = "영문/숫자만 사용할 수 있습니다.";
    if (form.password && form.password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.passwordConfirm && form.password !== form.passwordConfirm)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (form.email && !EMAIL_RE.test(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (form.phone && !PHONE_RE.test(form.phone)) e.phone = "010-0000-0000 형식으로 입력해 주세요.";
    if (form.name && !NAME_RE.test(form.name)) e.name = "한글/영문만 사용할 수 있습니다.";
    if (form.profileImageUrl && !URL_RE.test(form.profileImageUrl))
      e.profileImageUrl = "올바른 이미지 URL이 아닙니다.";
    return e;
  }, [form]);

  const canSubmit = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    return Boolean(
      form.userId.trim() &&
      userIdCheck === "available" &&
      form.password.trim() &&
      form.passwordConfirm.trim() &&
      form.password === form.passwordConfirm &&
      form.email.trim() &&
      form.phone.trim() &&
      form.name.trim() &&
      form.postalCode.trim() &&
      form.address.trim() &&
      form.profileImageUrl.trim() &&
      form.agreeAge &&
      form.agreeTerms &&
      form.agreePrivacy,
    );
  }, [form, errors, userIdCheck]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    // TODO: 회원가입 API 연동
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    alert("회원가입이 완료되었습니다.");
    router.push("/");
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

      <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
        <div className="mx-auto max-w-[560px] px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 t-small mb-6"
            style={{ color: "var(--ink-light)" }}
          >
            <ChevronLeft size={16} />
            홈으로
          </Link>

          <h1 className="flex justify-center t-h2 mb-8" style={{ color: "var(--ink)" }}>회원가입</h1>

          <form onSubmit={handleSubmit} className="signup-form flex flex-col gap-5">
            {/* 계정 정보 */}
            <FormSection icon={<User size={16} strokeWidth={1.5} />} title="계정 정보">
              <FormField label="아이디" required errorMessage={errors.userId}>
                <div className="flex items-stretch gap-2">
                  <input
                    className={`ds-input${errors.userId ? " is-error" : ""}`}
                    value={form.userId}
                    onChange={(e) => updateUserId(e.target.value)}
                    placeholder="4자 이상의 영문/숫자"
                    autoComplete="username"
                    inputMode="text"
                  />
                  <button
                    type="button"
                    onClick={checkUserIdDuplicate}
                    disabled={
                      !form.userId.trim() ||
                      form.userId.length < 4 ||
                      userIdCheck === "checking" ||
                      userIdCheck === "available"
                    }
                    className="btn btn-ghost signup-aligned-btn flex-shrink-0"
                    style={{ border: "1px solid var(--neutral-stone)" }}
                  >
                    {userIdCheck === "checking" ? "확인 중..." : "중복확인"}
                  </button>
                </div>
                {!errors.userId && userIdCheck === "available" && (
                  <p className="t-caption mt-1.5" style={{ color: "var(--primary)" }}>
                    사용 가능한 아이디입니다.
                  </p>
                )}
                {!errors.userId && userIdCheck === "duplicate" && (
                  <p className="ds-input-msg is-error">이미 사용 중인 아이디입니다.</p>
                )}
              </FormField>

              <FormField label="비밀번호" required errorMessage={errors.password}>
                <input
                  type="password"
                  className={`ds-input${errors.password ? " is-error" : ""}`}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="8자 이상"
                  autoComplete="new-password"
                />
              </FormField>

              <FormField label="비밀번호 확인" required errorMessage={errors.passwordConfirm}>
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
                  inputMode="text"
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

              <FormField label="휴대전화" required errorMessage={errors.phone}>
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
                    className="btn btn-ghost signup-aligned-btn flex-shrink-0"
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
                  <FormField label="프로필 사진" required errorMessage={errors.profileImageUrl}>
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
                          className="btn btn-ghost signup-aligned-btn flex-shrink-0"
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
                          className="btn btn-ghost signup-aligned-btn flex-shrink-0 gap-1.5"
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

            {/* 약관 동의 */}
            <FormSection icon={<ShieldCheck size={16} strokeWidth={1.5} />} title="약관 동의">
              <label
                className="chk-wrap pb-3"
                style={{ borderBottom: "1px solid var(--neutral-stone)" }}
              >
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={(e) => toggleAllAgreements(e.target.checked)}
                />
                <span className="t-body" style={{ color: "var(--ink)" }}>
                  전체 동의
                </span>
              </label>
              <div className="flex flex-col gap-2 mt-1">
                <AgreementRow
                  checked={form.agreeAge}
                  onChange={(v) => update("agreeAge", v)}
                  label="만 14세 이상입니다"
                  required
                />
                <AgreementRow
                  checked={form.agreeTerms}
                  onChange={(v) => update("agreeTerms", v)}
                  label="이용약관 동의"
                  required
                />
                <AgreementRow
                  checked={form.agreePrivacy}
                  onChange={(v) => update("agreePrivacy", v)}
                  label="개인정보 수집·이용 동의"
                  required
                />
                <AgreementRow
                  checked={form.agreeMarketing}
                  onChange={(v) => update("agreeMarketing", v)}
                  label="마케팅 정보 수신 동의"
                />
              </div>
            </FormSection>

            {/* 제출 */}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn btn-dark btn-lg w-full mt-2"
            >
              {submitting ? "처리 중..." : "회원가입"}
            </button>

            {!canSubmit && !submitting && (
              <p className="t-caption text-center" style={{ color: "var(--ink-light)" }}>
                모든 필수 항목을 정확히 입력해주세요
              </p>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .signup-form .ds-input {
          height: 44px;
          padding-top: 0;
          padding-bottom: 0;
        }
        .signup-form .signup-aligned-btn {
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
      {errorMessage && (
        <p className="ds-input-msg is-error">{errorMessage}</p>
      )}
    </div>
  );
}

function AgreementRow({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="chk-wrap">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="t-small" style={{ color: "var(--ink)" }}>
        {label}{" "}
        <span style={{ color: required ? "var(--alert-red)" : "var(--neutral-stone)" }}>
          ({required ? "필수" : "선택"})
        </span>
      </span>
    </label>
  );
}
