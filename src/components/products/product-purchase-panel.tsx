"use client";

import { Minus, Plus } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(product.stock || 1, current + 1));
  }

  return (
    <>
      <div className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/58">Select size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-11 min-w-12 rounded-full border px-4 text-sm font-bold transition ${
                  selectedSize === size
                    ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.12)]"
                    : "border-white/14 bg-white/[0.06] text-white hover:border-white/60 hover:bg-white/[0.12]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/58">Quantity</p>
            <div className="mt-3 inline-flex items-center overflow-hidden rounded-full border border-white/12 bg-black/24">
              <button
                type="button"
                onClick={decreaseQuantity}
                className="grid size-11 place-items-center text-white/76 transition hover:bg-white/10 hover:text-white"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="grid h-11 min-w-12 place-items-center border-x border-white/10 text-sm font-bold text-white">{quantity}</span>
              <button
                type="button"
                onClick={increaseQuantity}
                className="grid size-11 place-items-center text-white/76 transition hover:bg-white/10 hover:text-white"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <p className="text-sm leading-6 text-white/50 sm:max-w-[230px] sm:text-right">
            Pick your matchday size and lock the piece before it leaves the wall.
          </p>
        </div>
      </div>

      <div className="sticky bottom-3 z-30 mt-6 rounded-[999px] border border-white/12 bg-[#07040d]/82 p-2 shadow-[0_22px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:static sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <div className="flex gap-2">
          <AddToCartButton product={product} size={selectedSize} quantity={quantity} className="h-12 flex-1 px-4" />
          <WishlistButton productId={product.id} productTitle={product.title} className="h-12 px-4 sm:px-6" />
        </div>
      </div>
    </>
  );
}
