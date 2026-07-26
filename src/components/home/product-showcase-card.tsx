"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ShowcaseItem } from "@/config/home";
import { cn } from "@/lib/utils";

type ProductShowcaseCardProps = {
  item: ShowcaseItem;
  index: number;
};

export function ProductShowcaseCard({ item, index }: ProductShowcaseCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const glitchDirection = getGlitchDirection(index);

  return (
    <motion.article
      initial={{ opacity: 0, y: 36, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.08 }}
      whileHover={{ y: -10 }}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-xl"
    >
      <Link href={item.href} className="block">
        <div className={`scroll-glitch-media glitch-${glitchDirection} relative aspect-[4/5] overflow-hidden border-b border-white/10`} style={{ "--scroll-glitch-image": `url(${item.imageUrl})` } as CSSProperties}>
          <motion.div
            className="relative h-full w-full"
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.035, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover saturate-[1.05]"
            />
          </motion.div>
          {!shouldReduceMotion ? <ScrollGlitchLayer /> : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.76))]" />
          <div className="pointer-events-none absolute inset-0 translate-x-[-135%] skew-x-[-18deg] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.05)_34%,rgba(255,255,255,0.62)_48%,rgba(168,85,247,0.24)_58%,transparent_72%)] opacity-0 transition duration-700 ease-out group-hover:translate-x-[135%] group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_18%,rgba(168,85,247,0.28),transparent_42%)]" />
          <motion.div
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/30 backdrop-blur"
            whileHover={{ rotate: 8, scale: 1.05 }}
          >
            <ArrowUpRight size={20} />
          </motion.div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="inline-flex rounded-full border border-white/10 bg-white/12 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-white backdrop-blur">
              {item.label}
            </p>
            <div className={cn("mt-3 h-1 w-24 bg-gradient-to-r", item.tone)} />
          </div>
        </div>
        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02)),rgba(9,9,18,0.72)] p-5">
          <h3 className="text-[1.45rem] font-normal leading-[1.02] tracking-[-0.055em] text-white sm:text-[1.6rem]">{item.name}</h3>
          <p className="mt-2 text-sm font-medium text-violet-100/52">{item.meta}</p>
        </div>
      </Link>
    </motion.article>
  );
}

function getGlitchDirection(index: number) {
  return ["left", "right", "up", "down", "diag"][index % 5];
}

function ScrollGlitchLayer() {
  return (
    <motion.span
      className="scroll-glitch-layer"
      aria-hidden="true"
      initial={{ opacity: 0, x: 0, clipPath: "inset(0 0 0 0)" }}
      whileInView={{
        opacity: [0, 0.78, 0.54, 0.68, 0.38, 0],
        x: ["0px", "var(--glitch-x-1)", "var(--glitch-x-2)", "var(--glitch-x-3)", "var(--glitch-x-4)", "0px"],
        y: ["0px", "var(--glitch-y-1)", "var(--glitch-y-2)", "var(--glitch-y-3)", "var(--glitch-y-4)", "0px"],
        clipPath: ["inset(0 0 0 0)", "inset(8% 0 62% 0)", "inset(54% 0 12% 0)", "inset(26% 0 38% 0)", "inset(70% 0 6% 0)", "inset(0 0 0 0)"],
      }}
      viewport={{ once: true, margin: "-14%" }}
      transition={{ duration: 1.28, ease: "linear", times: [0, 0.14, 0.3, 0.48, 0.68, 1] }}
    />
  );
}
