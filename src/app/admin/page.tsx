import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Football Commerce",
  description: "Manage football ecommerce products, orders, users, inventory, and sales analytics.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
