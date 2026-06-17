import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

function requireAdminDb() {
  const db = getFirebaseAdminDb();

  if (!db) {
    throw new Error("Firebase Admin Firestore is not configured.");
  }

  return db;
}

export function adminCollection(path: string) {
  return requireAdminDb().collection(path);
}

export function adminDoc(path: string) {
  return requireAdminDb().doc(path);
}

export async function getAdminDocument<T>(path: string) {
  const snapshot = await adminDoc(path).get();
  return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null;
}

export function setAdminDocument<T extends Record<string, unknown>>(path: string, data: T) {
  return adminDoc(path).set(withAdminTimestamps(data), { merge: true });
}

export function updateAdminDocument<T extends Record<string, unknown>>(path: string, data: Partial<T>) {
  return adminDoc(path).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export function deleteAdminDocument(path: string) {
  return adminDoc(path).delete();
}

function withAdminTimestamps<T extends Record<string, unknown>>(data: T) {
  return {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };
}
