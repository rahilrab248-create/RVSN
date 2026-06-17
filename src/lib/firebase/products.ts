"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { collections, productPath } from "@/lib/firebase/collections";
import { productConverter } from "@/lib/firebase/converters";
import type { Product, ProductInput } from "@/types/ecommerce";

function productsCollection() {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return collection(db, collections.products).withConverter(productConverter);
}

export async function getProducts(constraints: QueryConstraint[] = []): Promise<Product[]> {
  const snapshot = await getDocs(query(productsCollection(), ...constraints));
  return snapshot.docs.map((item) => item.data());
}

export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  return getProducts([where("featured", "==", true), orderBy("createdAt", "desc"), limit(count)]);
}

export async function getProductsByCategory(category: string, count = 24): Promise<Product[]> {
  return getProducts([where("category", "==", category), orderBy("createdAt", "desc"), limit(count)]);
}

export async function getProduct(productId: string): Promise<Product | null> {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const snapshot = await getDoc(doc(db, productPath(productId)).withConverter(productConverter));
  return snapshot.exists() ? snapshot.data() : null;
}

export function createProduct(data: ProductInput) {
  return addDoc(productsCollection(), {
    ...data,
    rating: data.rating ?? 0,
    featured: data.featured ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function upsertProduct(productId: string, data: ProductInput) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return setDoc(
    doc(db, productPath(productId)),
    {
      ...data,
      rating: data.rating ?? 0,
      featured: data.featured ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function updateProduct(productId: string, data: Partial<ProductInput>) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return updateDoc(doc(db, productPath(productId)), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function deleteProduct(productId: string) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return deleteDoc(doc(db, productPath(productId)));
}
