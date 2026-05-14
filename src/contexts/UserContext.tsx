"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOutAction } from "@/app/auth/actions";

interface UserProfile {
  profileImage: string | null;
  veganType: string | null;
  savedAt: string | null;
}

export interface User {
  /** Supabase user UUID (sub claim) */
  id: string;
  name: string;
  email: string;
  spiritName: string | null;
}

interface UserContextType {
  /** 기존 호환용 — Supabase 세션에서 파생 */
  user: User | null;
  isLoggedIn: boolean;
  /** 첫 세션 복원 또는 토큰 갱신이 끝나기 전까지 true */
  isLoadingSession: boolean;

  /** Supabase raw 객체 — 필요한 곳에서 직접 사용 */
  session: Session | null;
  authUser: SupabaseUser | null;
  /** 백엔드 호출 시 Authorization 헤더에 넣을 access token */
  accessToken: string | null;

  /** 백엔드 consumer.users.id (numeric) — provision 후 채워짐 */
  backendUserId: number | null;
  setBackendUserId: (id: number | null) => void;

  /** 로컬 프로필 (스피릿 테스트 결과 등) */
  userProfile: UserProfile;
  saveProfile: (profileImage: string, veganType: string) => void;
  resetProfile: () => void;

  /** 백엔드 프로필 재조회 트리거 — 회원가입/프로필 수정 직후 호출.
   *  값이 바뀌면 이를 구독하는 컴포넌트(Header, mypage 등)가 getUserProfile()을 다시 부른다. */
  profileVersion: number;
  refetchProfile: () => void;

  /** 인증 액션 */
  signOut: () => Promise<void>;
  /** 호환용 alias — 기존 logout() 호출부를 위해 유지 */
  logout: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  profileImage: null,
  veganType: null,
  savedAt: null,
};

const UserContext = createContext<UserContextType | null>(null);

function deriveUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const su = session.user;
  const meta = (su.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof meta.name === "string" ? meta.name : su.email?.split("@")[0] ?? "";
  const spiritName =
    typeof meta.spiritName === "string" ? meta.spiritName : null;
  return {
    id: su.id,
    email: su.email ?? "",
    name,
    spiritName,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [backendUserId, setBackendUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [profileVersion, setProfileVersion] = useState(0);

  /** 로컬 프로필 복원 — Supabase 세션과 무관 */
  useEffect(() => {
    const saved = localStorage.getItem("veggieverse-profile");
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch {
        /* corrupt JSON — 무시 */
      }
    }
  }, []);

  /** Supabase 세션 초기화 + 변경 구독 */
  useEffect(() => {
    let cancelled = false;

    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      setIsLoadingSession(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoadingSession(false);
      // 세션이 끊기면 backend userId도 초기화
      if (!newSession) setBackendUserId(null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const saveProfile = useCallback((profileImage: string, veganType: string) => {
    const newProfile: UserProfile = {
      profileImage,
      veganType,
      savedAt: new Date().toISOString(),
    };
    setUserProfile(newProfile);
    localStorage.setItem("veggieverse-profile", JSON.stringify(newProfile));
  }, []);

  const resetProfile = useCallback(() => {
    localStorage.removeItem("veggieverse-profile");
    setUserProfile(DEFAULT_PROFILE);
  }, []);

  const refetchProfile = useCallback(() => {
    setProfileVersion((v) => v + 1);
  }, []);

  const signOut = useCallback(async () => {
    // 1) 클라이언트 상태 우선 정리 — onAuthStateChange도 뒤이어 발화
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSession(null);
    setBackendUserId(null);
    // 2) localStorage에 남은 앱 자체 키 일괄 정리 (veggieverse-* 모두)
    if (typeof window !== "undefined") {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("veggieverse-")) localStorage.removeItem(key);
      }
    }
    setUserProfile(DEFAULT_PROFILE);
    // 3) Server Action — 쿠키 삭제 후 홈으로 redirect
    await signOutAction();
  }, []);

  const logout = useCallback(() => {
    void signOut();
  }, [signOut]);

  const user = useMemo(() => deriveUser(session), [session]);
  const accessToken = session?.access_token ?? null;

  const value = useMemo<UserContextType>(
    () => ({
      user,
      isLoggedIn: Boolean(session),
      isLoadingSession,
      session,
      authUser: session?.user ?? null,
      accessToken,
      backendUserId,
      setBackendUserId,
      userProfile,
      saveProfile,
      resetProfile,
      profileVersion,
      refetchProfile,
      signOut,
      logout,
    }),
    [
      user,
      session,
      isLoadingSession,
      accessToken,
      backendUserId,
      userProfile,
      saveProfile,
      resetProfile,
      profileVersion,
      refetchProfile,
      signOut,
      logout,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
