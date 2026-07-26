"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await forgotPassword(String(formData.get("email")));
      setMessage("Password reset instructions sent. Check your inbox.");
    } catch (authError) {
      setError(getAuthErrorMessage(authError, "Unable to send reset email. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Reset"
      title="Recover your place in the squad."
      description="Send a reset link to your locker email and get back into the matchday lineup."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-normal tracking-[-0.04em] text-white">Forgot password</h2>
        <p className="mt-2 text-sm text-violet-100/58">Enter your email to receive a reset link.</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <AuthFormMessage type="error" message={error} /> : null}
        {message ? <AuthFormMessage type="success" message={message} /> : null}
        <label className="sr-only" htmlFor="reset-email">
          Email address
        </label>
        <input
          id="reset-email"
          required
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          className="h-12 rounded-[18px] border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/45 focus:border-violet-200 focus:ring-4 focus:ring-violet-300/10"
        />
        <AuthSubmitButton isLoading={isSubmitting}>Send reset link</AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-violet-100/58">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-white transition hover:text-violet-200">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
