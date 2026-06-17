"use client";

import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { userProductDocumentId, wishlistPath } from "@/lib/firebase/collections";
import { wishlistConverter } from "@/lib/firebase/converters";
import { wishlistCollectionRef } from "@/lib/firebase/shared-refs";
import type { WishlistInput, WishlistItem } from "@/types/ecommerce";

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const snapshot = await getDocs(
    query(wishlistCollectionRef(), where("userId", "==", userId), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => item.data());
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const itemId = userProductDocumentId(userId, productId);
  const snapshot = await getDoc(doc(db, wishlistPath(itemId)).withConverter(wishlistConverter));
  return snapshot.exists();
}

export function addToWishlist(data: WishlistInput) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const itemId = userProductDocumentId(data.userId, data.productId);
  return setDoc(doc(db, wishlistPath(itemId)), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export function removeFromWishlist(userId: string, productId: string) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return deleteDoc(doc(db, wishlistPath(userProductDocumentId(userId, productId))));
}
