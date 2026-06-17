"use client";

import {
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { cartPath, userProductDocumentId } from "@/lib/firebase/collections";
import { cartCollectionRef } from "@/lib/firebase/shared-refs";
import type { CartInput, CartItem } from "@/types/ecommerce";

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const snapshot = await getDocs(
    query(cartCollectionRef(), where("userId", "==", userId), orderBy("createdAt", "asc")),
  );
  return snapshot.docs.map((item) => item.data());
}

export function addToCart(data: CartInput) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const itemId = userProductDocumentId(data.userId, data.productId, data.size);
  return setDoc(
    doc(db, cartPath(itemId)),
    {
      ...data,
      quantity: data.quantity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function incrementCartItem(userId: string, productId: string, size: string, quantity = 1) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return updateDoc(doc(db, cartPath(userProductDocumentId(userId, productId, size))), {
    quantity: increment(quantity),
    updatedAt: serverTimestamp(),
  });
}

export function updateCartItemQuantity(userId: string, productId: string, size: string, quantity: number) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return updateDoc(doc(db, cartPath(userProductDocumentId(userId, productId, size))), {
    quantity,
    updatedAt: serverTimestamp(),
  });
}

export function removeCartItem(userId: string, productId: string, size: string) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return deleteDoc(doc(db, cartPath(userProductDocumentId(userId, productId, size))));
}

export async function clearCart(userId: string) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const snapshot = await getDocs(query(cartCollectionRef(), where("userId", "==", userId)));
  const batch = writeBatch(db);

  snapshot.docs.forEach((item) => batch.delete(item.ref));

  return batch.commit();
}
