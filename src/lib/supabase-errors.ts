/**
 * Supabase auth 에러 메시지(영문) → 사용자 친화적 한국어 메시지 매핑.
 * 매칭되지 않는 메시지는 원문 그대로 반환.
 */
export function translateSupabaseAuthError(message: string | undefined | null): string {
  if (!message) return "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

  const m = message.toLowerCase();

  if (m.includes("user already registered")) return "이미 가입된 이메일입니다.";
  if (m.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 일치하지 않습니다.";
  if (m.includes("email not confirmed")) return "이메일 인증이 완료되지 않았습니다.";
  if (m.includes("password should be at least"))
    return "비밀번호는 8자 이상이어야 합니다.";
  if (m.includes("new password should be different from the old password"))
    return "이미 사용 중인 비밀번호입니다. 다른 비밀번호로 입력해 주세요.";
  if (m.includes("same password"))
    return "이미 사용 중인 비밀번호입니다. 다른 비밀번호로 입력해 주세요.";
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "요청이 많아 잠시 후 다시 시도해 주세요.";
  if (m.includes("network") || m.includes("failed to fetch"))
    return "네트워크 연결을 확인해 주세요.";

  return message;
}

/** 'User already registered' 케이스만 구분 — 모달 분기에 사용 */
export function isAlreadyRegisteredError(message: string | undefined | null): boolean {
  if (!message) return false;
  return message.toLowerCase().includes("user already registered");
}

/** 'Email not confirmed' 케이스 구분 — 로그인 시도 시 미인증 계정 판별에 사용 */
export function isEmailNotConfirmedError(message: string | undefined | null): boolean {
  if (!message) return false;
  return message.toLowerCase().includes("email not confirmed");
}
