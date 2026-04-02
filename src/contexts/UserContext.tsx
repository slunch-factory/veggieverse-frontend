"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface UserProfile {
  profileImage: string | null;
  veganType: string | null;
  savedAt: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  spiritName: string | null;
}

interface UserContextType {
  userProfile: UserProfile;
  user: User | null;
  isLoggedIn: boolean;
  saveProfile: (profileImage: string, veganType: string) => void;
  resetProfile: () => void;
  login: (user: User) => void;
  logout: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  profileImage: null,
  veganType: null,
  savedAt: null,
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("veggieverse-profile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    const savedUser = localStorage.getItem("veggieverse-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
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

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem("veggieverse-user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("veggieverse-user");
  }, []);

  return (
    <UserContext.Provider value={{ userProfile, user, isLoggedIn: !!user, saveProfile, resetProfile, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
