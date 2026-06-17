"use client";

import { motion } from "framer-motion";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-2xl"
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-4 text-pretty text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
    </motion.div>
  );
}
