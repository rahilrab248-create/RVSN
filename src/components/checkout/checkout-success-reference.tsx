"use client";

import { useSearchParams } from "next/navigation";

export function CheckoutSuccessReference() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  const reference = orderId ?? sessionId;

  if (!reference) {
    return null;
  }

  return (
    <p className="mx-auto mt-5 max-w-xl break-all rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-white/45">
      {orderId ? "Order reference" : "Payment reference"}: {reference}
    </p>
  );
}
