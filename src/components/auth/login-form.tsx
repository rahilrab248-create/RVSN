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
        <h2 className="text-2xl font-black text-slate-950">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-600">Use email or Google to continue.</p>
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
          className="h-12 border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-950"
        />
        <PasswordField name="password" placeholder="Password" autoComplete="current-password" />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-slate-950 hover:text-slate-600">
            Forgot password?
          </Link>
        </div>
        <AuthSubmitButton isLoading={isLoading}>Login</AuthSubmitButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="inline-flex h-12 w-full items-center justify-center gap-2 border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-950 transition hover:border-slate-950"
      >
        <Chrome size={18} />
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-slate-950 hover:text-slate-600">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

function getAuthErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to login. Please try again.";
}
