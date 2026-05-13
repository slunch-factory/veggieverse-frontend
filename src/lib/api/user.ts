import { apiFetch } from "@/lib/api/client";

export interface EmailCheckResult {
  exists: boolean;
  /** rate-limit(429) 시 true. exists는 의미 없음. */
  rateLimited?: boolean;
}

/**
 * 이메일 가입 여부 확인 — consumer.users 의 email 존재 여부만 반환 (provider 미노출).
 * Rate-limit: 분당 30회/IP, 시간당 5회/email.
 */
export async function checkEmailExists(email: string): Promise<EmailCheckResult> {
  const res = await apiFetch(
    `/api/v1/veggieverse/users/email-check?email=${encodeURIComponent(email)}`,
    { auth: "none" },
  );
  if (res.status === 429) return { exists: false, rateLimited: true };
  if (!res.ok) {
    // 백엔드 일시 오류 — signUp으로 fallback되므로 dev overlay를 띄우지 않도록 warn으로 낮춤
    console.warn("[checkEmailExists] HTTP error:", res.status, res.statusText);
    return { exists: false };
  }
  const data = (await res.json().catch(() => null)) as { exists?: boolean } | null;
  return { exists: Boolean(data?.exists) };
}

/** 백엔드 UserProfileResponse 스키마 그대로 매핑 */
export interface UserProfile {
  email: string;
  name: string;
  phoneNumber: string;
  birthday: string; // yyyy-MM-dd
  locale: string;
  marketingSms: boolean;
  marketingEmail: boolean;
  address: {
    zipCode: string | null;
    street: string | null;
    detail: string | null;
  };
  profileImageUrl?: string | null;
}

export interface UpdateUserProfileRequest {
  phoneNumber?: string;
  name?: string;
  birthday?: string;
  locale?: string;
  marketingSms?: boolean;
  marketingEmail?: boolean;
  address?: {
    zipCode: string;
    street: string;
    detail: string;
  };
}

/**
 * 현재 로그인한 사용자의 프로필 조회.
 * 백엔드는 JWT의 `sub` 클레임으로 사용자를 식별 — userId 파라미터 불필요.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const res = await apiFetch("/api/v1/veggieverse/users/profile", {
    auth: "required",
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status !== 401 && res.status !== 404) {
      console.error("[getUserProfile] HTTP error:", res.status, res.statusText);
    }
    return null;
  }
  return (await res.json()) as UserProfile;
}

export async function updateUserProfile(
  body: UpdateUserProfileRequest,
): Promise<UserProfile | null> {
  const res = await apiFetch("/api/v1/veggieverse/users/profile", {
    method: "PATCH",
    body,
    auth: "required",
  });
  if (!res.ok) {
    console.error("[updateUserProfile] HTTP error:", res.status, res.statusText);
    return null;
  }
  return (await res.json()) as UserProfile;
}
