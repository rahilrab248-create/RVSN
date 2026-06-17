"use client";

import { collection } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import {
  cartConverter,
  categoryConverter,
  orderConverter,
  reviewConverter,
  userConverter,
  wishlistConverter,
} from "@/lib/firebase/converters";

function requireDb() {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return db;
}

export function categoriesCollectionRef() {
  return collection(requireDb(), collections.categories).withConverter(categoryConverter);
}

export function usersCollectionRef() {
  return collection(requireDb(), collections.users).withConverter(userConverter);
}

export function ordersCollectionRef() {
  return collection(requireDb(), collections.orders).withConverter(orderConverter);
}

export function reviewsCollectionRef() {
  return collection(requireDb(), collections.reviews).withConverter(reviewConverter);
}

export function wishlistCollectionRef() {
  return collection(requireDb(), collections.wishlist).withConverter(wishlistConverter);
}

export function cartCollectionRef() {
  return collection(requireDb(), collections.cart).withConverter(cartConverter);
}
