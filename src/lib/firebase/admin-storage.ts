import "server-only";

import { getFirebaseAdminStorage } from "@/lib/firebase/admin";

function requireAdminStorage() {
  const storage = getFirebaseAdminStorage();

  if (!storage) {
    throw new Error("Firebase Admin Storage is not configured.");
  }

  return storage;
}

export function adminBucket(bucketName?: string) {
  return requireAdminStorage().bucket(bucketName);
}

export function getAdminFile(path: string, bucketName?: string) {
  return adminBucket(bucketName).file(path);
}

export async function getAdminSignedUrl(path: string, expiresInMs = 15 * 60 * 1000) {
  const [url] = await getAdminFile(path).getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  });

  return url;
}
