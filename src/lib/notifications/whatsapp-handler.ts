import { sendOrderWhatsAppMessages } from "@/lib/notifications/whatsapp-server";
import type { WhatsAppNotificationPayload } from "@/types/notifications";

export async function handleOrderWhatsAppNotification(payload: WhatsAppNotificationPayload) {
  if (!payload.orderId || !payload.order?.shippingAddress) {
    throw new Error("Invalid WhatsApp order notification payload.");
  }

  return sendOrderWhatsAppMessages(payload);
}
