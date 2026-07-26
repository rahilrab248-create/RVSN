"use client";

import type { PayHereCheckoutInput, PayHereCheckoutSession } from "@/types/payhere";

export async function createPayHereSession(input: PayHereCheckoutInput) {
  const response = await fetch("/api/payhere/create-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as PayHereCheckoutSession & { message?: string; ok?: boolean };

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to start PayHere checkout.");
  }

  return data;
}

export function submitPayHereCheckout(session: PayHereCheckoutSession) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = session.actionUrl;
  form.style.display = "none";

  Object.entries(session.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
