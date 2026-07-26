"use client";

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "The email or password is incorrect. Please check your details and try again.",
  "auth/wrong-password": "The password is incorrect. Please try again or reset your password.",
  "auth/user-not-found": "No account exists with this email. Create an account first or check the email address.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "This email is already registered. Login instead or use a different email.",
  "auth/weak-password": "Please use a stronger password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment, then try again.",
  "auth/network-request-failed": "Network connection failed. Check your internet and try again.",
  "auth/popup-closed-by-user": "Google login was closed before it finished.",
  "auth/cancelled-popup-request": "Another Google login window is already open. Finish that one first.",
  "auth/popup-blocked": "Your browser blocked the Google login popup. Allow popups and try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/missing-email": "Please enter your email address.",
  "auth/requires-recent-login": "For security, please login again and retry this action.",
};

export function getAuthErrorMessage(error: unknown, fallback = "Authentication failed. Please try again.") {
  const firebaseError = error as FirebaseLikeError;
  const code = firebaseError?.code;

  if (code && authErrorMessages[code]) {
    return authErrorMessages[code];
  }

  const message = firebaseError?.message ?? "";

  if (message.includes("auth/invalid-credential")) {
    return authErrorMessages["auth/invalid-credential"];
  }

  if (message.includes("auth/wrong-password")) {
    return authErrorMessages["auth/wrong-password"];
  }

  if (message.includes("auth/user-not-found")) {
    return authErrorMessages["auth/user-not-found"];
  }

  if (message.toLowerCase().includes("permission")) {
    return "Your account is signed in, but Firebase permissions blocked this action. Please contact the store admin.";
  }

  return fallback;
}
