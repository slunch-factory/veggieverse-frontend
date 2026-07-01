"use client";

import { type ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CouponProvider } from "@/contexts/CouponContext";
import { ProfileGate } from "@/components/ProfileGate";
import { WithdrawalPendingGate } from "@/components/WithdrawalPendingGate";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <CouponProvider>
              <ToastProvider>
                <ProfileGate />
                <WithdrawalPendingGate />
                {children}
              </ToastProvider>
            </CouponProvider>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </QueryProvider>
  );
}
