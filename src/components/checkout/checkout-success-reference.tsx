"use client";

import { useSearchParams } from "next/navigation";

export function CheckoutSuccessReference() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return null;
  }

  return (
    <p className="mt-5 break-all bg-slate-50 p-3 text-xs font-bold text-slate-500">
      Stripe session: {sessionId}
    </p>
  );
}
