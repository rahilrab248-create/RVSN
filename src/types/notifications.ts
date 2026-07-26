import type { Order, OrderStatus } from "@/types/ecommerce";

export type WhatsAppNotificationEvent = "order_placed" | "order_status_changed";

export type WhatsAppNotificationPayload = {
  event: WhatsAppNotificationEvent;
  orderId: string;
  order: Pick<Order, "orderNumber" | "items" | "shippingAddress" | "total" | "currency" | "paymentMethod" | "paymentStatus" | "status">;
  previousStatus?: OrderStatus;
  nextStatus?: OrderStatus;
};

export type WhatsAppNotificationResult = {
  ok: boolean;
  skipped?: boolean;
  message?: string;
};
