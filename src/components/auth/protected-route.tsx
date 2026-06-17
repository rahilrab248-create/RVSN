"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 pt-28">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="animate-spin text-lime-200" size={20} />
          <span className="font-mono text-xs uppercase tracking-[0.24em]">Checking access</span>
        </div>
      </div>
    );
  }

  return children;
}
