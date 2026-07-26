"use client";

import type { WhatsAppNotificationPayload, WhatsAppNotificationResult } from "@/types/notifications";

const notificationEndpoint = process.env.NEXT_PUBLIC_WHATSAPP_NOTIFICATION_ENDPOINT;

export async function sendOrderWhatsAppNotification(payload: WhatsAppNotificationPayload): Promise<WhatsAppNotificationResult> {
  if (!notificationEndpoint) {
    return {
      ok: true,
      skipped: true,
      message: "WhatsApp notification endpoint is not configured.",
    };
  }

  try {
    const response = await fetch(notificationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `WhatsApp notification failed with ${response.status}.`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "WhatsApp notification failed.",
    };
  }
}
