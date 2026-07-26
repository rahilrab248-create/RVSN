"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole, X } from "lucide-react";
import Link from "next/link";

type AuthPromptContextValue = {
  openAuthPrompt: (message?: string) => void;
  closeAuthPrompt: () => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | undefined>(undefined);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("To place an order, please login or create an account.");
  const [isOpen, setIsOpen] = useState(false);

  const openAuthPrompt = useCallback((nextMessage?: string) => {
    setMessage(nextMessage ?? "To place an order, please login or create an account.");
    setIsOpen(true);
  }, []);

  const closeAuthPrompt = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ openAuthPrompt, closeAuthPrompt }), [closeAuthPrompt, openAuthPrompt]);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen ? (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              aria-label="Close login prompt"
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeAuthPrompt}
            />
            <motion.section
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/14 bg-[#09070f]/92 p-6 text-white shadow-2xl shadow-black/45 backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.28),transparent_18rem),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_46%)]" />
              <button
                aria-label="Close login prompt"
                className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-white/12 bg-white/8 text-white/76 transition hover:border-white/30 hover:bg-white/14 hover:text-white"
                onClick={closeAuthPrompt}
              >
                <X size={18} />
              </button>
              <div className="relative z-10">
                <span className="grid size-14 place-items-center rounded-2xl border border-violet-200/24 bg-white/10 text-violet-100 shadow-[inset_0_1px_rgba(255,255,255,0.18)]">
                  <LockKeyhole size={23} />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/62">
                  Login required
                </p>
                <h2 className="mt-2 text-3xl font-normal leading-none tracking-[-0.05em] text-white">Join before checkout.</h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-violet-100/68">{message}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/login"
                    onClick={closeAuthPrompt}
                    className="grid h-12 place-items-center rounded-full border border-white/90 bg-white text-sm font-semibold !text-black shadow-[0_16px_40px_rgba(255,255,255,0.08)] transition hover:border-violet-200 hover:bg-violet-100"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeAuthPrompt}
                    className="grid h-12 place-items-center rounded-full border border-white/14 bg-white/8 text-sm font-semibold !text-white transition hover:border-violet-200/45 hover:bg-white/14"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);

  if (!context) {
    throw new Error("useAuthPrompt must be used within AuthPromptProvider.");
  }

  return context;
}
