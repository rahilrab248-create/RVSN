"use client";

import { cloneElement, type FormEvent, type ReactElement, type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  ChevronRight,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CHECKOUT_SHIPPING_FEE, calculateCouponDiscount, findCheckoutCoupon } from "@/config/checkout";
import { useAuthPrompt } from "@/contexts/auth-prompt-context";
import { hasFirebaseClientConfig } from "@/lib/firebase/config";
import { createOrder } from "@/lib/firebase/orders";
import { createStripeCheckoutSession } from "@/lib/firebase/payments";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";
import type { CheckoutErrors, CheckoutForm, PaymentMethod, SavedAddress } from "@/types/checkout";

const savedAddressesKey = "fooltball-checkout-addresses";

const emptyForm: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  saveAddress: true,
};

function validateCheckout(form: CheckoutForm, paymentMethod: PaymentMethod, itemCount: number): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!itemCount) {
    errors.cart = "Add products to your cart before checkout.";
  }

  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!form.email.trim() || !emailPattern.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.line1.trim()) {
    errors.line1 = "Street address is required.";
  }

  if (!form.city.trim()) {
    errors.city = "City is required.";
  }

  if (!form.country.trim()) {
    errors.country = "Country is required.";
  }

  if (!paymentMethod) {
    errors.payment = "Choose a payment method.";
  }

  return errors;
}

function readSavedAddresses(): SavedAddress[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(savedAddressesKey);
    return raw ? (JSON.parse(raw) as SavedAddress[]) : [];
  } catch {
    return [];
  }
}

function writeSavedAddresses(addresses: SavedAddress[]) {
  window.localStorage.setItem(savedAddressesKey, JSON.stringify(addresses.slice(0, 4)));
}

