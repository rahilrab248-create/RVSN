"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/user";

export function RoleRoute({
  children,
  allowedRoles,
  label = "secure area",
}: {
  children: ReactNode;
  allowedRoles: UserRole[];
  label?: string;
}) {
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
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="animate-spin text-violet-100" size={20} />
          <span className="font-mono text-xs uppercase tracking-[0.24em]">Checking {label}</span>
        </div>
      </div>
    );
  }

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return (
      <main className="purple-page-shell grid min-h-screen place-items-center px-4 pt-24 text-white">
        <section className="max-w-lg rounded-[28px] border border-white/12 bg-white/[0.055] p-8 text-center shadow-2xl shadow-black/35 backdrop-blur-xl">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-300/25 bg-red-400/10 text-red-100">
            <ShieldAlert size={26} />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/48">Access blocked</p>
          <h1 className="mt-2 text-3xl font-normal tracking-[-0.05em] text-white">This desk is not assigned to your account.</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/58">
            Ask the store owner to update your account role before opening this page.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-grid h-11 place-items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-violet-100"
          >
            Back to account
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
