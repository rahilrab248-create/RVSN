import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import Stripe from "stripe";

initializeApp();

const db = getFirestore();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const appUrl = defineString("APP_URL", { default: "http://localhost:3000" });
const adminNotificationEmail = defineString("ADMIN_NOTIFICATION_EMAIL", { default: "" });
const currency = defineString("STRIPE_CURRENCY", { default: "usd" });

type CheckoutItem = {
  productId: string;
  title: string;
  image: string;
  brand: string;
  size: string;
  quantity: number;
  price: number;
};

type ShippingAddress = {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

type CheckoutPayload = {
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string | null;
};

type ProductDocument = {
  title?: string;
  brand?: string;
  images?: string[];
  price?: number;
  sizes?: string[];
  stock?: number;
};

function getStripe() {
  return new Stripe(stripeSecretKey.value());
}

function assertString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }

  return value.trim();
}

function normalizeItem(item: Partial<CheckoutItem>): CheckoutItem {
  const quantity = Number(item.quantity);
  const price = Number(item.price);

  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 25) {
    throw new HttpsError("invalid-argument", "Cart contains an invalid quantity.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new HttpsError("invalid-argument", "Cart contains an invalid price.");
  }

  return {
    productId: assertString(item.productId, "Product id"),
    title: assertString(item.title, "Product title"),
    image: typeof item.image === "string" ? item.image : "",
    brand: assertString(item.brand, "Product brand"),
    size: assertString(item.size, "Product size"),
    quantity: Math.round(quantity),
    price: Math.round(price),
  };
}

function normalizePayload(data: unknown): CheckoutPayload {
  const payload = data as Partial<CheckoutPayload>;
  const items = Array.isArray(payload.items) ? payload.items.map(normalizeItem) : [];

  if (!items.length) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }

  const shippingAddress = payload.shippingAddress as Partial<ShippingAddress> | undefined;

  if (!shippingAddress) {
    throw new HttpsError("invalid-argument", "Shipping address is required.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = Math.max(0, Math.round(Number(payload.shipping) || 0));
  const discount = Math.max(0, Math.round(Number(payload.discount) || 0));
  const total = Math.max(0, subtotal + shipping - discount);

  return {
    items,
    shippingAddress: {
      name: assertString(shippingAddress.name, "Full name"),
      email: assertString(shippingAddress.email, "Email"),
      phone: typeof shippingAddress.phone === "string" ? shippingAddress.phone.trim() : "",
      line1: assertString(shippingAddress.line1, "Street address"),
      line2: typeof shippingAddress.line2 === "string" ? shippingAddress.line2.trim() : "",
      city: assertString(shippingAddress.city, "City"),
      state: typeof shippingAddress.state === "string" ? shippingAddress.state.trim() : "",
      postalCode: typeof shippingAddress.postalCode === "string" ? shippingAddress.postalCode.trim() : "",
      country: assertString(shippingAddress.country, "Country"),
    },
    subtotal,
    shipping,
    discount: Math.min(discount, subtotal + shipping),
    total,
    couponCode: typeof payload.couponCode === "string" ? payload.couponCode.trim().toUpperCase() : null,
  };
}

async function verifyCheckoutPayload(payload: CheckoutPayload): Promise<CheckoutPayload> {
  const productRefs = payload.items.map((item) => db.collection("products").doc(item.productId));
  const productSnapshots = await db.getAll(...productRefs);

  const verifiedItems = payload.items.map((item, index) => {
    const snapshot = productSnapshots[index];

    if (!snapshot.exists) {
      throw new HttpsError("failed-precondition", `Product ${item.productId} is not available.`);
    }

    const product = snapshot.data() as ProductDocument;
    const price = Number(product.price);

    if (!Number.isFinite(price) || price <= 0) {
      throw new HttpsError("failed-precondition", `Product ${item.productId} has invalid pricing.`);
    }

    if (Array.isArray(product.sizes) && product.sizes.length && !product.sizes.includes(item.size)) {
      throw new HttpsError("failed-precondition", `${product.title ?? item.title} is not available in size ${item.size}.`);
    }

    if (typeof product.stock === "number" && product.stock < item.quantity) {
      throw new HttpsError("failed-precondition", `${product.title ?? item.title} does not have enough stock.`);
    }

    return {
      ...item,
      title: product.title ?? item.title,
      brand: product.brand ?? item.brand,
      image: product.images?.[0] ?? item.image,
      price: Math.round(price),
    };
  });

  const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.min(payload.discount, subtotal + payload.shipping);

  return {
    ...payload,
    items: verifiedItems,
    subtotal,
    discount,
    total: Math.max(0, subtotal + payload.shipping - discount),
  };
}

export const createStripeCheckoutSession = onCall(
  {
    region: "us-central1",
    secrets: [stripeSecretKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in to pay online.");
    }

    const payload = await verifyCheckoutPayload(normalizePayload(request.data));
    const checkoutRef = db.collection("checkoutSessions").doc();

    await checkoutRef.set({
      userId: request.auth.uid,
      status: "pending",
      provider: "stripe",
      paymentStatus: "unpaid",
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const stripe = getStripe();
    const sessionCurrency = currency.value();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = payload.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: sessionCurrency,
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: `${item.title} / ${item.size}`,
          description: item.brand,
          images: item.image.startsWith("http") ? [item.image] : undefined,
          metadata: {
            productId: item.productId,
            size: item.size,
          },
        },
      },
    }));

    if (payload.shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: sessionCurrency,
          unit_amount: Math.round(payload.shipping * 100),
          product_data: {
            name: "Express shipping",
            description: "Tracked football kit delivery",
          },
        },
      });
    }

    const stripeCoupon =
      payload.discount > 0
        ? await stripe.coupons.create({
            amount_off: Math.round(payload.discount * 100),
            currency: sessionCurrency,
            duration: "once",
            name: payload.couponCode ? `Fooltball ${payload.couponCode}` : "Fooltball checkout discount",
            metadata: {
              checkoutId: checkoutRef.id,
            },
          })
        : null;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: checkoutRef.id,
      customer_email: payload.shippingAddress.email,
      line_items: lineItems,
      discounts: stripeCoupon ? [{ coupon: stripeCoupon.id }] : undefined,
      success_url: `${appUrl.value()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl.value()}/checkout?payment=cancelled`,
      metadata: {
        checkoutId: checkoutRef.id,
        userId: request.auth.uid,
        couponCode: payload.couponCode ?? "",
        discount: String(payload.discount),
      },
    });

    await checkoutRef.update({
      stripeSessionId: session.id,
      stripeSessionUrl: session.url,
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (!session.url) {
      throw new HttpsError("internal", "Stripe did not return a checkout URL.");
    }

    return {
      checkoutId: checkoutRef.id,
      sessionId: session.id,
      url: session.url,
    };
  },
);