export function CheckoutPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { formatPrice, selectedCountry } = useCurrency();
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setSavedAddresses(readSavedAddresses());
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || profile?.name || user?.displayName || "",
      email: current.email || profile?.email || user?.email || "",
    }));
  }, [profile, user]);

  const shipping = itemCount ? CHECKOUT_SHIPPING_FEE : 0;
  const appliedCoupon = useMemo(
    () => (appliedCouponCode ? findCheckoutCoupon(appliedCouponCode) : null),
    [appliedCouponCode],
  );
  const discount = calculateCouponDiscount({ coupon: appliedCoupon, subtotal, shipping });
  const total = Math.max(0, subtotal + shipping - discount);

  const updateField = <Field extends keyof CheckoutForm>(field: Field, value: CheckoutForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const applyCoupon = () => {
    const coupon = findCheckoutCoupon(couponInput);

    if (!coupon) {
      setAppliedCouponCode(null);
      setCouponMessage("That code is not active.");
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponInput(coupon.code);
    setCouponMessage(`${coupon.label} applied.`);
  };

  const selectSavedAddress = (address: SavedAddress) => {
    setForm((current) => ({
      ...current,
      ...address,
      saveAddress: current.saveAddress,
    }));
    setErrors({});
  };

  const persistAddress = () => {
    if (!form.saveAddress) {
      return;
    }

    const nextAddress: SavedAddress = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
    };

    const filtered = savedAddresses.filter(
      (address) => `${address.line1}-${address.city}` !== `${nextAddress.line1}-${nextAddress.city}`,
    );
    const nextAddresses = [nextAddress, ...filtered].slice(0, 4);
    setSavedAddresses(nextAddresses);
    writeSavedAddresses(nextAddresses);
  };

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");

    if (!isAuthenticated || !user) {
      openAuthPrompt("To place the order, please login or sign up first.");
      return;
    }

    const validationErrors = validateCheckout(form, paymentMethod, itemCount);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      persistAddress();

      if (paymentMethod === "stripe") {
        const session = await createStripeCheckoutSession({
          items,
          subtotal,
          shipping,
          discount,
          total,
          currency: selectedCountry.currencyCode,
          couponCode: appliedCoupon?.code ?? null,
          shippingAddress: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
        });
        window.location.assign(session.url);
        return;
      }

      if (hasFirebaseClientConfig()) {
        const order = await createOrder({
          userId: user.uid,
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            image: item.image,
            brand: item.brand,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shipping,
          total,
          currency: selectedCountry.currencyCode,
          shippingAddress: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          status: "pending",
        });
        await clearCart();
        setSuccessMessage(`Cash on delivery order placed. Order reference: ${order.id}.`);
      } else {
        await clearCart();
        setSuccessMessage("Cash on delivery order is ready. Online order sync is not connected for this session.");
      }
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.24),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] pt-28 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.12),transparent_35%),linear-gradient(180deg,#070a0f_0%,#101826_100%)] dark:text-white">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="min-w-0"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-700 dark:text-lime-300">Secure checkout</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Finish the match.
              </h1>
            </div>
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-950 shadow-sm transition hover:border-lime-500 hover:text-lime-700 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-lime-300 dark:hover:text-lime-200"
            >
              Keep shopping <ChevronRight size={16} />
            </Link>
          </div>

          <form onSubmit={submitCheckout} className="grid gap-5">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">Address management</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Shipping details</h2>
                </div>
                <span className="grid size-11 place-items-center bg-slate-950 text-lime-300 dark:bg-lime-300 dark:text-slate-950">
                  <MapPin size={20} />
                </span>
              </div>

              {savedAddresses.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => selectSavedAddress(address)}
                      className="border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-lime-500 hover:bg-lime-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-lime-300 dark:hover:bg-lime-300/10"
                    >
                      <p className="text-sm font-black text-slate-950 dark:text-white">{address.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {address.line1}, {address.city}, {address.country}
                      </p>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                  <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
                </Field>
                <Field label="Country" error={errors.country}>
                  <input value={form.country} onChange={(event) => updateField("country", event.target.value)} />
                </Field>
                <Field label="Street address" error={errors.line1} className="sm:col-span-2">
                  <input value={form.line1} onChange={(event) => updateField("line1", event.target.value)} />
                </Field>
                <Field label="Apartment, suite, etc." className="sm:col-span-2">
                  <input value={form.line2} onChange={(event) => updateField("line2", event.target.value)} />
                </Field>
                <Field label="City" error={errors.city}>
                  <input value={form.city} onChange={(event) => updateField("city", event.target.value)} />
                </Field>
                <Field label="State / Region">
                  <input value={form.state} onChange={(event) => updateField("state", event.target.value)} />
                </Field>
                <Field label="Postal code">
                  <input
                    value={form.postalCode}
                    onChange={(event) => updateField("postalCode", event.target.value)}
                  />
                </Field>
                <label className="flex items-center gap-3 pt-7 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.saveAddress}
                    onChange={(event) => updateField("saveAddress", event.target.checked)}
                    className="size-4 accent-lime-500"
                  />
                  Save this address
                </label>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">Payment options</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Choose payment</h2>
                </div>
                <span className="grid size-11 place-items-center bg-lime-300 text-slate-950">
                  <ShieldCheck size={20} />
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PaymentOption
                  active={paymentMethod === "stripe"}
                  icon={<CreditCard size={22} />}
                  title="Stripe online payment"
                  copy="Fast card checkout for players who want their kit before kickoff."
                  onClick={() => setPaymentMethod("stripe")}
                />
                <PaymentOption
                  active={paymentMethod === "cash_on_delivery"}
                  icon={<Banknote size={22} />}
                  title="Cash on delivery"
                  copy="Place the order now and pay when your kit arrives."
                  onClick={() => setPaymentMethod("cash_on_delivery")}
                />
              </div>
              {errors.payment ? <p className="mt-3 text-sm font-bold text-red-600">{errors.payment}</p> : null}
            </motion.section>

            <AnimatePresence>
              {errors.cart ? (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
                >
                  {errors.cart}
                </motion.p>
              ) : null}
              {successMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-3 border border-lime-300 bg-lime-50 p-4 text-sm font-bold text-lime-800"
                >
                  <BadgeCheck className="mt-0.5 shrink-0" size={18} />
                  <span>{successMessage}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              whileHover={{ y: itemCount ? -2 : 0 }}
              whileTap={{ scale: itemCount ? 0.98 : 1 }}
              disabled={isSubmitting || !itemCount}
              className="h-14 border border-emerald-600 bg-emerald-600 px-6 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-emerald-200/60 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none dark:border-emerald-400 dark:bg-emerald-400 dark:text-slate-950 dark:shadow-emerald-950/30 dark:hover:border-white dark:hover:bg-white dark:disabled:border-white/10 dark:disabled:bg-white/10 dark:disabled:text-slate-400"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Processing
                </span>
              ) : paymentMethod === "stripe" ? (
                "Pay with Stripe"
              ) : (
                "Place COD order"
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="h-fit border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/25 dark:border-white/10 lg:sticky lg:top-28"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Order summary</p>
              <h2 className="mt-1 text-2xl font-black">Match kit</h2>
            </div>
            <PackageCheck className="text-lime-300" size={26} />
          </div>

          <div className="mt-6 grid max-h-[360px] gap-4 overflow-y-auto pr-1">
            {items.length ? (
              items.map((item) => (
                <article key={item.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3">
                  <div className="relative aspect-square overflow-hidden bg-white/10">
                    <Image src={item.image} alt={item.title} fill sizes="72px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-black">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {item.brand} / {item.size} / Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black text-lime-300">{formatPrice(item.price * item.quantity)}</p>
                </article>
              ))
            ) : (
              <div className="border border-white/10 bg-white/5 p-5 text-center">
                <Home className="mx-auto text-lime-300" size={24} />
                <p className="mt-3 text-sm font-bold text-slate-200">Your cart is waiting for a starting eleven.</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <TicketPercent className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Coupon code"
                  className="h-11 w-full border border-white/10 bg-white/10 pl-10 pr-3 text-sm font-bold text-white outline-none placeholder:text-slate-400 focus:border-lime-300"
                />
              </div>
              <button
                type="button"
                onClick={applyCoupon}
                className="h-11 bg-lime-300 px-4 text-sm font-black text-slate-950 transition hover:bg-white"
              >
                Apply
              </button>
            </div>
            {couponMessage ? (
              <p className={cn("mt-2 text-xs font-bold", appliedCoupon ? "text-lime-300" : "text-red-300")}>
                {couponMessage}
              </p>
            ) : (
              <p className="mt-2 text-xs font-semibold text-slate-400">Try KICKOFF10 or FREESHIP.</p>
            )}
          </div>

          <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm">
            <SummaryLine label="Subtotal" value={formatPrice(subtotal)} />
            <SummaryLine label="Shipping" value={formatPrice(shipping)} />
            <SummaryLine label="Discount" value={`-${formatPrice(discount)}`} muted={!discount} />
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4 text-xl font-black">
              <span>Total</span>
              <span className="text-lime-300">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 border border-lime-300/30 bg-lime-300/10 p-4">
            <Sparkles className="shrink-0 text-lime-300" size={20} />
            <p className="text-xs font-semibold leading-5 text-slate-200">
              Secure checkout with cash on delivery support and matchday order tracking.
            </p>
          </div>
        </motion.aside>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactElement<{ className?: string }>;
}) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">{label}</span>
      {cloneElement(children, {
        className: cn(
          "h-12 border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-lime-300 dark:focus:bg-white/15",
          error && "border-red-300 bg-red-50 dark:border-red-400 dark:bg-red-500/10",
          children.props.className,
        ),
      })}
      {error ? <span className="text-xs font-bold text-red-600 dark:text-red-300">{error}</span> : null}
    </label>
  );
}

function PaymentOption({
  active,
  icon,
  title,
  copy,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-32 items-start gap-4 border p-4 text-left transition",
        active
          ? "border-lime-500 bg-lime-50 shadow-lg shadow-lime-200/50 dark:border-lime-300 dark:bg-lime-300/15 dark:shadow-lime-950/30"
          : "border-slate-200 bg-slate-50 hover:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-slate-300",
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center", active ? "bg-slate-950 text-lime-300 dark:bg-lime-300 dark:text-slate-950" : "bg-white text-slate-700 dark:bg-white/10 dark:text-slate-200")}>
        {icon}
      </span>
      <span>
        <span className="block text-base font-black text-slate-950 dark:text-white">{title}</span>
        <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{copy}</span>
      </span>
    </button>
  );
}

function SummaryLine({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", muted ? "text-slate-500" : "text-slate-300")}>
      <span>{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}
