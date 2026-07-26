import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminCollection, adminDoc } from "@/lib/firebase/admin-firestore";
import { collections, orderPath } from "@/lib/firebase/collections";
import { formatPayHereAmount, verifyPayHereNotification } from "@/lib/payments/payhere-server";
import type { Order } from "@/types/ecommerce";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const notification = readNotification(form);

  if (!notification.order_id || !notification.md5sig) {
    return NextResponse.json({ ok: false, message: "Invalid PayHere notification." }, { status: 400 });
  }

  const isVerified = verifyPayHereNotification({
    merchantId: notification.merchant_id,
    orderId: notification.order_id,
    amount: notification.payhere_amount,
    currency: notification.payhere_currency,
    statusCode: notification.status_code,
    md5sig: notification.md5sig,
  });

  if (!isVerified) {
    await recordPaymentFailure(notification, "Invalid PayHere signature.");
    return NextResponse.json({ ok: false, message: "Invalid PayHere signature." }, { status: 400 });
  }

  const orderSnapshot = await adminDoc(orderPath(notification.order_id)).get();

  if (!orderSnapshot.exists) {
    await recordPaymentFailure(notification, "Order was not found.");
    return NextResponse.json({ ok: false, message: "Order was not found." }, { status: 404 });
  }

  const order = { id: orderSnapshot.id, ...orderSnapshot.data() } as Order;
  const expectedAmount = formatPayHereAmount(order.total);
  const expectedCurrency = order.currency ?? process.env.PAYHERE_CURRENCY ?? "LKR";

  if (notification.payhere_amount !== expectedAmount || notification.payhere_currency !== expectedCurrency) {
    await recordPaymentFailure(notification, "PayHere amount or currency mismatch.");
    return NextResponse.json({ ok: false, message: "Payment amount mismatch." }, { status: 400 });
  }

  const isSuccessfulPayment = notification.status_code === "2";
  const paymentStatus = isSuccessfulPayment ? "paid" : "failed";
  const orderStatus = isSuccessfulPayment ? "paid" : order.status;

  await adminDoc(orderPath(notification.order_id)).update({
    status: orderStatus,
    paymentStatus,
    paymentMethod: "payhere",
    payment: {
      provider: "payhere",
      status: paymentStatus,
      amountTotal: order.total,
      currency: expectedCurrency,
      payherePaymentId: notification.payment_id,
      payhereStatusCode: notification.status_code,
      payhereMethod: notification.method,
      paidAt: isSuccessfulPayment ? FieldValue.serverTimestamp() : null,
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  await adminCollection(collections.payments).add({
    provider: "payhere",
    orderId: notification.order_id,
    paymentId: notification.payment_id,
    status: paymentStatus,
    statusCode: notification.status_code,
    amount: Number(notification.payhere_amount),
    currency: notification.payhere_currency,
    method: notification.method,
    raw: notification,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}

function readNotification(form: FormData) {
  return {
    merchant_id: readFormValue(form, "merchant_id"),
    order_id: readFormValue(form, "order_id"),
    payment_id: readFormValue(form, "payment_id"),
    payhere_amount: readFormValue(form, "payhere_amount"),
    payhere_currency: readFormValue(form, "payhere_currency"),
    status_code: readFormValue(form, "status_code"),
    md5sig: readFormValue(form, "md5sig"),
    method: readFormValue(form, "method"),
    status_message: readFormValue(form, "status_message"),
  };
}

function readFormValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

async function recordPaymentFailure(notification: ReturnType<typeof readNotification>, reason: string) {
  try {
    await adminCollection(collections.paymentFailures).add({
      provider: "payhere",
      orderId: notification.order_id,
      paymentId: notification.payment_id,
      reason,
      raw: notification,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Avoid retry storms from the payment gateway when diagnostics cannot be written.
  }
}
