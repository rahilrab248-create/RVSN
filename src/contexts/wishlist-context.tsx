"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthPrompt } from "@/contexts/auth-prompt-context";
import { hasFirebaseClientConfig } from "@/lib/firebase/config";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/firebase/wishlist";
import { useAuth } from "@/hooks/use-auth";

const localWishlistKey = "fooltball-wishlist";

type WishlistContextValue = {
  productIds: Set<string>;
  isLoading: boolean;
  isSaved: (productId: string) => boolean;
  toggleWishlist: (productId: string, productTitle: string) => Promise<void>;
};

export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const [productIds, setProductIds] = useState<Set<string>>(() => new Set(readLocalWishlist()));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadWishlist() {
      if (!user || !hasFirebaseClientConfig()) {
        setProductIds(new Set(readLocalWishlist()));
        return;
      }

      setIsLoading(true);

      try {
        const items = await getWishlist(user.uid);
        const nextIds = items.map((item) => item.productId);

        if (isMounted) {
          setProductIds(new Set(nextIds));
          writeLocalWishlist(nextIds);
        }
      } catch {
        if (isMounted) {
          setProductIds(new Set(readLocalWishlist()));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isSaved = useCallback((productId: string) => productIds.has(productId), [productIds]);

  const toggleWishlist = useCallback(
    async (productId: string, productTitle: string) => {
      if (!isAuthenticated || !user) {
        openAuthPrompt(`To save ${productTitle} to your wishlist, please login or sign up first.`);
        return;
      }

      const wasSaved = productIds.has(productId);
      const nextIds = new Set(productIds);

      if (wasSaved) {
        nextIds.delete(productId);
      } else {
        nextIds.add(productId);
      }

      setProductIds(nextIds);
      writeLocalWishlist(Array.from(nextIds));

      if (!hasFirebaseClientConfig()) {
        return;
      }

      try {
        if (wasSaved) {
          await removeFromWishlist(user.uid, productId);
        } else {
          await addToWishlist({ userId: user.uid, productId });
        }
      } catch {
        setProductIds(productIds);
        writeLocalWishlist(Array.from(productIds));
      }
    },
    [isAuthenticated, openAuthPrompt, productIds, user],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      productIds,
      isLoading,
      isSaved,
      toggleWishlist,
    }),
    [isLoading, isSaved, productIds, toggleWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

function readLocalWishlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(localWishlistKey) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalWishlist(productIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localWishlistKey, JSON.stringify(productIds));
}
