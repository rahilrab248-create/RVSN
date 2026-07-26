"use client";

import { Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";

export function SignupForm() {
  const router = useRouter();
  const { signup, loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password,
      });
      router.push("/");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  }

  async function handleGoogleLogin() {
    setError("");

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  }

  return (
    <AuthShell
      eyebrow="Signup"
      title="Create your matchday identity."
      description="Join the squad, save your cart, and get first touch on the newest football drops."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-normal tracking-[-0.04em] text-white">Create account</h2>
        <p className="mt-2 text-sm text-violet-100/58">Your locker keeps your matchday details ready for kickoff.</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <AuthFormMessage type="error" message={error} /> : null}
        <label className="sr-only" htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          required
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          className="h-12 rounded-[18px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/45 focus:border-violet-200 focus:ring-4 focus:ring-violet-300/10"
        />
        <label className="sr-only" htmlFor="signup-email">
          Email address
        </label>
        <input
          id="signup-email"
          required
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          className="h-12 rounded-[18px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/45 focus:border-violet-200 focus:ring-4 focus:ring-violet-300/10"
        />
        <PasswordField name="password" placeholder="Password" autoComplete="new-password" />
        <PasswordField name="confirmPassword" placeholder="Confirm password" autoComplete="new-password" />
        <AuthSubmitButton isLoading={isLoading}>Create account</AuthSubmitButton>
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
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-white transition hover:text-violet-200">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
