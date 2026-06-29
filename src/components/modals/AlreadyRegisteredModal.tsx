"use client";

import { Modal } from "@/components/ui/Modal";

const KAKAO_YELLOW = "#FEE500";
const KAKAO_LABEL = "rgba(0, 0, 0, 0.85)";

/**
 * 모달이 어느 케이스에서 띄워졌는지에 따라 라벨/안내 문구가 달라진다.
 *
 * - "from-kakao-flow" (case1-1-II):
 *   자사몰 회원가입 화면에서 카카오 버튼 → callback → /signup?prompt=existing-email.
 *   즉 자사몰에 이미 가입한 사용자가 카카오를 시도한 케이스.
 *   ▸ 카카오 버튼: "카카오 연동하기" — 자사몰 계정에 카카오 추가 (link 흐름)
 *   ▸ 이메일 버튼: "이메일로 로그인" — 자사몰 이메일/비번 로그인 페이지로
 *
 * - "from-email-flow" (case2-1-II):
 *   자사몰 회원가입 step 1 폼에서 이메일 입력 → checkEmailExists, providers가 카카오 전용.
 *   즉 카카오로만 가입한 사용자가 자사몰을 시도한 케이스.
 *   ▸ 카카오 버튼: "카카오로 로그인" — 카카오 OAuth로 로그인
 *   ▸ 이메일 버튼: "이메일 연동하기" — 카카오 OAuth 시작 → callback이 /signup?link=1로 보내 비번 추가
 *
 * - "existing-email-login":
 *   자사몰 회원가입 step 1 폼에서 이메일 입력 → checkEmailExists, providers에 email 포함.
 *   즉 이미 이메일/비번으로 가입한 사용자가 다시 가입을 시도한 케이스.
 *   ▸ 이메일 버튼(primary): "이메일로 로그인" — 이메일 로그인 페이지로 (email prefill)
 *   ▸ 카카오 버튼: "카카오로 로그인" — 카카오도 연동된 경우만 노출 (hasKakaoLink)
 */
export type AlreadyRegisteredModalMode =
  | "from-kakao-flow"
  | "from-email-flow"
  | "existing-email-login";

interface AlreadyRegisteredModalProps {
  isOpen: boolean;
  mode: AlreadyRegisteredModalMode;
  email: string;
  onClose: () => void;
  /** 카카오 버튼 클릭 — mode에 따라 의미가 다름 (위 주석 참고). */
  onKakaoAction: () => void;
  /** 이메일 버튼 클릭 — mode에 따라 의미가 다름 (위 주석 참고). */
  onEmailAction: () => void;
  /**
   * "existing-email-login" 모드에서만 사용 — 카카오도 연동된 계정인지.
   * false면 카카오 버튼을 숨겨 이메일 로그인만 안내한다. 다른 모드에선 무시.
   */
  hasKakaoLink?: boolean;
}

const COPY: Record<
  AlreadyRegisteredModalMode,
  {
    description: React.ReactNode;
    kakaoLabel: string;
    emailLabel: string;
  }
> = {
  "from-kakao-flow": {
    description: (
      <>
        이 이메일은 자사몰에 이미 가입되어 있습니다.
        <br />
        자사몰 계정으로 <strong style={{ color: "var(--ink)" }}>‘이메일로 로그인’</strong>하거나,
        <br />
        자사몰 계정에 카카오를 추가하려면 <strong style={{ color: "var(--ink)" }}>‘카카오 연동하기’</strong>를 선택해 주세요.
      </>
    ),
    kakaoLabel: "카카오 연동하기",
    emailLabel: "이메일로 로그인",
  },
  "from-email-flow": {
    description: (
      <>
        카카오로 가입하셨다면 <strong style={{ color: "var(--ink)" }}>‘카카오로 로그인’</strong>을,
        <br />
        자사몰 계정으로 연동하려면{" "}
        <strong style={{ color: "var(--ink)" }}>‘이메일 연동하기’</strong>를 선택해 주세요.
      </>
    ),
    kakaoLabel: "카카오로 로그인",
    emailLabel: "이메일 연동하기",
  },
  "existing-email-login": {
    description: (
      <>
        이미 이메일로 가입된 계정입니다.
        <br />
        로그인 후 이용해 주세요.
      </>
    ),
    kakaoLabel: "카카오로 로그인",
    emailLabel: "이메일로 로그인",
  },
};

/**
 * '이미 가입된 이메일' 안내 모달.
 * 진입 case(mode)에 따라 라벨/안내 문구가 달라진다.
 */
export function AlreadyRegisteredModal({
  isOpen,
  mode,
  email,
  onClose,
  onKakaoAction,
  onEmailAction,
  hasKakaoLink = true,
}: AlreadyRegisteredModalProps) {
  const copy = COPY[mode];
  // "existing-email-login"은 이메일 로그인이 주 동작 — 이메일 버튼을 dark primary로 위에 두고
  //  카카오 버튼은 연동된 경우(hasKakaoLink)에만 노출한다. 나머지 모드는 카카오 우선(기존 레이아웃).
  const emailPrimary = mode === "existing-email-login";
  const showKakao = !emailPrimary || hasKakaoLink;

  const kakaoButton = (
    <button
      key="kakao"
      type="button"
      onClick={onKakaoAction}
      className="w-full flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
      style={{
        height: 44,
        background: KAKAO_YELLOW,
        color: KAKAO_LABEL,
        border: "none",
        borderRadius: "var(--r-btn)",
        fontSize: 14,
      }}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          background: KAKAO_LABEL,
          color: KAKAO_YELLOW,
          borderRadius: "50%",
          fontSize: 12,
        }}
        aria-hidden
      >
        K
      </span>
      {copy.kakaoLabel}
    </button>
  );

  const emailButton = (
    <button
      key="email"
      type="button"
      onClick={onEmailAction}
      className={emailPrimary ? "btn btn-dark w-full" : "btn btn-ghost w-full"}
      style={{
        height: 44,
        fontSize: 14,
        ...(emailPrimary ? {} : { border: "1px solid var(--ink)" }),
      }}
    >
      {copy.emailLabel}
    </button>
  );

  // 버튼 순서: emailPrimary면 이메일 → (카카오), 아니면 카카오 → 이메일.
  const actionButtons = emailPrimary
    ? [emailButton, showKakao ? kakaoButton : null]
    : [kakaoButton, emailButton];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="already-registered-title"
      zIndex={200}
      className="w-full max-w-[360px] mx-[16px] bg-white border border-black rounded-[16px] px-[24px] py-[28px] text-center"
    >
      <h2 id="already-registered-title" className="t-h3 mb-[12px]" style={{ color: "var(--ink)" }}>
        이미 가입된 이메일입니다
      </h2>
      <p
        className="t-small mb-[16px] break-all"
        style={{ color: "var(--ink)", fontWeight: 600 }}
      >
        {email}
      </p>
      <p
        className="t-small mb-[24px] leading-[1.6]"
        style={{ color: "var(--ink-light)" }}
      >
        {copy.description}
      </p>

      <div className="flex flex-col gap-[8px]">
        {actionButtons}

        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border-none cursor-pointer mt-[4px] t-small"
          style={{ color: "var(--ink-light)", textDecoration: "underline" }}
        >
          취소
        </button>
      </div>
    </Modal>
  );
}
