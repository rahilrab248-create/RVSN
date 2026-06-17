"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useAuth } from "@/hooks/use-auth";

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
      setError(authError instanceof Error ? authError.message : "Unable to send reset email.");
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
        <h2 className="text-2xl font-black text-slate-950">Forgot password</h2>
        <p className="mt-2 text-sm text-slate-600">Enter your email to receive a reset link.</p>
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
          className="h-12 border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-950"
        />
        <AuthSubmitButton isLoading={isSubmitting}>Send reset link</AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-slate-950 hover:text-slate-600">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
