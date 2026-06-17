"use client";

import { doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, type Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { usersCollectionRef } from "@/lib/firebase/shared-refs";
import type { UserProfile } from "@/types/user";

function requireDb() {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  return db;
}

export function userDocRef(uid: string) {
  return doc(requireDb(), collections.users, uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userDocRef(uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function getUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(query(usersCollectionRef(), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => item.data());
}

export async function createUserProfile(user: User, name?: string): Promise<UserProfile> {
  const profile: Omit<UserProfile, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: user.uid,
    name: name ?? user.displayName ?? "Football Member",
    email: user.email ?? "",
    role: "user",
    createdAt: serverTimestamp(),
  };

  await setDoc(userDocRef(user.uid), profile, { merge: true });

  return {
    ...profile,
    createdAt: serverTimestamp() as unknown as Timestamp,
  };
}

export async function ensureUserProfile(user: User, name?: string): Promise<UserProfile> {
  const existingProfile = await getUserProfile(user.uid);

  if (existingProfile) {
    return existingProfile;
  }

  return createUserProfile(user, name);
}

export function updateUserProfile(uid: string, data: Partial<Pick<UserProfile, "name" | "email" | "role">>) {
  return updateDoc(userDocRef(uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
