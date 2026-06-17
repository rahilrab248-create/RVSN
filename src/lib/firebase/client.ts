"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  CACHE_SIZE_UNLIMITED,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseClientConfig, hasFirebaseClientConfig } from "@/lib/firebase/config";

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseClientConfig()) {
    return null;
  }

  return getApps().length ? getApps()[0] : initializeApp(firebaseClientConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    });
  } catch {
    return getFirestore(app);
  }
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

export function getFirebaseFunctions(): Functions | null {
  const app = getFirebaseApp();
  return app ? getFunctions(app, process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1") : null;
}
