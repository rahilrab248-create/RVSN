import {
  getAdminOrderPlacedWhatsAppMessage,
  getOrderStatusWhatsAppMessage,
} from "@/lib/notifications/order-whatsapp-messages";
import type { WhatsAppNotificationPayload } from "@/types/notifications";

type WhatsAppTextMessageInput = {
  to: string;
  body: string;
};

const graphApiVersion = "v21.0";

export async function sendWhatsAppTextMessage({ to, body }: WhatsAppTextMessageInput) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return {
      ok: true,
      skipped: true,
      message: "WhatsApp Cloud API credentials are not configured.",
    };
  }

  const response = await fetch(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizeWhatsAppPhone(to),
      type: "text",
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp Cloud API failed: ${response.status} ${errorText}`);
  }

  return { ok: true };
}

export async function sendOrderWhatsAppMessages(payload: WhatsAppNotificationPayload) {
  const orderNumber = payload.order.orderNumber ?? payload.orderId;
  const customerName = payload.order.shippingAddress.name;
  const customerPhone = payload.order.shippingAddress.phone;
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE_NUMBER;
  const results = [];

  if (payload.event === "order_placed" && adminPhone) {
    results.push(
      await sendWhatsAppTextMessage({
        to: adminPhone,
        body: getAdminOrderPlacedWhatsAppMessage(orderNumber, customerName, payload.order.total, payload.order.currency),
      }),
    );
  }

  if (customerPhone) {
    const status = payload.nextStatus ?? payload.order.status;
    results.push(
      await sendWhatsAppTextMessage({
        to: customerPhone,
        body: getOrderStatusWhatsAppMessage(status),
      }),
    );
  }

  if (!results.length) {
    return {
      ok: true,
      skipped: true,
      message: "No WhatsApp recipient phone numbers were available.",
    };
  }

  return {
    ok: results.every((result) => result.ok),
    results,
  };
}

function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}
