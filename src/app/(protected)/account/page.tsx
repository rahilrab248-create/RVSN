"use client";

import { CheckCircle2, Clock, Loader2, Mail, PackageCheck, RefreshCcw, ShieldCheck, Truck, UserRound, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { CustomSelect } from "@/components/ui/custom-select";
import { subscribeToUserOrders } from "@/lib/firebase/orders";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/ecommerce";

export default function AccountPage() {
  const { profile, profileSyncError, user, logout, refreshProfile } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return undefined;
    }

    return subscribeToUserOrders(
      user.uid,
      (nextOrders) => {
        setOrders(nextOrders);
        setOrdersError("");
      },
      (error) => {
        setOrdersError(error.message);
      },
    );
  }, [user]);

  async function handleSyncProfile() {
    setIsSyncing(true);

    try {
      await refreshProfile();
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <section className="pitch-grid min-h-screen border-b border-slate-200 px-4 py-28 sm:py-32">
      <div className="container-shell">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="glass-panel max-w-3xl rounded-lg p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Player locker</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Your matchday hub</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Keep your football identity, delivery details, and order journey close before the next whistle.
          </p>

          {profileSyncError ? (
            <div className="mt-6 border border-amber-300 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100">
              <p>Your locker is signed in, but online sync has not created your account document yet.</p>
              <button
                type="button"
                onClick={() => void handleSyncProfile()}
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-lime-500 hover:text-slate-950 disabled:opacity-60"
                disabled={isSyncing}
              >
                {isSyncing ? <Loader2 className="animate-spin" size={15} /> : <RefreshCcw size={15} />}
                Sync locker
              </button>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3">
            <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
              <UserRound className="text-slate-950" size={20} />
              <span className="text-sm text-slate-700">{profile?.name ?? user?.displayName ?? "Football Member"}</span>
            </div>
            <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
              <Mail className="text-slate-950" size={20} />
              <span className="text-sm text-slate-700">{profile?.email ?? user?.email}</span>
            </div>
            <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
              <ShieldCheck className="text-slate-950" size={20} />
              <span className="text-sm text-slate-700">
                Email {user?.emailVerified ? "verified" : "not verified yet"}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 inline-flex h-12 items-center justify-center border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:border-slate-950"
          >
            Logout
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="mt-8 max-w-5xl"
        >
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Order tracking</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Track your matchday delivery.</h2>
          </div>

          {ordersError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{ordersError}</div>
          ) : null}

          {!orders.length && !ordersError ? (
            <div className="glass-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
              No orders yet. When you place an order, your approval and delivery timeline will appear here.
            </div>
          ) : null}

          <div className="grid gap-4">
            {orders.map((order) => (
              <OrderTrackingCard key={order.id} order={order} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function OrderTrackingCard({ order }: { order: Order }) {
  const statusInfo = getTrackingStatusInfo(order.status);
  const userStatusValue = getUserStatusValue(order.status);
  const { formatPrice } = useCurrency();

  return (
    <article className="glass-panel rounded-lg p-5 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Order {order.id}</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{statusInfo.title}</h3>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{statusInfo.description}</p>
        </div>
        <CustomSelect
          label="Current status"
          value={userStatusValue}
          options={userStatusOptions}
          disabled
          toneClassName={statusInfo.selectClassName}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {trackingSteps.map((step) => {
          const state = getStepState(order.status, step.statuses);

          return (
            <div key={step.label} className={cn("border p-4", state === "done" ? "border-lime-200 bg-lime-50" : state === "active" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white")}>
              <step.icon className={cn(state === "done" || state === "active" ? "text-emerald-700" : "text-slate-400")} size={20} />
              <p className="mt-3 text-sm font-black text-slate-950">{step.label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{step.copy}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 border-t border-slate-200 pt-4 text-sm sm:grid-cols-3">
        <SummaryItem label="Total" value={formatPrice(order.total)} />
        <SummaryItem label="Items" value={`${order.items.length}`} />
        <SummaryItem label="Ship to" value={`${order.shippingAddress.city}, ${order.shippingAddress.country}`} />
      </div>
    </article>
  );
}

const trackingSteps = [
  {
    label: "Waiting approval",
    copy: "Your order is waiting for admin approval.",
    statuses: ["pending"],
    icon: Clock,
  },
  {
    label: "Approved",
    copy: "Admin approved the order and is preparing shipment.",
    statuses: ["approved", "paid", "processing"],
    icon: PackageCheck,
  },
  {
    label: "Waiting shipment",
    copy: "Your order is approved and waiting to leave the store.",
    statuses: ["processing"],
    icon: PackageCheck,
  },
  {
    label: "Delivering",
    copy: "Your football gear is on the way.",
    statuses: ["shipped"],
    icon: Truck,
  },
  {
    label: "Delivered",
    copy: "The order has reached your address.",
    statuses: ["delivered"],
    icon: CheckCircle2,
  },
] as const;

const userStatusOptions = [
  { label: "Waiting approval", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Waiting shipment", value: "processing" },
  { label: "Delivering", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}

function getStepState(currentStatus: OrderStatus, stepStatuses: readonly OrderStatus[]) {
  if (currentStatus === "cancelled") {
    return "idle";
  }

  const currentIndex = getTrackingIndex(currentStatus);
  const stepIndex = Math.max(...stepStatuses.map(getTrackingIndex));

  if (currentIndex > stepIndex) {
    return "done";
  }

  if (stepStatuses.includes(currentStatus)) {
    return "active";
  }

  return "idle";
}

function getTrackingIndex(status: OrderStatus) {
  const order: Record<OrderStatus, number> = {
    pending: 0,
    approved: 1,
    paid: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };

  return order[status];
}

function getTrackingStatusInfo(status: OrderStatus) {
  if (status === "cancelled") {
    return {
      title: "Order cancelled.",
      description: "This order was cancelled. Contact the store if you need help with this order.",
      badge: "Cancelled",
      badgeClassName: "bg-red-50 text-red-700",
      selectClassName: "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }

  if (status === "delivered") {
    return {
      title: "Delivered.",
      description: "Your football gear has arrived. Time to get matchday ready.",
      badge: "Delivered",
      badgeClassName: "bg-lime-100 text-lime-800",
      selectClassName: "border-lime-200 bg-lime-100 text-lime-800",
      icon: CheckCircle2,
    };
  }

  if (status === "shipped") {
    return {
      title: "Order is delivering.",
      description: "Your order has shipped and is currently on the way.",
      badge: "Delivering",
      badgeClassName: "bg-sky-50 text-sky-700",
      selectClassName: "border-sky-200 bg-sky-50 text-sky-700",
      icon: Truck,
    };
  }

  if (status === "processing") {
    return {
      title: "Waiting shipment.",
      description: "Admin approved your order. It is waiting to be shipped.",
      badge: "Waiting shipment",
      badgeClassName: "bg-amber-50 text-amber-700",
      selectClassName: "border-amber-200 bg-amber-50 text-amber-700",
      icon: PackageCheck,
    };
  }

  if (status === "approved" || status === "paid") {
    return {
      title: "Approved.",
      description: "Admin has seen and approved your order.",
      badge: "Approved",
      badgeClassName: "bg-amber-50 text-amber-700",
      selectClassName: "border-amber-200 bg-amber-50 text-amber-700",
      icon: PackageCheck,
    };
  }

  return {
    title: "Waiting for admin approval.",
    description: "Your order was received. Admin needs to review and approve it before shipment.",
    badge: "Waiting approval",
    badgeClassName: "bg-white text-slate-700",
    selectClassName: "border-slate-200 bg-white text-slate-700",
    icon: Clock,
  };
}

function getUserStatusValue(status: OrderStatus) {
  if (status === "paid") {
    return "approved";
  }

  return status;
}
