"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ShowcaseItem } from "@/config/home";
import { cn } from "@/lib/utils";

type ProductShowcaseCardProps = {
  item: ShowcaseItem;
  index: number;
};

export function ProductShowcaseCard({ item, index }: ProductShowcaseCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group glass-panel overflow-hidden rounded-lg"
    >
      <Link href={item.href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden border-b border-slate-200">
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
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_44%,rgba(15,23,42,0.18)_86%)]" />
          <div className="pointer-events-none absolute inset-0 translate-x-[-135%] skew-x-[-18deg] bg-[linear-gradient(105deg,transparent_0%,rgba(255,255,255,0.08)_34%,rgba(255,255,255,0.7)_48%,rgba(215,255,47,0.22)_58%,transparent_72%)] opacity-0 transition duration-700 ease-out group-hover:translate-x-[135%] group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.2),transparent_42%)]" />
          <motion.div
            className="absolute right-6 top-6 grid size-12 place-items-center bg-white/90 text-slate-950 shadow-lg backdrop-blur"
            whileHover={{ rotate: 8, scale: 1.05 }}
          >
            <ArrowUpRight size={20} />
          </motion.div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="inline-flex bg-white/90 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-slate-950">
              {item.label}
            </p>
            <div className={cn("mt-3 h-1 w-24 bg-gradient-to-r", item.tone)} />
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-black text-slate-950">{item.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{item.meta}</p>
        </div>
      </Link>
    </motion.article>
  );
}
