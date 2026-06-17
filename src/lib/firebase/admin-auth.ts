import "server-only";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

function requireAdminAuth() {
  const auth = getFirebaseAdminAuth();

  if (!auth) {
    throw new Error("Firebase Admin Authentication is not configured.");
  }

  return auth;
}

export function verifySessionToken(token: string, checkRevoked = true) {
  return requireAdminAuth().verifyIdToken(token, checkRevoked);
}

export function getAdminUser(uid: string) {
  return requireAdminAuth().getUser(uid);
}

export function setAdminUserClaims(uid: string, claims: Record<string, unknown>) {
  return requireAdminAuth().setCustomUserClaims(uid, claims);
}
