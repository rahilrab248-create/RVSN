"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import type { MouseEvent } from "react";
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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 180, damping: 18 });

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (shouldReduceMotion || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const productHref = product.detailHref ?? `/products/${product.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.045 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group glass-panel flex h-full flex-col rounded-lg"
    >
      <Link href={productHref} className="flex flex-1 flex-col overflow-hidden rounded-lg">
        <div className="relative overflow-hidden border-b border-slate-200">
          <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <ProductVisual
              title={product.title}
              label={product.badge}
              colorway={product.colorway}
              imageUrl={product.imageUrl}
              className="aspect-[4/5]"
            />
          </motion.div>
          <WishlistButton
            productId={product.id}
            productTitle={product.title}
            variant="icon"
            className="absolute right-4 top-4"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="line-clamp-1 min-h-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{product.brand}</p>
              <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] text-xl font-black leading-7 text-slate-950">
                {product.title}
              </h3>
            </div>
            <ArrowUpRight className="mt-1 shrink-0 text-slate-950 opacity-0 transition group-hover:opacity-100" size={20} />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <RatingStars rating={product.rating} />
            <Price value={product.price} className="text-lg font-black text-slate-950" />
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <AddToCartButton
          product={product}
          className="h-10 w-full"
        >
          Quick add
        </AddToCartButton>
      </div>
    </motion.article>
  );
}
