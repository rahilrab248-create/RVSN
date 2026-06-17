"use client";

import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { reviewPath } from "@/lib/firebase/collections";
import { reviewsCollectionRef } from "@/lib/firebase/shared-refs";
import type { Review, ReviewInput } from "@/types/ecommerce";

export async function getProductReviews(productId: string): Promise<Review[]> {
  const snapshot = await getDocs(
    query(reviewsCollectionRef(), where("productId", "==", productId), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => item.data());
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const snapshot = await getDocs(
    query(reviewsCollectionRef(), where("userId", "==", userId), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => item.data());
}

export function createReview(data: ReviewInput) {
  return addDoc(reviewsCollectionRef(), {
    ...data,
    rating: Math.min(Math.max(data.rating, 1), 5),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function deleteReview(reviewId: string) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return deleteDoc(doc(db, reviewPath(reviewId)));
}
