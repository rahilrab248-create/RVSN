import type { ReactNode } from "react";
import { AdminRoute } from "@/components/auth/admin-route";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminRoute>{children}</AdminRoute>;
}
