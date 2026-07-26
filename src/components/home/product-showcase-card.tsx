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
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.62, ease: "easeOut", delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.035] shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl"
    >
      <Link href={item.href} className="block">
        <div className="relative aspect-[4/5] overflow-hidden border-b border-white/8">
          <motion.div
            className="relative h-full w-full"
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.018, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover saturate-[1.02]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.58))]" />
          <motion.div
            className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/12 bg-black/28 text-white backdrop-blur"
            whileHover={{ scale: 1.03 }}
          >
            <ArrowUpRight size={19} />
          </motion.div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="inline-flex rounded-full border border-white/10 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
              {item.label}
            </p>
            <div className={cn("mt-3 h-px w-20 bg-gradient-to-r", item.tone)} />
          </div>
        </div>
        <div className="bg-[#090910] p-5">
          <h3 className="text-[1.35rem] font-normal leading-[1.04] tracking-[-0.05em] text-white sm:text-[1.5rem]">{item.name}</h3>
          <p className="mt-2 text-sm font-medium text-white/48">{item.meta}</p>
        </div>
      </Link>
    </motion.article>
  );
}
