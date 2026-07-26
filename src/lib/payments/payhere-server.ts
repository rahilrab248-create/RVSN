import "server-only";

import crypto from "crypto";
import type { PayHereCheckoutInput, PayHereCheckoutSession } from "@/types/payhere";

const sandboxActionUrl = "https://sandbox.payhere.lk/pay/checkout";
const productionActionUrl = "https://www.payhere.lk/pay/checkout";

export function createPayHereCheckoutSession(input: PayHereCheckoutInput): PayHereCheckoutSession {
  const merchantId = requireEnv("PAYHERE_MERCHANT_ID");
  const merchantSecret = requireEnv("PAYHERE_MERCHANT_SECRET");
  const amount = formatPayHereAmount(input.amount);
  const currency = input.currency || process.env.PAYHERE_CURRENCY || "LKR";
  const baseUrl = getSiteUrl();
  const mode = process.env.PAYHERE_MODE ?? "sandbox";

  const fields: Record<string, string> = {
    merchant_id: merchantId,
    return_url: `${baseUrl}/checkout/success?order_id=${encodeURIComponent(input.orderId)}`,
    cancel_url: `${baseUrl}/checkout?payment_cancelled=1`,
    notify_url: `${baseUrl}/api/payhere/notify`,
    order_id: input.orderId,
    items: input.itemsLabel,
    currency,
    amount,
    first_name: getFirstName(input.customer.name),
    last_name: getLastName(input.customer.name),
    email: input.customer.email,
    phone: input.customer.phone ?? "",
    address: [input.customer.line1, input.customer.line2].filter(Boolean).join(", "),
    city: input.customer.city,
    country: input.customer.country,
    custom_1: input.orderNumber,
    hash: createCheckoutHash({ merchantId, orderId: input.orderId, amount, currency, merchantSecret }),
  };

  return {
    actionUrl: mode === "production" ? productionActionUrl : sandboxActionUrl,
    fields,
  };
}

export function verifyPayHereNotification(input: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  md5sig: string;
}) {
  const expected = createNotificationHash({
    merchantId: input.merchantId,
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    statusCode: input.statusCode,
    merchantSecret: requireEnv("PAYHERE_MERCHANT_SECRET"),
  });

  return expected === input.md5sig.toUpperCase();
}

export function formatPayHereAmount(amount: number) {
  return amount.toFixed(2);
}

function createCheckoutHash(input: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  merchantSecret: string;
}) {
  const secretHash = md5(input.merchantSecret).toUpperCase();
  return md5(`${input.merchantId}${input.orderId}${input.amount}${input.currency}${secretHash}`).toUpperCase();
}

function createNotificationHash(input: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  merchantSecret: string;
}) {
  const secretHash = md5(input.merchantSecret).toUpperCase();
  return md5(`${input.merchantId}${input.orderId}${input.amount}${input.currency}${input.statusCode}${secretHash}`).toUpperCase();
}

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function requireEnv(key: "PAYHERE_MERCHANT_ID" | "PAYHERE_MERCHANT_SECRET") {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured.`);
  }

  return value;
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "RVSN";
}

function getLastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : "Customer";
}
