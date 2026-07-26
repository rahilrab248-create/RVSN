"use client";

import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/config/products";
import { ProductVisual } from "@/components/products/product-visual";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  product: CatalogProduct;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryImages = product.images.length ? product.images : [product.imageUrl];
  const activeImage = galleryImages[activeIndex] ?? product.imageUrl;
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  function showPreviousImage() {
    setActiveIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  }

  function showNextImage() {
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  }

  return (
    <div className="grid gap-4 lg:sticky lg:top-28 lg:self-start">
      <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.055] p-2 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-3">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(196,181,253,0.18),transparent_18rem)]" />
        <motion.div
          key={`${product.id}-${activeIndex}`}
          initial={{ opacity: 0, scale: 1.015, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="group relative overflow-hidden rounded-[22px]"
        >
          <ProductVisual
            title={product.title}
            label={product.badge}
            colorway={product.colorway}
            imageUrl={activeImage}
            className="aspect-[4/5] sm:aspect-square"
            glitchDirection={getGlitchDirection(activeIndex)}
          />
        </motion.div>

        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/14 bg-black/34 px-3 py-2 text-xs font-semibold text-white/78 backdrop-blur-xl">
          <Maximize2 size={14} />
          {String(activeIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
        </div>

        {hasMultipleImages ? (
          <div className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 justify-between">
            <button
              type="button"
              onClick={showPreviousImage}
              className="grid size-10 place-items-center rounded-full border border-white/14 bg-black/34 text-white/78 shadow-xl backdrop-blur-xl transition hover:bg-white hover:text-black"
              aria-label="Show previous product image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="grid size-10 place-items-center rounded-full border border-white/14 bg-black/34 text-white/78 shadow-xl backdrop-blur-xl transition hover:bg-white hover:text-black"
              aria-label="Show next product image"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {galleryImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${product.title} image ${index + 1}`}
            className={cn(
              "relative h-24 w-24 shrink-0 overflow-hidden rounded-[16px] border bg-white/[0.035] p-1 transition sm:h-28 sm:w-28",
              activeIndex === index ? "border-violet-100 bg-white/12 shadow-[0_0_34px_rgba(196,181,253,0.16)]" : "border-white/10 hover:border-white/45",
            )}
          >
            <ProductVisual title={product.title} colorway={product.colorway} imageUrl={image} className="h-full rounded-[12px]" glitchDirection={getGlitchDirection(index)} />
            <span className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur">
              {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getGlitchDirection(index: number) {
  return ["left", "right", "up", "down", "diag"][index % 5] as "left" | "right" | "up" | "down" | "diag";
}
