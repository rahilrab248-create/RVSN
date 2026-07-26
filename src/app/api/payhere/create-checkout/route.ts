import { NextResponse, type NextRequest } from "next/server";
import { createPayHereCheckoutSession } from "@/lib/payments/payhere-server";
import type { PayHereCheckoutInput } from "@/types/payhere";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const originGuard = validateOrigin(request);

  if (originGuard) {
    return originGuard;
  }

  let payload: PayHereCheckoutInput;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid PayHere checkout payload." }, { status: 400 });
  }

  if (!payload.orderId || !payload.orderNumber || !payload.amount || !payload.currency || !payload.customer?.email) {
    return NextResponse.json({ ok: false, message: "Missing PayHere checkout details." }, { status: 400 });
  }

  try {
    const session = createPayHereCheckoutSession(payload);
    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create PayHere checkout.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

function validateOrigin(request: NextRequest) {
  const allowedOrigins = process.env.PAYHERE_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!allowedOrigins?.length) {
    return null;
  }

  const origin = request.headers.get("origin");

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ ok: false, message: "Unauthorized payment origin." }, { status: 403 });
  }

  return null;
}
