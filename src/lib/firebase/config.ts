export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  storageBucket?: string;
};

export const firebaseClientConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseAdminConfig: FirebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
  privateKey: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

export function hasFirebaseClientConfig(config = firebaseClientConfig) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function hasFirebaseAdminConfig(config = firebaseAdminConfig) {
  return Boolean(config.projectId && config.clientEmail && config.privateKey);
}

function formatPrivateKey(privateKey?: string) {
  return privateKey?.replace(/\\n/g, "\n") ?? "";
}
