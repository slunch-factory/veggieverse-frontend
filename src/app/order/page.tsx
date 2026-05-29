import { Suspense } from "react";
import { OrderClient } from "./_components/OrderClient";
import { OrderAuthGuard } from "./_components/OrderAuthGuard";

export default function OrderPage() {
  return (
    <Suspense>
      <OrderAuthGuard>
        <OrderClient />
      </OrderAuthGuard>
    </Suspense>
  );
}
