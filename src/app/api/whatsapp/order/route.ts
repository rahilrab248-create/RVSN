import { NextResponse, type NextRequest } from "next/server";
import { handleOrderWhatsAppNotification } from "@/lib/notifications/whatsapp-handler";
import type { WhatsAppNotificationPayload } from "@/types/notifications";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const originGuard = validateOrigin(request);

  if (originGuard) {
    return originGuard;
  }

  const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const requestSecret = request.headers.get("x-rvsn-webhook-secret");

  if (webhookSecret && requestSecret !== webhookSecret) {
    return NextResponse.json({ ok: false, message: "Unauthorized WhatsApp notification request." }, { status: 401 });
  }

  let payload: WhatsAppNotificationPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const result = await handleOrderWhatsAppNotification(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send WhatsApp notification.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

function validateOrigin(request: NextRequest) {
  const allowedOrigins = process.env.WHATSAPP_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!allowedOrigins?.length) {
    return null;
  }

  const origin = request.headers.get("origin");

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ ok: false, message: "Unauthorized notification origin." }, { status: 403 });
  }

  return null;
}
