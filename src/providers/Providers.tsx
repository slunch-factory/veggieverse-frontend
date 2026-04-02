"use client";

import { type ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";

export function Providers({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
