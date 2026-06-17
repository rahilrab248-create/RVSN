"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { CatalogProduct } from "@/config/products";
import { ProductVisual } from "@/components/products/product-visual";

type ProductGalleryProps = {
  product: CatalogProduct;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryImages = product.images.length ? product.images : [product.imageUrl];
  const activeImage = galleryImages[activeIndex] ?? product.imageUrl;

  return (
    <div className="grid gap-3">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-panel overflow-hidden rounded-lg p-4"
      >
        <ProductVisual
          title={product.title}
          label={product.badge}
          colorway={product.colorway}
          imageUrl={activeImage}
          className="aspect-square rounded-sm"
        />
      </motion.div>
      <div className="grid grid-cols-3 gap-3">
        {galleryImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${product.title} image ${index + 1}`}
            className={`overflow-hidden rounded-sm border p-1 transition ${
              activeIndex === index ? "border-slate-950 dark:border-lime-300" : "border-slate-200 hover:border-slate-400 dark:border-white/10 dark:hover:border-slate-300"
            }`}
          >
            <ProductVisual title={product.title} colorway={product.colorway} imageUrl={image} className="aspect-square" />
          </button>
        ))}
      </div>
    </div>
  );
}
