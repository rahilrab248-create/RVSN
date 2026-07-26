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
      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.75, ease: "easeOut" }}
      className="max-w-2xl"
    >
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200/70">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-normal leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 text-pretty text-sm leading-7 text-violet-100/68 sm:text-base">{description}</p>
    </motion.div>
  );
}
