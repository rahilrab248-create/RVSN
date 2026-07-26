import type { ReactNode } from "react";
import { RoleRoute } from "@/components/auth/role-route";

export default function ShipperLayout({ children }: { children: ReactNode }) {
  return <RoleRoute allowedRoles={["admin", "shipper"]} label="delivery desk">{children}</RoleRoute>;
}
