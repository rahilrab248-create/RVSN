"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden border-b border-white/10 bg-[#030307] px-4 pb-16 pt-22 text-white sm:pt-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.28),transparent_34rem),radial-gradient(circle_at_80%_10%,rgba(120,119,198,0.16),transparent_32rem),linear-gradient(180deg,#05030a_0%,#090411_52%,#000_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-violet-500/18 via-transparent to-transparent" />
      <div className="container-shell grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200/70">{eyebrow}</p>
          <h1 className="mt-4 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-violet-100/62">{description}</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-2">
            {["Control", "Pace", "Finish"].map((item) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/8 px-3 py-4 text-center shadow-[inset_0_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/72">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="mx-auto w-full max-w-[480px] rounded-[24px] border border-white/12 bg-white/8 p-6 shadow-[inset_0_1px_rgba(255,255,255,0.14),0_28px_90px_rgba(0,0,0,0.44)] backdrop-blur-2xl sm:p-8"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
