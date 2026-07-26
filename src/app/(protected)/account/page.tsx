"use client";

import { CheckCircle2, Clock, Loader2, Mail, PackageCheck, RefreshCcw, ShieldCheck, Truck, UserRound, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { CustomSelect } from "@/components/ui/custom-select";
import { subscribeUserOrders } from "@/lib/firebase/orders";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/ecommerce";

export default function AccountPage() {
  const { profile, profileSyncError, user, logout, refreshProfile } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return undefined;
    }

    const userId = user.uid;

    setIsLoadingOrders(true);
    setOrdersError("");

    const unsubscribe = subscribeUserOrders(
      userId,
      (nextOrders) => {
        setOrders(nextOrders);
        setIsLoadingOrders(false);
      },
      (error) => {
        setOrdersError(error.message || "Orders could not load right now.");
        setIsLoadingOrders(false);
      },
    );

    return unsubscribe;
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
    <section className="purple-page-shell min-h-screen border-b border-white/10 px-4 py-28 text-white sm:py-32">
      <div className="container-shell">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="max-w-3xl rounded-[24px] border border-white/12 bg-white/[0.055] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-100/55">Player locker</p>
          <h1 className="mt-3 text-4xl font-normal leading-[0.96] tracking-[-0.06em] text-white">Your matchday hub</h1>
          <p className="mt-4 text-sm leading-7 text-white/56">
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
            <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
              <UserRound className="text-violet-100" size={20} />
              <span className="text-sm text-white/76">{profile?.name ?? user?.displayName ?? "Football Member"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
              <Mail className="text-violet-100" size={20} />
              <span className="text-sm text-white/76">{profile?.email ?? user?.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.07] p-4">
              <ShieldCheck className="text-violet-100" size={20} />
              <span className="text-sm text-white/76">
                Email {user?.emailVerified ? "verified" : "not verified yet"}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-violet-100"
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/50">Order tracking</p>
            <h2 className="mt-2 text-3xl font-normal tracking-[-0.05em] text-white">Track your matchday delivery.</h2>
          </div>

          {ordersError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{ordersError}</div>
          ) : null}

          {isLoadingOrders ? (
            <OrderTrackingSkeleton />
          ) : null}

          {!orders.length && !ordersError && !isLoadingOrders ? (
            <div className="rounded-[18px] border border-white/10 bg-white/[0.055] p-6 text-sm font-semibold text-white/56 backdrop-blur-xl">
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

function OrderTrackingSkeleton() {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <div className="skeleton-shimmer h-3 w-40 rounded-full bg-white/[0.08]" />
          <div className="skeleton-shimmer mt-4 h-7 w-72 max-w-full rounded-full bg-white/[0.08]" />
          <div className="skeleton-shimmer mt-3 h-4 w-full max-w-xl rounded-full bg-white/[0.07]" />
        </div>
        <div className="skeleton-shimmer h-13 rounded-full bg-white/[0.08]" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-[16px] border border-white/10 bg-white/[0.045] p-4">
            <div className="skeleton-shimmer size-5 rounded-full bg-white/[0.08]" />
            <div className="skeleton-shimmer mt-3 h-4 w-24 rounded-full bg-white/[0.08]" />
            <div className="skeleton-shimmer mt-3 h-3 w-full rounded-full bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderTrackingCard({ order }: { order: Order }) {
  const statusInfo = getTrackingStatusInfo(order.status);
  const userStatusValue = getUserStatusValue(order.status);
  const { formatPrice } = useCurrency();

  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/45">Order {order.orderNumber ?? order.id}</p>
          <h3 className="mt-2 text-xl font-normal tracking-[-0.04em] text-white">{statusInfo.title}</h3>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/56">{statusInfo.description}</p>
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
            <div
              key={step.label}
              className={getTrackingStepClassName(order.status, state)}
            >
              <step.icon className={getTrackingStepIconClassName(order.status, state)} size={20} />
              <p className="mt-3 text-sm font-semibold text-white">{step.label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/46">{step.copy}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
        <SummaryItem label="Total" value={formatPrice(order.total)} />
        <SummaryItem label="Items" value={`${order.items.length}`} />
        <SummaryItem label="Ship to" value={`${order.shippingAddress.city}, ${order.shippingAddress.country}`} />
      </div>
    </article>
  );
}

function getTrackingStepClassName(status: OrderStatus, state: "done" | "active" | "idle") {
  const baseClassName = "rounded-[16px] border p-4 transition duration-500";

  if (status === "cancelled") {
    return cn(baseClassName, "border-white/10 bg-white/[0.045]");
  }

  if (status === "delivered" && (state === "done" || state === "active")) {
    return cn(baseClassName, "border-emerald-200/45 bg-emerald-300/14 shadow-[0_0_34px_rgba(110,231,183,0.12)]");
  }

  if (state === "done") {
    return cn(baseClassName, "border-emerald-200/38 bg-emerald-300/10");
  }

  if (state === "active") {
    if (status === "shipped") {
      return cn(baseClassName, "border-sky-200/42 bg-sky-300/12 shadow-[0_0_34px_rgba(125,211,252,0.12)]");
    }

    return cn(baseClassName, "border-violet-200/42 bg-violet-300/12 shadow-[0_0_34px_rgba(196,181,253,0.1)]");
  }

  return cn(baseClassName, "border-white/10 bg-white/[0.045]");
}

function getTrackingStepIconClassName(status: OrderStatus, state: "done" | "active" | "idle") {
  if (status === "delivered" && (state === "done" || state === "active")) {
    return "text-emerald-100";
  }

  if (state === "done") {
    return "text-emerald-100";
  }

  if (state === "active") {
    return status === "shipped" ? "text-sky-100" : "text-violet-100";
  }

  return "text-white/34";
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
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
      selectClassName: "border-red-300/30 bg-red-500/12 !text-red-100",
      icon: XCircle,
    };
  }

  if (status === "delivered") {
    return {
      title: "Delivered.",
      description: "Your football gear has arrived. Time to get matchday ready.",
      badge: "Delivered",
      badgeClassName: "bg-lime-100 text-lime-800",
      selectClassName: "border-violet-200/35 bg-violet-300/14 !text-violet-50",
      icon: CheckCircle2,
    };
  }

  if (status === "shipped") {
    return {
      title: "Order is delivering.",
      description: "Your order has shipped and is currently on the way.",
      badge: "Delivering",
      badgeClassName: "bg-sky-50 text-sky-700",
      selectClassName: "border-sky-200/35 bg-sky-300/12 !text-sky-50",
      icon: Truck,
    };
  }

  if (status === "processing") {
    return {
      title: "Waiting shipment.",
      description: "Admin approved your order. It is waiting to be shipped.",
      badge: "Waiting shipment",
      badgeClassName: "bg-amber-50 text-amber-700",
      selectClassName: "border-amber-200/35 bg-amber-300/12 !text-amber-50",
      icon: PackageCheck,
    };
  }

  if (status === "approved" || status === "paid") {
    return {
      title: "Approved.",
      description: "Admin has seen and approved your order.",
      badge: "Approved",
      badgeClassName: "bg-amber-50 text-amber-700",
      selectClassName: "border-violet-200/35 bg-violet-300/14 !text-violet-50",
      icon: PackageCheck,
    };
  }

  return {
    title: "Waiting for admin approval.",
    description: "Your order was received. Admin needs to review and approve it before shipment.",
    badge: "Waiting approval",
    badgeClassName: "bg-white text-slate-700",
    selectClassName: "border-white/12 bg-white/[0.07] !text-white",
    icon: Clock,
  };
}

function getUserStatusValue(status: OrderStatus) {
  if (status === "paid") {
    return "approved";
  }

  return status;
}