export const stripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const signature = req.header("stripe-signature");

    if (!signature) {
      res.status(400).send("Missing Stripe signature");
      return;
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value());
    } catch (error) {
      logger.error("Stripe webhook verification failed", error);
      res.status(400).send("Invalid webhook signature");
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      }

      if (event.type === "payment_intent.payment_failed") {
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error("Stripe webhook handling failed", error);
      res.status(500).send("Webhook handler failed");
    }
  },
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const checkoutId = session.metadata?.checkoutId ?? session.client_reference_id;

  if (!checkoutId) {
    logger.warn("Checkout session completed without checkoutId", { sessionId: session.id });
    return;
  }

  const checkoutRef = db.collection("checkoutSessions").doc(checkoutId);
  const checkoutSnapshot = await checkoutRef.get();

  if (!checkoutSnapshot.exists) {
    logger.warn("Checkout session has no Firestore draft", { checkoutId, sessionId: session.id });
    return;
  }

  const checkout = checkoutSnapshot.data() as CheckoutPayload & {
    userId: string;
    orderId?: string;
    status?: string;
  };

  if (checkout.orderId) {
    logger.info("Checkout already has an order", { checkoutId, orderId: checkout.orderId });
    return;
  }

  const orderRef = db.collection("orders").doc();
  const paymentRef = db.collection("payments").doc(session.id);
  const notificationRef = db.collection("adminNotifications").doc();
  const paidAt = Timestamp.now();

  await db.runTransaction(async (transaction) => {
    transaction.set(orderRef, {
      userId: checkout.userId,
      items: checkout.items,
      status: "paid",
      subtotal: checkout.subtotal,
      shipping: checkout.shipping,
      discount: checkout.discount,
      total: checkout.total,
      shippingAddress: checkout.shippingAddress,
      payment: {
        provider: "stripe",
        status: session.payment_status,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
        amountTotal: (session.amount_total ?? 0) / 100,
        currency: session.currency,
        paidAt,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    transaction.set(paymentRef, {
      orderId: orderRef.id,
      checkoutId,
      userId: checkout.userId,
      provider: "stripe",
      status: session.payment_status,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      amountSubtotal: (session.amount_subtotal ?? 0) / 100,
      amountTotal: (session.amount_total ?? 0) / 100,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? checkout.shippingAddress.email,
      rawEventType: "checkout.session.completed",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    transaction.set(notificationRef, {
      type: "payment_success",
      title: "New Stripe payment received",
      message: `Order ${orderRef.id} was paid successfully.`,
      orderId: orderRef.id,
      checkoutId,
      paymentId: paymentRef.id,
      amount: checkout.total,
      currency: session.currency ?? currency.value(),
      recipientEmail: adminNotificationEmail.value(),
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    transaction.update(checkoutRef, {
      status: "completed",
      paymentStatus: session.payment_status,
      orderId: orderRef.id,
      paymentId: paymentRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const checkoutId = paymentIntent.metadata?.checkoutId;

  await db.collection("paymentFailures").add({
    checkoutId: checkoutId ?? null,
    stripePaymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    lastPaymentError: paymentIntent.last_payment_error?.message ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  if (checkoutId) {
    await db.collection("checkoutSessions").doc(checkoutId).set(
      {
        status: "failed",
        paymentStatus: paymentIntent.status,
        lastPaymentError: paymentIntent.last_payment_error?.message ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}
