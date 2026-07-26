"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionStyle } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Price } from "@/components/currency/price";
import type { CatalogProduct } from "@/config/products";
import { ProductVisual } from "@/components/products/product-visual";
import { RatingStars } from "@/components/products/rating-stars";
import { WishlistButton } from "@/components/products/wishlist-button";

type ProductCardProps = {
  product: CatalogProduct;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [glitchKey, setGlitchKey] = useState(0);
  const [isHoverGlitching, setIsHoverGlitching] = useState(false);
  const [hasScrollGlitched, setHasScrollGlitched] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 180, damping: 18 });

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (shouldReduceMotion || isTouchDevice) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHoverGlitching(false);
  }

  function handlePointerEnter() {
    if (shouldReduceMotion || isTouchDevice) {
      return;
    }

    setGlitchKey((current) => current + 1);
    setIsHoverGlitching(true);
  }

  const productHref = product.detailHref ?? `/products/${product.id}`;
  const glitchDirection = getGlitchDirection(index);
  const cardRevealDelay = shouldReduceMotion ? 0 : Math.min(index % 8, 7) * (isTouchDevice ? 0.035 : 0.055);
  const cardStyle = {
    ...(isTouchDevice || shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" as const }),
    "--card-glitch-image": `url(${product.imageUrl})`,
    "--card-glitch-delay": `${cardRevealDelay}s`,
  } as MotionStyle & CSSProperties;

  return (
    <motion.article
      initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1, filter: "none" } : { opacity: 0, y: isTouchDevice ? 22 : 34, scale: isTouchDevice ? 0.975 : 0.965, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: isTouchDevice ? "-6%" : "-12%" }}
      onViewportEnter={() => {
        if (!shouldReduceMotion) {
          setHasScrollGlitched(true);
        }
      }}
      transition={{ duration: isTouchDevice ? 0.66 : 0.78, ease: [0.16, 1, 0.3, 1], delay: cardRevealDelay }}
      onMouseMove={handleMouseMove}
      onPointerEnter={handlePointerEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`product-card product-card-reveal group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,#0b0a15_0%,#070711_100%)] shadow-2xl shadow-black/35 glitch-${glitchDirection} ${hasScrollGlitched && !shouldReduceMotion ? "is-card-scroll-glitching" : ""}`}
    >
      {!shouldReduceMotion ? <span className="product-card-glitch-layer" aria-hidden="true" /> : null}
      <Link href={productHref} className="product-card-link flex flex-1 flex-col overflow-hidden rounded-[28px]">
        <div className="product-card-media relative overflow-hidden border-b border-white/10">
          <motion.div whileHover={isTouchDevice ? undefined : { scale: 1.06 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <ProductVisual
              key={`${product.id}-${glitchKey}`}
              title={product.title}
              label={product.badge}
              colorway={product.colorway}
              imageUrl={product.imageUrl}
              className="product-card-visual aspect-[4/5]"
              glitchDirection={glitchDirection}
              isGlitching={isHoverGlitching}
            />
          </motion.div>
          <WishlistButton
            productId={product.id}
            productTitle={product.title}
            variant="icon"
            className="absolute right-4 top-4"
          />
        </div>
        <div className="product-card-body flex flex-1 flex-col bg-[#080812] p-5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="product-card-brand line-clamp-1 min-h-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/48">{product.brand}</p>
              <h3 className="product-card-title mt-2 line-clamp-2 min-h-[3.45rem] text-[1.35rem] font-normal leading-[1.05] tracking-[-0.045em] text-white">
                {product.title}
              </h3>
            </div>
            <ArrowUpRight className="mt-1 shrink-0 text-violet-100/70 opacity-0 transition group-hover:opacity-100" size={20} />
          </div>
          <div className="product-card-meta mt-auto flex items-center justify-between gap-3 pt-6">
            <RatingStars rating={product.rating} />
            <Price value={product.price} className="text-lg font-semibold tracking-[-0.03em] text-white" />
          </div>
        </div>
      </Link>
      <div className="product-card-action border-t border-white/10 bg-[#080812] px-5 pb-5 pt-4">
        <AddToCartButton
          product={product}
          className="h-11 w-full"
        >
          Quick add
        </AddToCartButton>
      </div>
    </motion.article>
  );
}

function getGlitchDirection(index: number) {
  return ["left", "right", "up", "down", "diag"][index % 5] as "left" | "right" | "up" | "down" | "diag";
}
