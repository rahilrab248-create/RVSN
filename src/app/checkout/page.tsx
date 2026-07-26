import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout | RVSN Commerce",
  description: "Secure football ecommerce checkout with shipping, coupons, order summary, and payment options.",
};

export default function Checkout() {
  return <CheckoutPage />;
}
