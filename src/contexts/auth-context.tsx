"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Unsubscribe, User } from "firebase/auth";
import {
  createAccountWithEmail,
  enablePersistentSession,
  resetPassword,
  sendVerificationEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
} from "@/lib/firebase/auth";
import { hasFirebaseClientConfig } from "@/lib/firebase/config";
import { ensureUserProfile, recordUserLogin } from "@/lib/firebase/users";
import type { UserProfile } from "@/types/user";
import type { Timestamp } from "firebase/firestore";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  profileSyncError: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: { name: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileSyncError, setProfileSyncError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProfileSyncError("");
      return;
    }

    const nextProfile = await resolveUserProfile(user);
    setProfile(nextProfile.profile);
    setProfileSyncError(nextProfile.error);
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: Unsubscribe | undefined;

    if (!hasFirebaseClientConfig()) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    Promise.resolve()
      .then(enablePersistentSession)
      .catch(() => undefined)
      .finally(() => {
        unsubscribe = subscribeToAuthState(async (currentUser) => {
          if (!isMounted) {
            return;
          }

          setUser(currentUser);

          if (!currentUser) {
            setProfile(null);
            setProfileSyncError("");
            setIsLoading(false);
            return;
          }

          const nextProfile = await resolveUserProfile(currentUser);
          setProfile(nextProfile.profile);
          setProfileSyncError(nextProfile.error);
          setIsLoading(false);
        });
      });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const credential = await signInWithEmail(email, password);
      const nextProfile = await resolveUserProfile(credential.user);
      await recordUserLogin(credential.user).catch(() => undefined);
      setProfile(nextProfile.profile);
      setProfileSyncError(nextProfile.error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (params: { name: string; email: string; password: string }) => {
    setIsLoading(true);

    try {
      const credential = await createAccountWithEmail({
        email: params.email,
        password: params.password,
        displayName: params.name,
      });
      await sendVerificationEmail(credential.user);
      const nextProfile = await resolveUserProfile(credential.user, params.name);
      await recordUserLogin(credential.user).catch(() => undefined);
      setProfile(nextProfile.profile);
      setProfileSyncError(nextProfile.error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);

    try {
      const credential = await signInWithGoogle();
      const nextProfile = await resolveUserProfile(credential.user);
      await recordUserLogin(credential.user).catch(() => undefined);
      setProfile(nextProfile.profile);
      setProfileSyncError(nextProfile.error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
    setProfileSyncError("");
    router.push("/login");
  }, [router]);

  const forgotPassword = useCallback((email: string) => resetPassword(email), []);

  const handleSendEmailVerification = useCallback(async () => {
    if (!user) {
      throw new Error("You need to be logged in to verify your email.");
    }

    await sendVerificationEmail(user);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      profileSyncError,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      loginWithGoogle,
      logout,
      forgotPassword,
      sendEmailVerification: handleSendEmailVerification,
      refreshProfile,
    }),
    [
      user,
      profile,
      profileSyncError,
      isLoading,
      login,
      signup,
      loginWithGoogle,
      logout,
      forgotPassword,
      handleSendEmailVerification,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function resolveUserProfile(user: User, name?: string): Promise<{ profile: UserProfile; error: string }> {
  try {
    return {
      profile: await ensureUserProfile(user, name),
      error: "",
    };
  } catch (error) {
    return {
      profile: createFallbackProfile(user, name),
      error: error instanceof Error ? error.message : "Your matchday locker could not sync yet.",
    };
  }
}

function createFallbackProfile(user: User, name?: string): UserProfile {
  return {
    uid: user.uid,
    name: name ?? user.displayName ?? "Football Member",
    email: user.email ?? "",
    role: "user",
    createdAt: new Date() as unknown as Timestamp,
  };
}
