"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clipboard, Loader2, Search, Truck } from "lucide-react";
import { getOrders, updateOrderFulfillment, updateOrderPaymentStatus } from "@/lib/firebase/orders";
import { cn } from "@/lib/utils";
import type { Order, OrderFulfillmentUpdate, OrderStatus, PaymentStatus } from "@/types/ecommerce";

const shipperStatuses: OrderStatus[] = ["approved", "processing", "shipped", "delivered", "cancelled"];

type DeliveryForm = {
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  adminNote: string;
};

export function ShipperDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<DeliveryForm>(createDeliveryForm(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");

  useEffect(() => {
    void loadOrders();
  }, []);

  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? orders[0] ?? null,
    [activeOrderId, orders],
  );

  const visibleOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");

    if (!term) {
      return activeOrders;
    }

    return activeOrders.filter((order) =>
      [
        order.orderNumber,
        order.id,
        order.shippingAddress.name,
        order.shippingAddress.email,
        order.shippingAddress.phone,
        order.shippingAddress.city,
        order.shippingAddress.country,
        order.trackingNumber,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [orders, query]);

  useEffect(() => {
    if (!activeOrderId && visibleOrders[0]?.id) {
      setActiveOrderId(visibleOrders[0].id);
    }
  }, [activeOrderId, visibleOrders]);

  useEffect(() => {
    setForm(createDeliveryForm(activeOrder));
  }, [activeOrder]);

  async function loadOrders() {
    setIsLoading(true);
    setNotice("");

    try {
      const nextOrders = await getOrders();
      setOrders(nextOrders);
    } catch (error) {
      setNoticeTone("error");
      setNotice(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function saveFulfillment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeOrder?.id) {
      return;
    }

    await updateFulfillment(activeOrder.id, {
      courierName: normalizeOptionalText(form.courierName),
      trackingNumber: normalizeOptionalText(form.trackingNumber),
      trackingUrl: normalizeOptionalText(form.trackingUrl),
      adminNote: normalizeOptionalText(form.adminNote),
    });
  }

  async function updateFulfillment(orderId: string, data: OrderFulfillmentUpdate) {
    setIsSaving(true);
    setNotice("");

    try {
      await updateOrderFulfillment(orderId, data);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...data } : order)));
      setNoticeTone("success");
      setNotice("Delivery details updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function changePaymentStatus(orderId: string | undefined, paymentStatus: PaymentStatus) {
    if (!orderId) {
      return;
    }

    setIsSaving(true);
    setNotice("");

    try {
      await updateOrderPaymentStatus(orderId, paymentStatus);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus,
                payment: order.payment ? { ...order.payment, status: paymentStatus } : order.payment,
              }
            : order,
        ),
      );
      setNoticeTone("success");
      setNotice(paymentStatus === "paid" ? "Cash payment marked as received." : "Payment status updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function quickStatus(status: OrderStatus) {
    if (!activeOrder?.id) {
      return;
    }

    await updateFulfillment(activeOrder.id, { status });
  }

  return (
    <main className="purple-page-shell min-h-screen border-b border-white/10 pt-24 text-white">
      <section className="container-shell pb-16">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-100/56">Delivery desk</p>
            <h1 className="mt-3 text-4xl font-normal leading-none tracking-[-0.06em] text-white sm:text-5xl">Shipment control.</h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-violet-100/62">
              Only customer orders, delivery progress, tracking details, and COD payment confirmation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="h-11 rounded-full border border-white/14 bg-white/8 px-5 text-sm font-semibold text-white transition hover:border-violet-200/45 hover:bg-white/14"
          >
            Refresh orders
          </button>
        </div>

        <AnimatePresence>
          {notice ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                "mt-5 rounded-[18px] border p-4 text-sm font-semibold",
                noticeTone === "success"
                  ? "border-emerald-200/24 bg-emerald-300/10 text-emerald-50"
                  : "border-red-300/25 bg-red-400/10 text-red-100",
              )}
            >
              {notice}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isLoading ? (
          <div className="mt-8 grid min-h-[360px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.055]">
            <div className="flex items-center gap-3 text-violet-100/70">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">Loading delivery orders</span>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-100/44" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search orders, names, cities..."
                  className="h-12 w-full rounded-full border border-white/10 bg-white/[0.055] pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10"
                />
              </div>
              <div className="mt-4 grid max-h-[640px] gap-3 overflow-y-auto pr-1" data-lenis-prevent>
                {visibleOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setActiveOrderId(order.id ?? null)}
                    className={cn(
                      "rounded-[20px] border p-4 text-left transition",
                      activeOrder?.id === order.id
                        ? "border-violet-200/44 bg-violet-300/12 shadow-[0_0_40px_rgba(124,58,237,0.12)]"
                        : "border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.075]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{order.shippingAddress.name}</p>
                        <p className="mt-1 truncate font-mono text-xs font-semibold text-violet-100/50">{order.orderNumber ?? order.id}</p>
                      </div>
                      <span className={cn("shrink-0 px-2.5 py-1 text-[0.64rem] font-black uppercase tracking-[0.12em]", getShipperStatusClassName(order.status))}>
                        {getShipperStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-semibold leading-5 text-violet-100/52">
                      {order.shippingAddress.city}, {order.shippingAddress.country} / {order.paymentMethod ?? "cash_on_delivery"} / {order.paymentStatus ?? "unpaid"}
                    </p>
                  </button>
                ))}
                {!visibleOrders.length ? (
                  <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-5 text-sm font-semibold text-white/56">
                    No active delivery orders found.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              {activeOrder ? (
                <DeliveryOrderDesk
                  order={activeOrder}
                  form={form}
                  setForm={setForm}
                  isSaving={isSaving}
                  onSave={saveFulfillment}
                  onQuickStatus={quickStatus}
                  onPaymentChange={changePaymentStatus}
                />
              ) : (
                <div className="grid min-h-[420px] place-items-center text-center">
                  <div>
                    <Truck className="mx-auto text-violet-100/70" size={34} />
                    <p className="mt-4 text-sm font-semibold text-white/56">Choose an order to manage delivery.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function DeliveryOrderDesk({
  order,
  form,
  setForm,
  isSaving,
  onSave,
  onQuickStatus,
  onPaymentChange,
}: {
  order: Order;
  form: DeliveryForm;
  setForm: (next: DeliveryForm | ((current: DeliveryForm) => DeliveryForm)) => void;
  isSaving: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onQuickStatus: (status: OrderStatus) => void;
  onPaymentChange: (orderId: string | undefined, paymentStatus: PaymentStatus) => void;
}) {
  const fullAddress = [
    order.shippingAddress.line1,
    order.shippingAddress.line2,
    order.shippingAddress.city,
    order.shippingAddress.state,
    order.shippingAddress.postalCode,
    order.shippingAddress.country,
  ].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/48">Selected order</p>
          <h2 className="mt-2 text-3xl font-normal tracking-[-0.05em] text-white">{order.orderNumber ?? order.id}</h2>
          <p className="mt-2 text-sm font-semibold text-violet-100/56">{order.shippingAddress.name} / ${order.total}</p>
        </div>
        <span className={cn("px-3 py-2 text-xs font-black uppercase tracking-[0.14em]", getShipperStatusClassName(order.status))}>
          {getShipperStatusLabel(order.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5">
          <section className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Customer and location</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/70">{fullAddress}</p>
            <p className="mt-2 text-sm font-semibold text-violet-100/56">{order.shippingAddress.email}</p>
            {order.shippingAddress.phone ? <p className="mt-1 text-sm font-semibold text-violet-100/56">{order.shippingAddress.phone}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(fullAddress)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 text-xs font-semibold text-white transition hover:bg-white/14"
              >
                <Clipboard size={15} /> Copy address
              </button>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-full border border-white/12 bg-white/8 px-4 text-xs font-semibold text-white transition hover:bg-white/14">
                Open maps
              </a>
            </div>
          </section>

          <section className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Order products</p>
            <div className="mt-4 grid gap-2">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-black/18 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs font-semibold text-violet-100/48">{item.brand} / {item.size} / Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-5">
          <form onSubmit={onSave} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="text-violet-100" size={18} />
              <p className="text-sm font-semibold text-white">Delivery activity</p>
            </div>
            <div className="grid gap-3">
              <ShipperInput label="Courier name" value={form.courierName} onChange={(value) => setForm((current) => ({ ...current, courierName: value }))} />
              <ShipperInput label="Tracking number" value={form.trackingNumber} onChange={(value) => setForm((current) => ({ ...current, trackingNumber: value }))} />
              <ShipperInput label="Tracking URL" value={form.trackingUrl} onChange={(value) => setForm((current) => ({ ...current, trackingUrl: value }))} />
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">Delivery note</span>
                <textarea
                  value={form.adminNote}
                  onChange={(event) => setForm((current) => ({ ...current, adminNote: event.target.value }))}
                  className="min-h-24 rounded-[18px] border border-white/10 bg-white/[0.055] p-3 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10"
                />
              </label>
              <button disabled={isSaving} className="h-12 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-violet-100 disabled:opacity-50">
                {isSaving ? "Saving..." : "Save delivery details"}
              </button>
            </div>
          </form>

          <section className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Quick actions</p>
            <div className="mt-4 grid gap-2">
              {shipperStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={isSaving}
                  onClick={() => void onQuickStatus(status)}
                  className={cn(
                    "flex h-11 items-center justify-between rounded-full border px-4 text-sm font-semibold transition disabled:opacity-50",
                    order.status === status
                      ? "border-violet-200 bg-violet-200 text-black"
                      : "border-white/12 bg-white/8 text-white hover:border-violet-200/45 hover:bg-white/14",
                  )}
                >
                  {getShipperStatusLabel(status)}
                  {order.status === status ? <CheckCircle2 size={16} /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Payment</p>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/18 p-3">
                <span className="text-sm font-semibold text-violet-100/56">{order.paymentMethod ?? "cash_on_delivery"}</span>
                <span className="text-sm font-semibold text-white">{order.paymentStatus ?? "unpaid"}</span>
              </div>
              {order.paymentMethod === "cash_on_delivery" || !order.paymentMethod ? (
                <button
                  type="button"
                  disabled={order.paymentStatus === "paid" || isSaving}
                  onClick={() => onPaymentChange(order.id, "paid")}
                  className="h-11 rounded-full border border-emerald-200/24 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-white/32"
                >
                  {order.paymentStatus === "paid" ? "Cash received" : "Mark cash received"}
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ShipperInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-full border border-white/10 bg-white/[0.055] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10" />
    </label>
  );
}

function createDeliveryForm(order: Order | null): DeliveryForm {
  return {
    courierName: order?.courierName ?? "",
    trackingNumber: order?.trackingNumber ?? "",
    trackingUrl: order?.trackingUrl ?? "",
    adminNote: order?.adminNote ?? "",
  };
}

function normalizeOptionalText(value: string) {
  return value.trim() || null;
}

function getShipperStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: "Waiting approval",
    approved: "Approved",
    paid: "Paid",
    processing: "Waiting shipment",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Rejected",
  };

  return labels[status];
}

function getShipperStatusClassName(status: OrderStatus) {
  if (status === "cancelled") {
    return "rounded-full border border-red-300/30 bg-red-400/10 text-red-100";
  }

  if (status === "delivered") {
    return "rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "shipped") {
    return "rounded-full border border-sky-300/30 bg-sky-300/10 text-sky-100";
  }

  return "rounded-full border border-violet-200/30 bg-violet-300/10 text-violet-50";
}

function getErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("permission") || lowerMessage.includes("permission_denied")) {
    return 'Firebase blocked this delivery action. Confirm this account role is "shipper" or "admin" and deploy Firestore rules.';
  }

  return message || "Delivery action failed. Please try again.";
}
