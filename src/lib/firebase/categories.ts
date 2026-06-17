"use client";

import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { categoriesCollectionRef } from "@/lib/firebase/shared-refs";
import { categoryPath } from "@/lib/firebase/collections";
import { categoryConverter } from "@/lib/firebase/converters";
import type { Category, CategoryInput } from "@/types/ecommerce";

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(query(categoriesCollectionRef(), orderBy("sortOrder", "asc")));
  return snapshot.docs.map((item) => item.data());
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const snapshot = await getDocs(
    query(categoriesCollectionRef(), where("featured", "==", true), orderBy("sortOrder", "asc")),
  );
  return snapshot.docs.map((item) => item.data());
}

export async function getCategory(categoryId: string): Promise<Category | null> {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const snapshot = await getDoc(doc(db, categoryPath(categoryId)).withConverter(categoryConverter));
  return snapshot.exists() ? snapshot.data() : null;
}

export function createCategory(data: CategoryInput) {
  return addDoc(categoriesCollectionRef(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateCategory(categoryId: string, data: Partial<CategoryInput>) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return updateDoc(doc(db, categoryPath(categoryId)), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function deleteCategory(categoryId: string) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return deleteDoc(doc(db, categoryPath(categoryId)));
}
