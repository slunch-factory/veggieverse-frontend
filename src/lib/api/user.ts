const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

export interface UserProfile {
  name?: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  address?: string;
  addressDetail?: string;
}

const FIXED_USER_ID = 52;

export async function getUserProfile(): Promise<UserProfile | null> {
  // TODO: 로그인 연동 후 API 호출로 교체 (userId: FIXED_USER_ID = 52)
  return {
    name: "testuser",
    phone: "010-1111-1111",
    email: "slunch@slunch.co.kr",
    postalCode: "01234",
    address: "서울특별시 xx구 xx동",
    addressDetail: "101호",
  };
}
