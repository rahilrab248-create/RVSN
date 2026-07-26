import type { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "admin";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
  lastSeenAt?: Timestamp;
  loginCount?: number;
  provider?: string;
};
