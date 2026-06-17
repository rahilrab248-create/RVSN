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
        <h2 className="text-2xl font-black text-slate-950">Create account</h2>
        <p className="mt-2 text-sm text-slate-600">Your locker keeps your matchday details ready for kickoff.</p>
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
          className="h-12 border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-950"
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
          className="h-12 border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-950"
        />
        <PasswordField name="password" placeholder="Password" autoComplete="new-password" />
        <PasswordField name="confirmPassword" placeholder="Confirm password" autoComplete="new-password" />
        <AuthSubmitButton isLoading={isLoading}>Create account</AuthSubmitButton>
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
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-slate-950 hover:text-slate-600">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}

function getAuthErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to create account. Please try again.";
}
