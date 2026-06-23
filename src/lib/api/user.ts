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
  /** 변경할 프로필 이미지. 첨부하지 않으면 BE는 기존 이미지를 유지. */
  image?: File;
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

/**
 * 백엔드 프로필 완성도 probe — UserContext가 "가입 미완료"를 구분하기 위해 사용.
 * GET /users/profile/completeness 응답으로 row 존재뿐 아니라 필수 필드 충족 여부까지 판단.
 *   - "complete"        : 200 + { complete: true }
 *   - "incomplete"      : 200 + { complete: false } (row는 있으나 step2 미완) 또는 404 (row 자체 없음)
 *   - "unauthenticated" : 401
 *   - "error"           : 그 외 네트워크/서버 오류, 일시적
 */
export type ProfileProbe = "complete" | "incomplete" | "unauthenticated" | "error";

export async function probeProfileStatus(): Promise<ProfileProbe> {
  const res = await apiFetch("/api/v1/veggieverse/users/profile/completeness", {
    auth: "required",
    cache: "no-store",
  });
  if (res.status === 401) return "unauthenticated";
  if (res.status === 404) return "incomplete";
  if (!res.ok) {
    console.warn("[probeProfileStatus] HTTP error:", res.status, res.statusText);
    return "error";
  }
  const data = (await res.json().catch(() => null)) as { complete?: boolean } | null;
  return data?.complete ? "complete" : "incomplete";
}

/**
 * 회원 정보 수정 — multipart/form-data PATCH.
 * BE는 204 No Content를 반환하므로 갱신된 객체는 돌려주지 않는다.
 * 갱신 후 fresh profile이 필요하면 호출 측에서 getUserProfile()을 다시 부른다.
 */
export async function updateUserProfile(
  body: UpdateUserProfileRequest,
): Promise<boolean> {
  const fd = new FormData();
  if (body.name !== undefined) fd.append("name", body.name);
  if (body.phoneNumber !== undefined) fd.append("phoneNumber", body.phoneNumber);
  if (body.birthday !== undefined) fd.append("birthday", body.birthday);
  if (body.locale !== undefined) fd.append("locale", body.locale);
  if (body.marketingSms !== undefined) fd.append("marketingSms", String(body.marketingSms));
  if (body.marketingEmail !== undefined) fd.append("marketingEmail", String(body.marketingEmail));
  if (body.address) {
    fd.append("address.zipCode", body.address.zipCode);
    fd.append("address.street", body.address.street);
    fd.append("address.detail", body.address.detail);
  }
  if (body.image) fd.append("image", body.image);

  const res = await apiFetch("/api/v1/veggieverse/users/profile", {
    method: "PATCH",
    body: fd,
    auth: "required",
  });
  if (!res.ok) {
    console.error("[updateUserProfile] HTTP error:", res.status, res.statusText);
    return false;
  }
  return true;
}

/**
 * 회원 탈퇴 신청 — DELETE /users/profile.
 * BE는 soft delete 후 204 No Content를 반환한다. 성공 시 호출 측에서
 * Supabase 세션 종료 + 홈 redirect를 수행한다(UserContext.signOut).
 */
export async function deleteAccount(): Promise<boolean> {
  const res = await apiFetch("/api/v1/veggieverse/users/profile", {
    method: "DELETE",
    auth: "required",
  });
  if (!res.ok) {
    console.error("[deleteAccount] HTTP error:", res.status, res.statusText);
    return false;
  }
  return true;
}

/**
 * 회원 탈퇴 복구 — POST /users/profile/restore.
 * soft delete된 계정을 유예 기간 내에 되살린다.
 */
export async function restoreAccount(): Promise<boolean> {
  const res = await apiFetch("/api/v1/veggieverse/users/profile/restore", {
    method: "POST",
    auth: "required",
  });
  if (!res.ok) {
    console.error("[restoreAccount] HTTP error:", res.status, res.statusText);
    return false;
  }
  return true;
}
