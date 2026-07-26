"use client";

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { orderPath } from "@/lib/firebase/collections";
import { orderConverter } from "@/lib/firebase/converters";
import { ordersCollectionRef } from "@/lib/firebase/shared-refs";
import type { Order, OrderFulfillmentUpdate, OrderInput, OrderStatus, PaymentStatus } from "@/types/ecommerce";

export async function getUserOrders(userId: string): Promise<Order[]> {
  const count = 25;
  const snapshot = await getDocs(
    query(ordersCollectionRef(), where("userId", "==", userId), limit(count)),
  );
  return sortOrders(snapshot.docs.map((item) => item.data()));
}

export function subscribeUserOrders(
  userId: string,
  onNext: (orders: Order[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const count = 25;
  return onSnapshot(
    query(ordersCollectionRef(), where("userId", "==", userId), limit(count)),
    (snapshot) => onNext(sortOrders(snapshot.docs.map((item) => item.data()))),
    (error) => onError?.(error),
  );
}

export async function getOrders(): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCollectionRef(), orderBy("createdAt", "desc"), limit(50)));
  return sortOrders(snapshot.docs.map((item) => item.data()));
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const snapshot = await getDoc(doc(db, orderPath(orderId)).withConverter(orderConverter));
  return snapshot.exists() ? snapshot.data() : null;
}

export function createOrder(data: OrderInput) {
  const paymentMethod = data.paymentMethod ?? data.payment?.provider ?? "cash_on_delivery";
  const paymentStatus = data.paymentStatus ?? data.payment?.status ?? (paymentMethod === "cash_on_delivery" ? "unpaid" : "paid");
  const currency = data.currency ?? data.payment?.currency ?? null;

  return addDoc(ordersCollectionRef(), {
    ...data,
    orderNumber: data.orderNumber ?? createOrderNumber(),
    paymentMethod,
    paymentStatus,
    payment: data.payment ?? {
      provider: paymentMethod,
      status: paymentStatus,
      amountTotal: data.total,
      currency,
      stripeSessionId: null,
      stripePaymentIntentId: null,
    },
    status: data.status ?? "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const timestampUpdates = getOrderStatusTimestampUpdates(status);

  return updateDoc(doc(db, orderPath(orderId)), {
    status,
    ...timestampUpdates,
    updatedAt: serverTimestamp(),
  });
}

export function updateOrderFulfillment(orderId: string, data: OrderFulfillmentUpdate) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const timestampUpdates = data.status ? getOrderStatusTimestampUpdates(data.status) : {};

  return updateDoc(doc(db, orderPath(orderId)), {
    ...data,
    ...timestampUpdates,
    updatedAt: serverTimestamp(),
  });
}

export function updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  const db = getFirebaseDb();

  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const paidAt = paymentStatus === "paid" ? serverTimestamp() : null;

  return updateDoc(doc(db, orderPath(orderId)), {
    paymentStatus,
    paidAt,
    "payment.status": paymentStatus,
    "payment.paidAt": paidAt,
    updatedAt: serverTimestamp(),
  });
}

function getOrderStatusTimestampUpdates(status: OrderStatus) {
  if (status === "shipped") {
    return { shippedAt: serverTimestamp() };
  }

  if (status === "delivered") {
    return { deliveredAt: serverTimestamp() };
  }

  return {};
}

function sortOrders(orders: Order[]) {
  return orders.slice().sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
}

function createOrderNumber() {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `RVSN-${datePart}-${randomPart}`;
}

function timestampMillis(value: Timestamp | Date | undefined) {
  if (!value) {
    return 0;
  }

  if ("toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return value instanceof Date ? value.getTime() : 0;
}
