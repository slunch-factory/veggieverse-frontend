const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

export interface UserProfile {
  name?: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  address?: string;
  addressDetail?: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/veggiverse/users/profile`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[getUserProfile] HTTP error:", res.status, res.statusText);
      return null;
    }
    const data: UserProfile = await res.json();
    console.log("%c[getUserProfile] ✅ 프로필 조회 성공", "color: #4A7F52; font-weight: bold;", data);
    return data;
  } catch (err) {
    console.error("[getUserProfile] fetch failed:", err);
    return null;
  }
}
