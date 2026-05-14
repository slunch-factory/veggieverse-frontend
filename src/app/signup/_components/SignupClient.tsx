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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AtSign,
  CalendarDays,
  Check,
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { KakaoPostcodeModal } from "@/components/modals/KakaoPostcodeModal";
import { AlreadyRegisteredModal } from "@/components/modals/AlreadyRegisteredModal";
import { apiFetch } from "@/lib/api/client";
import { checkEmailExists } from "@/lib/api/user";
import { useUser } from "@/contexts/UserContext";
import {
  linkPasswordAction,
  signInWithKakaoAction,
  signUpAction,
} from "@/app/auth/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface FormState {
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  name: string;
  birthday: string; // yyyy-MM-dd
  postalCode: string;
  address: string;
  addressDetail: string;
  agreeAge: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketingSms: boolean;
  agreeMarketingEmail: boolean;
}

const INITIAL_FORM: FormState = {
  email: "",
  password: "",
  passwordConfirm: "",
  phone: "",
  name: "",
  birthday: "",
  postalCode: "",
  address: "",
  addressDetail: "",
  agreeAge: false,
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketingSms: false,
  agreeMarketingEmail: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^01[0-9]-\d{3,4}-\d{4}$/;
const NAME_RE = /^[가-힣a-zA-Z\s]+$/;

/**
 * case2-1-II "이메일 연동하기"에서 step 1 비번을 카카오 OAuth redirect 사이에 임시 보관하는 키.
 * link 화면 진입 시 자동으로 폼에 채워 사용자의 추가 입력을 생략한다.
 * 사용 즉시 sessionStorage에서 삭제하여 비번 평문이 오래 남지 않게 한다.
 */
const PENDING_LINK_PASSWORD_KEY = "veggieverse-pending-link-password";

/**
 * case2-1-II "카카오로 로그인" 클릭 시 OAuth redirect 사이에 의도를 보관하는 키.
 * callback이 prompt=existing-email로 보낸 후 SignupClient가 이 flag를 보고
 * 모달을 우회하고 메인 페이지로 redirect하여 무한 루프를 방지한다.
 * timestamp 형태로 저장하여 OAuth 취소 등으로 잔존한 flag가 다른 흐름에서
 * 잘못 발동되지 않도록 TTL 이내일 때만 인정한다.
 */
const PENDING_KAKAO_LOGIN_KEY = "veggieverse-pending-kakao-login";
const PENDING_FLAG_TTL_MS = 2 * 60 * 1000;

// IME 조합 중간에 한글 자음/모음만 입력되는 시점(ㄱ-ㅎ, ㅏ-ㅣ)을 허용해야
// 조합이 깨지지 않는다. 검증(NAME_RE)은 조합 완료된 완성 글자만 통과시키므로 안전.
function filterLetters(v: string) {
  return v.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, "");
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

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLinkMode = searchParams.get("link") === "1";
  /** case1-1-II: 자사몰 화면에서 카카오 버튼 클릭 → 자사몰 동일 이메일 발견 → 모달로 선택권 제공 진입. */
  const isExistingEmailPrompt = searchParams.get("prompt") === "existing-email";
  const { isLoggedIn, isLoadingSession, user: currentUser, refetchProfile } = useUser();

  const [step, setStep] = useState<1 | 2>(1);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [postcodeOpen, setPostcodeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [existingEmailModalOpen, setExistingEmailModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Kakao 플로우: 카카오 세션이 있으면 1단계(이메일/비번) 패스하고 2단계(프로필)부터 시작.
  // 단, isLinkMode(자사몰 동일 이메일 연동) / isExistingEmailPrompt(case1-1-II 모달) 케이스는 점프 금지.
  useEffect(() => {
    if (
      !isLoadingSession &&
      isLoggedIn &&
      step === 1 &&
      !isLinkMode &&
      !isExistingEmailPrompt
    ) {
      setStep(2);
    }
  }, [isLoadingSession, isLoggedIn, step, isLinkMode, isExistingEmailPrompt]);

  // case1-1-II / 2-1-II 공용 진입 처리. sessionStorage flag 우선 순서:
  //   1) PENDING_KAKAO_LOGIN_KEY (case2-1-II "카카오로 로그인") → 메인 페이지로 직행
  //   2) PENDING_LINK_PASSWORD_KEY (case2-1-II "이메일 연동") → link 화면으로 직행
  //   3) flag 없음 → case1-1-II 모달 표시
  // flag는 TTL 이내일 때만 인정. 만료된 잔존 flag는 그냥 정리하고 통과.
  useEffect(() => {
    if (!isExistingEmailPrompt) return;
    if (typeof window !== "undefined") {
      const kakaoLoginRaw = sessionStorage.getItem(PENDING_KAKAO_LOGIN_KEY);
      const kakaoLoginTs = kakaoLoginRaw ? Number(kakaoLoginRaw) : 0;
      if (kakaoLoginTs && Date.now() - kakaoLoginTs < PENDING_FLAG_TTL_MS) {
        sessionStorage.removeItem(PENDING_KAKAO_LOGIN_KEY);
        router.replace("/");
        return;
      }
      if (kakaoLoginRaw) sessionStorage.removeItem(PENDING_KAKAO_LOGIN_KEY);

      // case2-1-II "이메일 연동" flag — TTL 이내일 때만 link 화면으로. 만료는 정리만.
      const linkPwdRaw = sessionStorage.getItem(PENDING_LINK_PASSWORD_KEY);
      if (linkPwdRaw) {
        let linkPwdValid = false;
        try {
          const parsed = JSON.parse(linkPwdRaw) as { ts?: unknown };
          if (
            typeof parsed.ts === "number" &&
            Date.now() - parsed.ts < PENDING_FLAG_TTL_MS
          ) {
            linkPwdValid = true;
          }
        } catch {
          /* corrupted */
        }
        if (linkPwdValid) {
          // sessionStorage는 link useEffect에서 consume — 여기서는 정리하지 않음.
          router.replace("/signup?link=1");
          return;
        }
        sessionStorage.removeItem(PENDING_LINK_PASSWORD_KEY);
      }
    }
    if (currentUser?.email) {
      setForm((prev) => ({ ...prev, email: currentUser.email }));
      setExistingEmailModalOpen(true);
    }
  }, [isExistingEmailPrompt, currentUser?.email, router]);

  // case2-1-II "이메일 연동하기" 흐름: step 1에서 입력한 비번을 OAuth redirect 사이에 sessionStorage로
  // 임시 전달받아 link 화면에서 자동 채움. 사용자는 추가 입력 없이 "연동하기"만 누르면 된다.
  // TTL 이내인 경우만 인정 — OAuth 취소 등으로 잔존한 만료 데이터는 사용하지 않고 정리.
  useEffect(() => {
    if (!isLinkMode || typeof window === "undefined") return;
    const raw = sessionStorage.getItem(PENDING_LINK_PASSWORD_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { password?: unknown; ts?: unknown };
      if (
        typeof parsed.password === "string" &&
        typeof parsed.ts === "number" &&
        Date.now() - parsed.ts < PENDING_FLAG_TTL_MS
      ) {
        setLinkPassword(parsed.password);
        setLinkPasswordConfirm(parsed.password);
      }
    } catch {
      /* corrupted — 무시하고 정리 */
    }
    sessionStorage.removeItem(PENDING_LINK_PASSWORD_KEY);
  }, [isLinkMode]);

  // Kakao 이름 자동 채우기
  useEffect(() => {
    if (currentUser?.name) {
      setForm((prev) => (prev.name ? prev : { ...prev, name: currentUser.name }));
    }
  }, [currentUser?.name]);

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
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImagePreview(reader.result);
        setProfileImageFile(file);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const allAgreed =
    form.agreeAge &&
    form.agreeTerms &&
    form.agreePrivacy &&
    form.agreeMarketingSms &&
    form.agreeMarketingEmail;
  const toggleAllAgreements = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      agreeAge: checked,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketingSms: checked,
      agreeMarketingEmail: checked,
    }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.email && !EMAIL_RE.test(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (form.password && form.password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.passwordConfirm && form.password !== form.passwordConfirm)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (form.phone && !PHONE_RE.test(form.phone)) e.phone = "010-0000-0000 형식으로 입력해 주세요.";
    if (form.name && !NAME_RE.test(form.name)) e.name = "한글/영문만 사용할 수 있습니다.";
    if (form.birthday) {
      const today = new Date();
      const d = new Date(form.birthday);
      if (Number.isNaN(d.getTime()) || d > today) e.birthday = "올바른 생년월일을 입력해 주세요.";
    }
    return e;
  }, [form]);

  const canStep1 = Boolean(
    form.email.trim() &&
      form.password.trim() &&
      form.passwordConfirm.trim() &&
      form.password === form.passwordConfirm &&
      !errors.email &&
      !errors.password &&
      !errors.passwordConfirm,
  );

  const canStep2 = Boolean(
    form.phone.trim() &&
      form.name.trim() &&
      form.birthday.trim() &&
      form.postalCode.trim() &&
      form.address.trim() &&
      profileImageFile &&
      form.agreeAge &&
      form.agreeTerms &&
      form.agreePrivacy &&
      !errors.phone &&
      !errors.name &&
      !errors.birthday,
  );

  // 카카오 OAuth 트리거 — 모달에서 '카카오로 계속하기' 선택 시 호출.
  const startKakaoLogin = async () => {
    setStep1Error(null);
    const result = await signInWithKakaoAction("/");
    if (!result.ok) {
      setStep1Error(result.error);
      return;
    }
    window.location.href = result.url;
  };

  // ── 1단계: 이메일 중복(카카오) 확인 → Supabase 계정 생성 → JWT 발급 ──
  const handleStep1Submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canStep1 || submitting) return;
    setSubmitting(true);
    setStep1Error(null);

    // 0) 이메일 가입 여부 사전 확인 — 카카오로 이미 가입된 이메일이면 안내 모달로 분기
    const emailCheck = await checkEmailExists(form.email.trim());
    if (emailCheck.rateLimited) {
      setSubmitting(false);
      setStep1Error("요청이 많아 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (emailCheck.exists) {
      setSubmitting(false);
      setExistingEmailModalOpen(true);
      return;
    }

    // 1) Supabase 계정 생성 (Server Action — 쿠키에 세션 자동 저장)
    const signUpResult = await signUpAction({
      email: form.email.trim(),
      password: form.password,
    });

    if (!signUpResult.ok) {
      setSubmitting(false);
      // email-check를 우회한 케이스(백엔드/Supabase 동기화 지연 등) — 동일 모달로 안내
      if (signUpResult.alreadyRegistered) {
        setExistingEmailModalOpen(true);
        return;
      }
      console.warn("[signup/supabase]", signUpResult.error);
      setStep1Error(signUpResult.error);
      return;
    }

    // 2) 백엔드 JWT 발급
    const res = await apiFetch("/api/v1/veggieverse/auth/token", {
      method: "POST",
      body: { email: form.email.trim(), password: form.password },
      auth: "none",
    });

    setSubmitting(false);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[signup/token]", res.status, errBody);
      setStep1Error("계정 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const data = await res.json().catch(() => null) as Record<string, unknown> | null;
    const token =
      typeof data?.accessToken === "string"
        ? data.accessToken
        : typeof data?.token === "string"
          ? data.token
          : null;
    setAuthToken(token);
    setStep(2);
  };

  // ── 2단계: 프로필 정보 → /api/v1/veggieverse/users/profile ────────────
  const handleStep2Submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canStep2 || submitting) return;
    setSubmitting(true);

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("phoneNumber", stripPhoneDashes(form.phone));
    fd.append("birthday", form.birthday);
    fd.append("locale", "ko");
    fd.append("marketingSms", String(form.agreeMarketingSms));
    fd.append("marketingEmail", String(form.agreeMarketingEmail));
    fd.append("address.zipCode", form.postalCode);
    fd.append("address.street", form.address);
    fd.append("address.detail", form.addressDetail);
    if (profileImageFile) fd.append("image", profileImageFile);

    // 자사몰 가입 흐름 (authToken 있음): Supabase 메타데이터에 이름 추가 후
    // name 클레임이 포함된 백엔드 JWT 재발급.
    // 카카오 가입 흐름 (authToken 없음): Supabase 메타데이터 갱신 + refreshSession 으로
    // 쿠키 access_token도 갱신 → proxy가 갱신된 토큰을 백엔드로 forward.
    let effectiveToken = authToken;
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.updateUser({ data: { full_name: form.name.trim() } });
    if (authToken) {
      const tokenRes = await apiFetch("/api/v1/veggieverse/auth/token", {
        method: "POST",
        body: { email: form.email.trim(), password: form.password },
        auth: "none",
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json().catch(() => null) as Record<string, unknown> | null;
        effectiveToken =
          typeof tokenData?.accessToken === "string"
            ? tokenData.accessToken
            : typeof tokenData?.token === "string"
              ? tokenData.token
              : authToken;
      }
    } else {
      // 카카오 가입: 갱신된 user_metadata가 새 access_token에 반영되도록 강제 refresh.
      await supabase.auth.refreshSession();
    }

    const res = await apiFetch("/api/v1/veggieverse/users/profile", {
      method: "POST",
      body: fd,
      auth: effectiveToken ? "none" : "required",
      ...(effectiveToken ? { headers: { Authorization: `Bearer ${effectiveToken}` } } : {}),
    });

    setSubmitting(false);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[signup/profile]", res.status, errBody);
      return;
    }

    // Header/마이페이지 등이 새 프로필 이미지를 즉시 반영하도록 트리거
    refetchProfile();
    setSignupSuccess(true);
  };

  // ── 계정 연동 모드 (Kakao 계정 + 자사몰 비밀번호 추가) ────────────────
  const [linkPassword, setLinkPassword] = useState("");
  const [linkPasswordConfirm, setLinkPasswordConfirm] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const linkPasswordError =
    linkPassword && linkPassword.length < 8 ? "비밀번호는 8자 이상이어야 합니다." : undefined;
  const linkConfirmError =
    linkPasswordConfirm && linkPassword !== linkPasswordConfirm
      ? "비밀번호가 일치하지 않습니다."
      : undefined;
  const canLink = Boolean(
    linkPassword.length >= 8 &&
      linkPassword === linkPasswordConfirm &&
      !linkPasswordError &&
      !linkConfirmError,
  );

  const handleLinkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canLink || submitting) return;
    setSubmitting(true);
    setLinkError(null);

    // 카카오 supabase 세션에 비번을 추가 — providers에 email 인증 활성화.
    // 카카오 가입자는 자사몰 백엔드에 profile이 이미 있다고 가정하므로 추가 프로필 단계 없이 홈으로 보낸다.
    const result = await linkPasswordAction(linkPassword);
    setSubmitting(false);
    if (!result.ok) {
      setLinkError(result.error);
      return;
    }

    // 임시 보관한 비번은 즉시 정리.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(PENDING_LINK_PASSWORD_KEY);
    }

    refetchProfile();
    router.push("/");
  };
  // ─────────────────────────────────────────────────────────────────────

  if (isLoadingSession) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "60vh", background: "var(--bg-pale)" }}
      />
    );
  }

  if (signupSuccess) {
    return (
      <div
        className="min-h-[80vh] flex items-center justify-center px-4 py-12"
        style={{ background: "var(--bg-pale)" }}
      >
        <div
          className="w-full max-w-[400px] bg-white border border-black rounded-[16px] px-[28px] py-[40px] text-center animate-fadeIn"
        >
          <div
            className="mx-auto mb-[20px] flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--ink)",
            }}
            aria-hidden
          >
            <Check size={32} strokeWidth={2.5} color="var(--bg-white)" />
          </div>
          <h1 className="t-h2 mb-[8px]" style={{ color: "var(--ink)" }}>
            회원가입이 완료되었어요
          </h1>
          <p
            className="t-body mb-[28px] leading-[1.6]"
            style={{ color: "var(--ink-light)" }}
          >
            빠르고 건강한 식생활의 시작,
            <br />
            베지버스하세요.
          </p>
          <div className="flex flex-col gap-[8px]">
            <Link href="/store" className="btn btn-dark btn-lg w-full">
              쇼핑 시작하기
            </Link>
            <Link
              href="/spirit"
              className="btn btn-ghost btn-lg w-full"
              style={{ borderColor: "var(--ink)" }}
            >
              구독 식단 추천받기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 계정 연동 모드: 카카오 계정에 자사몰 비밀번호 추가 (case1-1-II / case2-1-II 공통).
  if (isLinkMode && isLoggedIn) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
        <div className="mx-auto max-w-[480px] px-4 py-12">
          <h1 className="t-h2 text-center mb-2" style={{ color: "var(--ink)" }}>
            자사몰 계정 연동
          </h1>
          <p className="t-body text-center mb-8" style={{ color: "var(--ink-light)" }}>
            카카오 계정에 비밀번호를 설정하면 이메일로도 로그인할 수 있습니다.
          </p>

          <form onSubmit={handleLinkSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="t-small" style={{ color: "var(--ink)" }}>이메일</span>
              <input
                type="email"
                className="ds-input"
                value={currentUser?.email ?? ""}
                readOnly
                style={{ height: 48, paddingTop: 0, paddingBottom: 0, background: "var(--bg-off)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="t-small" style={{ color: "var(--ink)" }}>
                비밀번호<span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>
              </span>
              <input
                type="password"
                className={`ds-input${linkPasswordError ? " is-error" : ""}`}
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                placeholder="8자 이상"
                autoComplete="new-password"
                style={{ height: 48, paddingTop: 0, paddingBottom: 0 }}
              />
              {linkPasswordError && <p className="ds-input-msg is-error">{linkPasswordError}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="t-small" style={{ color: "var(--ink)" }}>
                비밀번호 확인<span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>
              </span>
              <input
                type="password"
                className={`ds-input${linkConfirmError ? " is-error" : ""}`}
                value={linkPasswordConfirm}
                onChange={(e) => setLinkPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                autoComplete="new-password"
                style={{ height: 48, paddingTop: 0, paddingBottom: 0 }}
              />
              {linkConfirmError && <p className="ds-input-msg is-error">{linkConfirmError}</p>}
              {!linkConfirmError && linkPasswordConfirm && linkPassword === linkPasswordConfirm && (
                <p className="t-caption mt-0.5" style={{ color: "var(--primary)" }}>
                  비밀번호가 일치합니다.
                </p>
              )}
            </div>

            {linkError && <p className="ds-input-msg is-error">{linkError}</p>}

            <button
              type="submit"
              disabled={!canLink || submitting}
              className="btn btn-dark btn-lg w-full mt-2"
            >
              {submitting ? "처리 중..." : "연동하기"}
            </button>
          </form>
        </div>
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

      <AlreadyRegisteredModal
        isOpen={existingEmailModalOpen}
        mode={isExistingEmailPrompt ? "from-kakao-flow" : "from-email-flow"}
        email={form.email.trim()}
        onClose={() => {
          setExistingEmailModalOpen(false);
          if (isExistingEmailPrompt) {
            // case1-1-II 모달을 그냥 닫는 행위는 "취소"로 간주 — 카카오 세션 해제 후 홈으로.
            void (async () => {
              const supabase = getSupabaseBrowserClient();
              await supabase.auth.signOut();
              router.push("/");
            })();
          }
        }}
        onKakaoAction={() => {
          setExistingEmailModalOpen(false);
          if (isExistingEmailPrompt) {
            // case1-1-II "카카오 연동하기": supabase 자동 identity linking이 활성화되어 있어
            // 카카오 OAuth 시점에 이미 자사몰 user에 카카오 identity가 추가된 상태.
            // 별도 비번 입력 단계(link 화면)를 거치지 않고 홈으로 직행하여 자사몰 기존 비번을 보존한다.
            refetchProfile();
            router.push("/");
          } else {
            // case2-1-II "카카오로 로그인": 카카오 OAuth 후 메인 페이지로 직행하려는 의도.
            // sessionStorage flag로 의도 추적 → callback이 prompt=existing-email로 보낸 후
            // SignupClient의 useEffect가 flag를 보고 모달 우회 + 메인으로 redirect.
            if (typeof window !== "undefined") {
              sessionStorage.setItem(PENDING_KAKAO_LOGIN_KEY, String(Date.now()));
            }
            void startKakaoLogin();
          }
        }}
        onEmailAction={() => {
          setExistingEmailModalOpen(false);
          if (isExistingEmailPrompt) {
            // case1-1-II "이메일로 로그인": 카카오 세션 해제 후 자사몰 로그인 페이지로.
            void (async () => {
              const supabase = getSupabaseBrowserClient();
              await supabase.auth.signOut();
              router.push("/login");
            })();
          } else {
            // case2-1-II "이메일 연동하기": step 1 비번을 sessionStorage에 임시 보관 후 카카오 OAuth 시작.
            // callback이 link=1로 보내고, link 화면 useEffect가 그 비번을 자동 채워 사용자는 "연동하기"만 누르면 된다.
            // OAuth 취소로 인한 잔존 방지를 위해 timestamp 함께 저장 — 사용 시점에 TTL 검증.
            if (typeof window !== "undefined" && form.password) {
              sessionStorage.setItem(
                PENDING_LINK_PASSWORD_KEY,
                JSON.stringify({ password: form.password, ts: Date.now() }),
              );
            }
            void startKakaoLogin();
          }
        }}
      />

      <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
        <div className="mx-auto max-w-[560px] px-4 py-5 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 t-small mb-4 sm:mb-6"
            style={{ color: "var(--ink-light)" }}
          >
            <ChevronLeft size={16} />
            홈으로
          </Link>

          <h1 className="flex justify-center t-h2 mb-4 sm:mb-6" style={{ color: "var(--ink)" }}>
            회원가입
          </h1>

          {/* 단계 표시 — 카카오 가입은 step 1 패스, 자사몰 신규만 1·2단계 표시. */}
          {!isLoggedIn && (
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <StepIndicator num={1} active={step === 1} done={step > 1} label="계정 정보" />
              <div
                style={{ flex: 1, maxWidth: 48, height: 1, background: "var(--neutral-stone)" }}
              />
              <StepIndicator num={2} active={step === 2} done={false} label="프로필 정보" />
            </div>
          )}

          {/* ── 1단계: 계정 정보 ── */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="signup-form flex flex-col gap-5">
              <FormSection icon={<User size={16} strokeWidth={1.5} />} title="계정 정보">
                <FormField label="이메일" required errorMessage={errors.email}>
                  <input
                    type="email"
                    className={`ds-input${errors.email ? " is-error" : ""}`}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="example@slunch.com"
                    autoComplete="email"
                    inputMode="email"
                  />
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

              {step1Error && (
                <p className="ds-input-msg is-error text-center">{step1Error}</p>
              )}

              <button
                type="submit"
                disabled={!canStep1 || submitting}
                className="btn btn-dark btn-lg w-full mt-2"
              >
                {submitting ? "처리 중..." : "다음"}
              </button>
            </form>
          )}

          {/* ── 2단계: 프로필 정보 ── */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="signup-form flex flex-col gap-5">
              <FormSection icon={<AtSign size={16} strokeWidth={1.5} />} title="기본 정보">
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
                      className="signup-aligned-btn flex items-center justify-center px-3 flex-shrink-0"
                      style={{ color: "var(--ink-light)" }}
                      aria-hidden
                    >
                      <CalendarDays size={16} />
                    </span>
                  </div>
                </FormField>
              </FormSection>

              <FormSection icon={<MapPin size={16} strokeWidth={1.5} />} title="주소">
                <FormField label="주소" required>
                  <div className="flex items-stretch gap-2">
                    <input
                      value={form.postalCode}
                      readOnly
                      placeholder="우편번호"
                      className="ds-input signup-postal-input"
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

              <FormSection icon={<ImageIcon size={16} strokeWidth={1.5} />} title="프로필 사진">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div
                    className="flex shrink-0 items-center justify-center overflow-hidden self-center sm:self-auto"
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: "50%",
                      background: "var(--bg-off)",
                      border: "1px solid var(--ink)",
                    }}
                  >
                    {profileImagePreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={profileImagePreview}
                        alt="프로필 미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} color="var(--neutral-stone)" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <FormField label="프로필 사진" required>
                      {profileImageFile ? (
                        <div className="flex items-stretch gap-2">
                          <input
                            type="text"
                            className="ds-input"
                            value={`📎 ${profileImageFile.name}`}
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
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-ghost signup-aligned-btn w-full gap-1.5"
                          style={{ border: "1px solid var(--neutral-stone)" }}
                        >
                          <Upload size={14} />
                          이미지 업로드
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {!profileImageFile && (
                        <p className="t-caption mt-1.5" style={{ color: "var(--neutral-stone)" }}>
                          JPG / PNG / WebP, 최대 5MB
                        </p>
                      )}
                    </FormField>
                  </div>
                </div>
              </FormSection>

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
                    checked={form.agreeMarketingSms}
                    onChange={(v) => update("agreeMarketingSms", v)}
                    label="SMS 마케팅 수신 동의"
                  />
                  <AgreementRow
                    checked={form.agreeMarketingEmail}
                    onChange={(v) => update("agreeMarketingEmail", v)}
                    label="이메일 마케팅 수신 동의"
                  />
                </div>
              </FormSection>

              <div className="flex gap-3 mt-2">
                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => { setStep(1); }}
                    className="btn btn-ghost btn-lg"
                    style={{ border: "1px solid var(--ink)", flex: "0 0 auto" }}
                  >
                    이전
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!canStep2 || submitting}
                  className="btn btn-dark btn-lg w-full"
                >
                  {submitting ? "처리 중..." : "회원가입"}
                </button>
              </div>

              {!canStep2 && !submitting && (
                <p className="t-caption text-center" style={{ color: "var(--ink-light)" }}>
                  모든 필수 항목을 정확히 입력해주세요
                </p>
              )}
            </form>
          )}
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
        .signup-form .signup-postal-input {
          width: 140px;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .signup-form .signup-postal-input {
            width: 100%;
            min-width: 0;
            flex: 1;
          }
          .signup-form .signup-aligned-btn {
            padding-left: 14px;
            padding-right: 14px;
            font-size: 13px;
          }
          .signup-form .signup-section-header {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .signup-form .signup-section-body {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── 보조 컴포넌트 ─── */

function StepIndicator({
  num,
  active,
  done,
  label,
}: {
  num: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  const filled = active || done;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center t-small"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: filled ? "var(--ink)" : "transparent",
          border: `1.5px solid ${filled ? "var(--ink)" : "var(--neutral-stone)"}`,
          color: filled ? "var(--bg-white)" : "var(--neutral-stone)",
          fontWeight: 600,
        }}
      >
        {num}
      </div>
      <span
        className="t-caption"
        style={{ color: filled ? "var(--ink)" : "var(--neutral-stone)", whiteSpace: "nowrap" }}
      >
        {label}
      </span>
    </div>
  );
}

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
        className="signup-section-header px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--neutral-stone)", color: "var(--ink)" }}
      >
        {icon}
        <h2 className="t-h3" style={{ color: "var(--ink)" }}>{title}</h2>
      </header>
      <div className="signup-section-body px-5 py-5 flex flex-col gap-4">{children}</div>
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
