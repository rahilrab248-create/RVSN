import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { firebaseAdminConfig, hasFirebaseAdminConfig } from "@/lib/firebase/config";

export function getFirebaseAdminApp(): App | null {
  if (!hasFirebaseAdminConfig()) {
    return null;
  }

  if (getApps().length) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: firebaseAdminConfig.privateKey,
    }),
    storageBucket: firebaseAdminConfig.storageBucket,
  });
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAdminDb(): Firestore | null {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseAdminStorage(): Storage | null {
  const app = getFirebaseAdminApp();
  return app ? getStorage(app) : null;
}
