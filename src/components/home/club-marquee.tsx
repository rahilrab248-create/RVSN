"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ClubItem } from "@/config/home";
import { cn } from "@/lib/utils";

type ClubMarqueeProps = {
  clubs: ClubItem[];
};

export function ClubMarquee({ clubs }: ClubMarqueeProps) {
  const x = useMotionValue(0);
  const loopRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const loopWidthRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const updateLoopWidth = () => {
      loopWidthRef.current = loopRef.current?.scrollWidth ?? 0;
    };

    updateLoopWidth();
    const observer = new ResizeObserver(updateLoopWidth);

    if (loopRef.current) {
      observer.observe(loopRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const loopWidth = loopWidthRef.current;

    if (shouldReduceMotion || document.visibilityState !== "visible" || isPausedRef.current || !loopWidth) {
      return;
    }

    const speed = window.innerWidth < 768 ? 0.045 : 0.075;
    const nextX = x.get() - delta * speed;
    x.set(nextX <= -loopWidth ? nextX + loopWidth : nextX);
  });

  function setPaused(value: boolean) {
    isPausedRef.current = value;
    setIsPaused(value);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative mt-12 overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f8fafc] to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f8fafc] to-transparent sm:w-32" />
      <motion.div className="flex w-max gap-4 will-change-transform" style={{ x }}>
        <div ref={loopRef} className="flex gap-4 pr-4">
          {clubs.map((club) => (
            <ClubBadge key={club.name} club={club} isPaused={isPaused} />
          ))}
        </div>
        <div className="flex gap-4 pr-4" aria-hidden="true">
          {clubs.map((club) => (
            <ClubBadge key={`${club.name}-copy`} club={club} isPaused={isPaused} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

type ClubBadgeProps = {
  club: ClubItem;
  isPaused: boolean;
};

function ClubBadge({ club, isPaused }: ClubBadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "relative flex w-[250px] shrink-0 items-center gap-4 overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br p-4 sm:w-[300px]",
        club.pattern,
        club.glow,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.72),transparent_42%,rgba(15,23,42,0.08))]" />
      <div className="absolute -right-10 top-1/2 size-28 -translate-y-1/2 rounded-full border border-slate-300/50" />
      <motion.div
        animate={isPaused || shouldReduceMotion ? { y: 0 } : { y: [0, -2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid size-16 shrink-0 place-items-center rounded-full border border-white/60 bg-white/80 p-2 backdrop-blur"
      >
        <Image src={club.logoUrl} alt={`${club.name} logo`} width={52} height={52} className="relative size-12 object-contain" />
      </motion.div>
      <div className="relative min-w-0">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{club.country}</p>
        <h3 className="mt-1 truncate text-xl font-black text-slate-950">{club.name}</h3>
      </div>
    </motion.article>
  );
}
