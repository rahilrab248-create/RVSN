import type { OrderStatus } from "@/types/ecommerce";

export function getOrderStatusWhatsAppMessage(status: OrderStatus) {
  const messages: Record<OrderStatus, string> = {
    pending: "Your RVSN order is waiting for approval. We will confirm it shortly.",
    approved: "Your RVSN order is confirmed. We are preparing your football gear now.",
    paid: "Your RVSN payment is confirmed. Your order is moving to fulfillment.",
    processing: "Your RVSN order is being packed and waiting for shipment.",
    shipped: "Your RVSN order is on the way. Your matchday gear is delivering now.",
    delivered: "Your RVSN order has been delivered. Thank you for shopping with us.",
    cancelled: "Your RVSN order has been cancelled. Please contact us if this looks wrong.",
  };

  return messages[status];
}

export function getAdminOrderPlacedWhatsAppMessage(orderNumber: string, customerName: string, total: number, currency?: string) {
  const formattedTotal = `${currency ?? "USD"} ${total.toFixed(2)}`;
  return `New RVSN order ${orderNumber} from ${customerName}. Total: ${formattedTotal}. Please review it in the admin dashboard.`;
}
