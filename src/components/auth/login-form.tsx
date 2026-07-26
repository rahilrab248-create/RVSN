"use client";

import { Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/account";
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      router.push(nextPath);
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      await loginWithGoogle();
      router.push(nextPath);
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  }

  return (
    <AuthShell
      eyebrow="Login"
      title="Step back into the tunnel."
      description="Pick up your cart, track your kit, and get back to the football gear made for matchday pressure."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-normal tracking-[-0.04em] text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-violet-100/58">Use email or Google to continue.</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <AuthFormMessage type="error" message={error} /> : null}
        <label className="sr-only" htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          required
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          className="h-12 rounded-[18px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/45 focus:border-violet-200 focus:ring-4 focus:ring-violet-300/10"
        />
        <PasswordField name="password" placeholder="Password" autoComplete="current-password" />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-white/86 transition hover:text-violet-200">
            Forgot password?
          </Link>
        </div>
        <AuthSubmitButton isLoading={isLoading}>Login</AuthSubmitButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-violet-100/48">
        <span className="h-px flex-1 bg-white/14" />
        or
        <span className="h-px flex-1 bg-white/14" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 text-sm font-semibold text-white shadow-[inset_0_1px_rgba(255,255,255,0.1)] transition hover:border-violet-200 hover:bg-white/14"
      >
        <Chrome size={18} />
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-violet-100/58">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-white transition hover:text-violet-200">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
