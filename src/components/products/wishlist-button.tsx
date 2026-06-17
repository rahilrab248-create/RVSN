"use client";

import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthPrompt } from "@/contexts/auth-prompt-context";
import { addToWishlist, isInWishlist, removeFromWishlist } from "@/lib/firebase/wishlist";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  productTitle: string;
  variant?: "icon" | "wide";
  className?: string;
};

export function WishlistButton({ productId, productTitle, variant = "wide", className }: WishlistButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkWishlist() {
      if (!user) {
        setIsSaved(false);
        return;
      }

      try {
        const saved = await isInWishlist(user.uid, productId);
        if (isMounted) {
          setIsSaved(saved);
        }
      } catch {
        if (isMounted) {
          setIsSaved(readLocalWishlist().includes(productId));
        }
      }
    }

    void checkWishlist();

    return () => {
      isMounted = false;
    };
  }, [productId, user]);

  async function toggleWishlist() {
    if (!isAuthenticated || !user) {
      openAuthPrompt("To save products to your wishlist, please login or sign up first.");
      return;
    }

    setIsLoading(true);
    setIsSaved((value) => !value);

    try {
      if (isSaved) {
        await removeFromWishlist(user.uid, productId);
        writeLocalWishlist(readLocalWishlist().filter((id) => id !== productId));
      } else {
        await addToWishlist({ userId: user.uid, productId });
        writeLocalWishlist([...new Set([...readLocalWishlist(), productId])]);
      }
    } catch {
      const nextWishlist = isSaved
        ? readLocalWishlist().filter((id) => id !== productId)
        : [...new Set([...readLocalWishlist(), productId])];
      writeLocalWishlist(nextWishlist);
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        className={cn(
          "grid size-10 place-items-center border border-white/80 bg-white/90 text-slate-950 shadow-sm backdrop-blur transition hover:border-slate-950",
          isSaved && "bg-lime-300 text-slate-950",
          className,
        )}
        aria-label={`${isSaved ? "Remove" : "Save"} ${productTitle}`}
        aria-pressed={isSaved}
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void toggleWishlist();
        }}
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={18} fill={isSaved ? "currentColor" : "none"} />}
      </button>
    );
  }

  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:border-slate-950",
        isSaved && "border-lime-400 bg-lime-100",
        className,
      )}
      aria-pressed={isSaved}
      type="button"
      onClick={() => void toggleWishlist()}
    >
      {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Heart size={18} fill={isSaved ? "currentColor" : "none"} />}
      {isSaved ? "Saved" : "Wishlist"}
    </button>
  );
}

function readLocalWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem("fooltball-wishlist") ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalWishlist(productIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("fooltball-wishlist", JSON.stringify(productIds));
}
