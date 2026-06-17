"use client";

import { AlertCircle, Check, Loader2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { CatalogProduct } from "@/config/products";
import { useAuthPrompt } from "@/contexts/auth-prompt-context";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import type { ProductSize } from "@/types/ecommerce";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  product: CatalogProduct;
  size?: ProductSize;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
};

export function AddToCartButton({
  product,
  size,
  quantity = 1,
  className,
  children,
}: AddToCartButtonProps) {
  const { isAuthenticated } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const selectedSize = size ?? product.sizes[0];

  async function handleAddToCart() {
    if (!isAuthenticated) {
      openAuthPrompt("To add items to your cart and place an order, please login or sign up first.");
      return;
    }

    if (!selectedSize || state === "loading") {
      return;
    }

    try {
      setState("loading");
      await addItem({ product, size: selectedSize, quantity });
      setState("added");
    } catch {
      setState("error");
    } finally {
      window.setTimeout(() => setState("idle"), 1600);
    }
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 bg-lime-300 px-6 text-sm font-extrabold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      onClick={handleAddToCart}
      disabled={state === "loading"}
      type="button"
    >
      {state === "loading" ? <Loader2 className="animate-spin" size={18} /> : null}
      {state === "added" ? <Check size={18} /> : null}
      {state === "error" ? <AlertCircle size={18} /> : null}
      {state === "idle" ? <ShoppingBag size={18} /> : null}
      {state === "added" ? "Added" : state === "error" ? "Cart sync failed" : children ?? "Add to cart"}
    </motion.button>
  );
}
