"use client";

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
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
import type { Order, OrderInput, OrderStatus } from "@/types/ecommerce";

export async function getUserOrders(userId: string): Promise<Order[]> {
  const snapshot = await getDocs(
    query(ordersCollectionRef(), where("userId", "==", userId)),
  );
  return sortOrders(snapshot.docs.map((item) => item.data()));
}

export async function getOrders(): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCollectionRef()));
  return sortOrders(snapshot.docs.map((item) => item.data()));
}

export function subscribeToUserOrders(userId: string, onNext: (orders: Order[]) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(
    query(ordersCollectionRef(), where("userId", "==", userId)),
    (snapshot) => {
      onNext(sortOrders(snapshot.docs.map((item) => item.data())));
    },
    onError,
  );
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
  return addDoc(ordersCollectionRef(), {
    ...data,
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

  return updateDoc(doc(db, orderPath(orderId)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function sortOrders(orders: Order[]) {
  return orders.slice().sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
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
