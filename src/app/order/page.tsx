import { Suspense } from "react";
import { OrderClient } from "./_components/OrderClient";

export default function OrderPage() {
  return (
    <Suspense>
      <OrderClient />
    </Suspense>
  );
}
