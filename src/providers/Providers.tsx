"use client";

import { type ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProfileGate } from "@/components/ProfileGate";
import { WithdrawalPendingGate } from "@/components/WithdrawalPendingGate";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <CartProvider>
        <ProfileGate />
        <WithdrawalPendingGate />
        {children}
      </CartProvider>
    </UserProvider>
  );
}
