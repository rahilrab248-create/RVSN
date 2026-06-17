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
    <section className="pitch-grid relative isolate min-h-screen overflow-hidden border-b border-slate-200 px-4 pb-16 pt-28 sm:pt-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-lime-300/30 to-transparent" />
      <div className="container-shell grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-4 text-balance text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-pretty text-base leading-8 text-slate-600">{description}</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-2">
            {["Control", "Pace", "Finish"].map((item) => (
              <div key={item} className="border border-slate-200 bg-white px-3 py-4 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="glass-panel mx-auto w-full max-w-[480px] rounded-lg p-6 sm:p-8"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
