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
              className="relative w-full max-w-md border border-slate-200 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/30 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            >
              <button
                aria-label="Close login prompt"
                className="absolute right-4 top-4 grid size-9 place-items-center border border-slate-200 bg-slate-50 text-slate-700 transition hover:text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                onClick={closeAuthPrompt}
              >
                <X size={18} />
              </button>
              <span className="grid size-14 place-items-center bg-lime-300 text-slate-950">
                <LockKeyhole size={24} />
              </span>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-lime-700 dark:text-lime-300">
                Login required
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Join before checkout.</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{message}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/login"
                  onClick={closeAuthPrompt}
                  className="grid h-12 place-items-center bg-slate-950 text-sm font-black text-white transition hover:bg-lime-500 hover:text-slate-950 dark:bg-lime-300 dark:text-slate-950"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeAuthPrompt}
                  className="grid h-12 place-items-center border border-slate-300 bg-white text-sm font-black text-slate-950 transition hover:border-lime-500 dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  Sign up
                </Link>
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
