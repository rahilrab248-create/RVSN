"use client";

import { ArrowRight, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useAuth } from "@/hooks/use-auth";

export function VerifyEmailPanel() {
  const { user, sendEmailVerification, isLoading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  async function handleResend() {
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await sendEmailVerification();
      setMessage("Verification email sent. Check your inbox.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to send verification email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerificationCheck() {
    if (!user) {
      setError("Login first to check your verification status.");
      return;
    }

    setIsChecking(true);
    setMessage("");
    setError("");

    try {
      await user.reload();

      if (user.emailVerified) {
        setMessage("Email verified. Taking you back to your account.");
        router.push("/account");
        return;
      }

      setError("Your email is not verified yet. Open the verification email first, then tap this button again.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to check verification status.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Verify"
      title="Confirm your club credentials."
      description="Confirm your email so your matchday locker stays protected before the next drop lands."
    >
      <div className="relative overflow-hidden rounded-lg border border-lime-300/35 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(190,242,100,0.35),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_46%)]" />
        <div className="relative">
          <span className="grid size-16 place-items-center rounded-full border border-lime-300/60 bg-lime-300 text-slate-950">
            <MailCheck size={30} />
          </span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-lime-300">One final touch</p>
          <h2 className="mt-3 text-3xl font-black leading-tight">Verify your email to unlock your locker.</h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-200">
            {user?.email
              ? `We sent a secure verification link to ${user.email}. Open it from your inbox to finish setup.`
              : "Login first to send a verification email."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {error ? <AuthFormMessage type="error" message={error} /> : null}
        {message ? <AuthFormMessage type="success" message={message} /> : null}
        <AuthSubmitButton isLoading={isSubmitting || isLoading} disabled={!user} onClick={handleResend}>
          <RefreshCw size={17} />
          Send verification link
        </AuthSubmitButton>
        <button
          type="button"
          disabled={!user || isChecking}
          onClick={handleVerificationCheck}
          className="inline-flex h-12 items-center justify-center gap-2 bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-lime-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-lime-300 dark:text-slate-950 dark:hover:bg-white"
        >
          {isChecking ? <RefreshCw className="animate-spin" size={17} /> : <MailCheck size={17} />}
          I verified my email
        </button>
        <Link
          href="/account"
          className="inline-flex h-12 items-center justify-center gap-2 border border-slate-300 bg-white px-5 text-sm font-bold text-slate-950 transition hover:border-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-lime-300"
        >
          Continue to account
          <ArrowRight size={17} />
        </Link>
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left dark:border-white/10 dark:bg-white/5">
          <ShieldCheck className="mt-0.5 shrink-0 text-lime-600 dark:text-lime-300" size={19} />
          <p className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            If the link does not arrive, check Promotions or Spam once, then mark it as trusted.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
