"use client";

import {
  type ActionCodeSettings,
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  updateProfile,
  type NextOrObserver,
  type User,
  type UserCredential,
} from "firebase/auth";
import { siteConfig } from "@/config/site";
import { getFirebaseAuth } from "@/lib/firebase/client";

function requireAuth() {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase Authentication is not configured.");
  }

  return auth;
}

export function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(requireAuth(), email, password);
}

export async function createAccountWithEmail(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(requireAuth(), params.email, params.password);

  if (params.displayName) {
    await updateProfile(credential.user, { displayName: params.displayName });
  }

  return credential;
}

export function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(requireAuth(), email);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(requireAuth(), provider);
}

export function sendVerificationEmail(user: User): Promise<void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: `${siteConfig.url}/account`,
    handleCodeInApp: false,
  };

  return sendEmailVerification(user, actionCodeSettings);
}

export function enablePersistentSession(): Promise<void> {
  return setPersistence(requireAuth(), browserLocalPersistence);
}

export function signOutUser(): Promise<void> {
  return signOut(requireAuth());
}

export function subscribeToAuthState(observer: NextOrObserver<User>) {
  return onAuthStateChanged(requireAuth(), observer);
}
