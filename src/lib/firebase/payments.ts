"use client";

import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebase/client";
import type { CartLineItem } from "@/types/cart";
import type { ShippingAddress } from "@/types/ecommerce";

export type StripeCheckoutSessionInput = {
  items: CartLineItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency?: string;
  couponCode?: string | null;
};

export type StripeCheckoutSessionResult = {
  checkoutId: string;
  sessionId: string;
  url: string;
};

export async function createStripeCheckoutSession(input: StripeCheckoutSessionInput) {
  const functions = getFirebaseFunctions();

  if (!functions) {
    throw new Error("Firebase Functions are not configured.");
  }

  const createSession = httpsCallable<StripeCheckoutSessionInput, StripeCheckoutSessionResult>(
    functions,
    "createStripeCheckoutSession",
  );
  const result = await createSession(input);

  if (!result.data.url) {
    throw new Error("Stripe checkout did not return a redirect URL.");
  }

  return result.data;
}
