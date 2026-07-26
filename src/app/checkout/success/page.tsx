import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BadgeCheck, Clock, PackageCheck, Truck } from "lucide-react";
import { CheckoutSuccessReference } from "@/components/checkout/checkout-success-reference";

export const metadata: Metadata = {
  title: "Payment Successful | RVSN Commerce",
  description: "Your football order payment was completed successfully.",
};

export default function CheckoutSuccessPage() {
  const steps = [
    { label: "Order received", copy: "Your checkout details are saved.", icon: BadgeCheck },
    { label: "Admin approval", copy: "The store reviews and approves your order.", icon: Clock },
    { label: "Waiting shipment", copy: "Your gear is packed for dispatch.", icon: PackageCheck },
    { label: "Delivering", copy: "Track the final run from your account.", icon: Truck },
  ];

  return (
    <main className="purple-page-shell min-h-screen px-4 pt-24 text-white sm:pt-32">
      <section className="container-shell">
        <div className="mx-auto max-w-3xl rounded-[30px] border border-white/10 bg-white/[0.055] p-7 text-center shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-violet-100/25 bg-violet-300/12 text-violet-100">
            <BadgeCheck size={30} />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-violet-100/58">Order confirmed</p>
          <h1 className="mt-3 text-4xl font-normal tracking-[-0.06em] text-white sm:text-5xl">Your matchday order is in.</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-white/58">
            We have received your order. Admin approval and delivery updates will appear in your account tracking timeline.
          </p>
          <Suspense fallback={null}>
            <CheckoutSuccessReference />
          </Suspense>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.label} className="rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                <step.icon className="text-violet-100" size={20} />
                <p className="mt-3 text-sm font-semibold text-white">{step.label}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/45">{step.copy}</p>
                <span className="mt-4 block h-1 rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-violet-200" style={{ width: index === 0 ? "100%" : "28%" }} />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="grid h-12 place-items-center rounded-full border border-white/12 bg-white/[0.07] px-6 text-sm font-semibold !text-white transition hover:border-white/35 hover:bg-white/[0.14]"
            >
              Continue shopping
            </Link>
            <Link
              href="/account"
              className="grid h-12 place-items-center rounded-full bg-white px-6 text-sm font-extrabold !text-[#05030b] transition hover:bg-violet-100"
            >
              Track order
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
