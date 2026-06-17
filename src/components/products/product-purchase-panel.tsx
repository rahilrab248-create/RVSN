"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistButton } from "@/components/products/wishlist-button";
import type { CatalogProduct } from "@/config/products";
import type { ProductSize } from "@/types/ecommerce";

type ProductPurchasePanelProps = {
  product: CatalogProduct;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);

  return (
    <>
      <div className="mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Select size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`h-11 min-w-12 border px-4 text-sm font-bold transition ${
                selectedSize === size
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-950 hover:border-slate-950"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <AddToCartButton product={product} size={selectedSize} />
        <WishlistButton productId={product.id} productTitle={product.title} />
      </div>
    </>
  );
}
