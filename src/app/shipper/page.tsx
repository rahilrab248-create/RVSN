import type { Metadata } from "next";
import { ShipperDashboard } from "@/components/shipper/shipper-dashboard";

export const metadata: Metadata = {
  title: "Delivery Desk | RVSN Commerce",
  description: "Manage RVSN order shipment, tracking, and cash-on-delivery payment status.",
};

export default function ShipperPage() {
  return <ShipperDashboard />;
}
