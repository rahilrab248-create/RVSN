import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck } from "lucide-react";
import { CheckoutSuccessReference } from "@/components/checkout/checkout-success-reference";

export const metadata: Metadata = {
  title: "Payment Successful | Football Commerce",
  description: "Your football order payment was completed successfully.",
};

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.24),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 pt-32 text-slate-950">
      <section className="mx-auto max-w-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/70 sm:p-12">
        <span className="mx-auto grid size-16 place-items-center bg-lime-300 text-slate-950">
          <BadgeCheck size={30} />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-lime-700">Payment successful</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Your order is confirmed.</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm font-semibold leading-6 text-slate-600">
          Your payment is in. We are packing the kit, checking the details, and getting your order ready for kickoff.
        </p>
        <Suspense fallback={null}>
          <CheckoutSuccessReference />
        </Suspense>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="grid h-12 place-items-center bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-lime-500 hover:text-slate-950"
          >
            Continue shopping
          </Link>
          <Link
            href="/account"
            className="grid h-12 place-items-center border border-slate-300 bg-white px-6 text-sm font-black text-slate-950 transition hover:border-lime-500 hover:text-lime-700"
          >
            View account
          </Link>
        </div>
      </section>
    </main>
  );
}
