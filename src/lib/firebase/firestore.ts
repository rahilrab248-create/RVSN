"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryConstraint,
  type WithFieldValue,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

function requireDb() {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return db;
}

export function collectionRef<T extends DocumentData>(
  path: string,
  converter?: FirestoreDataConverter<T>,
) {
  const ref = collection(requireDb(), path);
  return converter ? ref.withConverter(converter) : ref;
}

export function docRef<T extends DocumentData>(path: string, converter?: FirestoreDataConverter<T>) {
  const ref = doc(requireDb(), path);
  return converter ? ref.withConverter(converter) : ref;
}

export async function getDocument<T extends DocumentData>(
  path: string,
  converter?: FirestoreDataConverter<T>,
) {
  const snapshot = await getDoc(docRef<T>(path, converter));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function getCollection<T extends DocumentData>(
  path: string,
  constraints: QueryConstraint[] = [],
  converter?: FirestoreDataConverter<T>,
) {
  const ref = collectionRef<T>(path, converter);
  const snapshot = await getDocs(query(ref, ...constraints));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function addDocument<T extends DocumentData>(path: string, data: WithFieldValue<T>) {
  return addDoc(collectionRef<T>(path), withTimestamps(data));
}

export function setDocument<T extends DocumentData>(path: string, data: WithFieldValue<T>) {
  return setDoc(docRef<T>(path), withTimestamps(data), { merge: true });
}

export function updateDocument<T extends DocumentData>(path: string, data: Partial<T>) {
  return updateDoc(docRef<T>(path), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function deleteDocument(path: string) {
  return deleteDoc(docRef(path));
}

function withTimestamps<T extends DocumentData>(data: WithFieldValue<T>) {
  return {
    ...data,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
}
