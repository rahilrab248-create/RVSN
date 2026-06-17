"use client";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
  type UploadMetadata,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

function requireStorage() {
  const storage = getFirebaseStorage();

  if (!storage) {
    throw new Error("Firebase Storage is not configured.");
  }

  return storage;
}

export function storageRef(path: string) {
  return ref(requireStorage(), path);
}

export async function uploadFile(path: string, file: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata) {
  const snapshot = await uploadBytes(storageRef(path), file, metadata);
  const url = await getDownloadURL(snapshot.ref);

  return {
    path: snapshot.ref.fullPath,
    url,
  };
}

export function uploadFileResumable(path: string, file: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata) {
  return uploadBytesResumable(storageRef(path), file, metadata);
}

export function getFileUrl(path: string) {
  return getDownloadURL(storageRef(path));
}

export function deleteFile(path: string) {
  return deleteObject(storageRef(path));
}
