"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart as saveCartItem,
  clearCart as clearFirestoreCart,
  getCartItems,
  removeCartItem as removeFirestoreCartItem,
  updateCartItemQuantity,
} from "@/lib/firebase/cart";
import { hasFirebaseClientConfig } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import type { AddCartItemInput, CartLineItem } from "@/types/cart";
import type { ProductSize } from "@/types/ecommerce";

const guestCartKey = "fooltball-cart";

type CartContextValue = {
  items: CartLineItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddCartItemInput) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      setIsLoading(true);

      if (user && hasFirebaseClientConfig()) {
        try {
          const firestoreItems = await getCartItems(user.uid);
          if (isMounted) {
            setItems(
              firestoreItems.map((item) => ({
                id: item.id ?? createCartItemId(item.productId, item.size),
                productId: item.productId,
                title: item.title,
                image: item.image,
                brand: item.brand,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
              })),
            );
          }
        } catch {
          if (isMounted) {
            setItems(readGuestCart());
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
        return;
      }

      setItems(readGuestCart());
      setIsLoading(false);
    }

    void loadCart();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      writeGuestCart(items);
    }
  }, [items, user]);

  const persistItem = useCallback(
    async (item: CartLineItem) => {
      if (!user || !hasFirebaseClientConfig()) {
        return;
      }

      await saveCartItem({
        userId: user.uid,
        productId: item.productId,
        title: item.title,
        image: item.image,
        brand: item.brand,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      });
    },
    [user],
  );

  const addItem = useCallback(
    async ({ product, size, quantity = 1 }: AddCartItemInput) => {
      const itemId = createCartItemId(product.id, size);
      let nextItem: CartLineItem | undefined;
      let nextItems: CartLineItem[] = [];

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === itemId);

        if (existingItem) {
          nextItem = { ...existingItem, quantity: existingItem.quantity + quantity };
          nextItems = currentItems.map((item) => (item.id === itemId ? nextItem as CartLineItem : item));
          return nextItems;
        }

        nextItem = {
          id: itemId,
          productId: product.id,
          title: product.title,
          image: product.imageUrl,
          brand: product.brand,
          size,
          quantity,
          price: product.price,
        };

        nextItems = [...currentItems, nextItem];
        return nextItems;
      });

      setIsCartOpen(true);

      if (nextItem) {
        try {
          await persistItem(nextItem);
        } catch {
          writeGuestCart(nextItems);
          throw new Error("Cart item was added locally, but online cart sync failed.");
        }
      }
    },
    [persistItem],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const item = items.find((currentItem) => currentItem.id === itemId);
      setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== itemId));

      if (user && item && hasFirebaseClientConfig()) {
        try {
          await removeFirestoreCartItem(user.uid, item.productId, item.size);
        } catch {
          writeGuestCart(items.filter((currentItem) => currentItem.id !== itemId));
        }
      }
    },
    [items, user],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const safeQuantity = Math.max(1, quantity);
      const item = items.find((currentItem) => currentItem.id === itemId);

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === itemId ? { ...currentItem, quantity: safeQuantity } : currentItem,
        ),
      );

      if (user && item && hasFirebaseClientConfig()) {
        try {
          await updateCartItemQuantity(user.uid, item.productId, item.size, safeQuantity);
        } catch {
          writeGuestCart(
            items.map((currentItem) =>
              currentItem.id === itemId ? { ...currentItem, quantity: safeQuantity } : currentItem,
            ),
          );
        }
      }
    },
    [items, user],
  );

  const clearCart = useCallback(async () => {
    setItems([]);

    if (user && hasFirebaseClientConfig()) {
      try {
        await clearFirestoreCart(user.uid);
      } catch {
        writeGuestCart([]);
      }
    } else {
      writeGuestCart([]);
    }
  }, [user]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isCartOpen,
      isLoading,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, clearCart, isCartOpen, isLoading, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function createCartItemId(productId: string, size: ProductSize | string) {
  return `${productId}_${size}`;
}

function readGuestCart(): CartLineItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(guestCartKey);
    return value ? (JSON.parse(value) as CartLineItem[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartLineItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(guestCartKey, JSON.stringify(items));
}
