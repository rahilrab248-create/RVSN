"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ProductVisualProps = {
  title: string;
  label?: string;
  colorway: string;
  imageUrl?: string;
  className?: string;
  glitchDirection?: "left" | "right" | "up" | "down" | "diag";
};

export function ProductVisual({ title, label, colorway, imageUrl, className, glitchDirection = "left" }: ProductVisualProps) {
  return (
    <div
      className={cn(
        "product-visual relative overflow-hidden bg-[#f5f5f7]",
        `glitch-${glitchDirection}`,
        className,
      )}
      style={{ position: "relative", "--product-glitch-image": imageUrl ? `url(${imageUrl})` : undefined } as CSSProperties}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          unoptimized={imageUrl.startsWith("data:")}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="product-visual-image object-cover transition duration-700 ease-out group-hover:scale-[1.018]"
        />
      ) : (
        <>
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", colorway)} />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_34%,rgba(0,0,0,0.42)_72%)]" />
          <div className="absolute inset-x-8 bottom-8 top-8 border border-white/25" />
          <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-white/20" />
        </>
      )}
      {label ? (
        <div className="absolute bottom-5 left-5 right-5">
          <p className="inline-flex bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-950">
            {label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
