"use client";

import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  productTitle: string;
  variant?: "icon" | "wide";
  className?: string;
};

export function WishlistButton({ productId, productTitle, variant = "wide", className }: WishlistButtonProps) {
  const { isSaved: checkSaved, toggleWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const isSaved = checkSaved(productId);

  async function handleToggleWishlist() {
    setIsLoading(true);
    try {
      await toggleWishlist(productId, productTitle);
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        className={cn(
          "grid size-10 place-items-center border border-white/70 bg-white/90 text-black shadow-sm backdrop-blur transition hover:border-white hover:bg-white",
          isSaved && "bg-violet-200 text-black",
          className,
        )}
        aria-label={`${isSaved ? "Remove" : "Save"} ${productTitle}`}
        aria-pressed={isSaved}
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleToggleWishlist();
        }}
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={18} fill={isSaved ? "currentColor" : "none"} />}
      </button>
    );
  }

  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-6 text-sm font-semibold text-black transition hover:border-white hover:bg-violet-100",
        isSaved && "border-violet-200 bg-violet-200",
        className,
      )}
      aria-pressed={isSaved}
      type="button"
      onClick={() => void handleToggleWishlist()}
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={18} fill={isSaved ? "currentColor" : "none"} />}
      {isSaved ? "Saved" : "Wishlist"}
    </button>
  );
}
