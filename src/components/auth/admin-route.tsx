"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export function AdminRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 pt-28">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="animate-spin text-lime-500" size={20} />
          <span className="font-mono text-xs uppercase tracking-[0.24em]">Checking admin access</span>
        </div>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 pt-24 text-slate-950">
        <section className="max-w-lg border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <span className="mx-auto grid size-14 place-items-center bg-red-50 text-red-600">
            <ShieldAlert size={26} />
          </span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-slate-500">Admin only</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">You do not have dashboard access.</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Your account needs captain access before you can manage products, orders, and players.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-grid h-11 place-items-center bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-lime-500 hover:text-slate-950"
          >
            Back to account
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
