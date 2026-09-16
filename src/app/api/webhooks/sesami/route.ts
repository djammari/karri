import { NextRequest, NextResponse } from "next/server";
import { Prisma, WebhookSource } from "@prisma/client";
import { parseSesamiPayload, verifySesamiHmac } from "@/lib/integrations/sesami";
import { applySesamiBooking, recordWebhook } from "@/lib/integrations/sync";
import { appUrl } from "@/lib/env";

export async function GET() {
  const base = appUrl();
  return NextResponse.json({
    ok: true,
    message: "Sesami webhook er tilbúinn.",
    webhook_url: `${base}/api/webhooks/sesami`,
    supported_events: [
      "appointment.created",
      "appointment.updated",
      "appointment.cancelled",
      "booking.created",
      "booking.updated",
      "booking.cancelled",
    ],
    secretConfigured: Boolean(process.env.SESAMI_WEBHOOK_SECRET?.trim()),
  });
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature =
    request.headers.get("x-sesami-signature") ||
    request.headers.get("x-sesami-hmac-sha256");
  const hmac = verifySesamiHmac(raw, signature);

  if (hmac.configured && !hmac.valid) {
    await recordWebhook({
      source: WebhookSource.SESAMI,
      topic: "invalid-hmac",
      payload: { raw: raw.slice(0, 2000) },
      hmacValid: false,
      processed: false,
      error: "Ógild undirskrift",
    });
    return NextResponse.json({ error: "Ógild undirskrift" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ error: "Ógild JSON" }, { status: 400 });
  }

  try {
    const normalized = parseSesamiPayload(body);
    await applySesamiBooking(normalized, body as Prisma.InputJsonValue);
    await recordWebhook({
      source: WebhookSource.SESAMI,
      topic: normalized.topic,
      shopDomain: normalized.shopDomain,
      payload: body as Prisma.InputJsonValue,
      hmacValid: hmac.valid,
      processed: true,
    });
    return NextResponse.json({
      ok: true,
      event: normalized.event,
      bookingId: normalized.booking.id,
      hmacValid: hmac.valid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Villa";
    await recordWebhook({
      source: WebhookSource.SESAMI,
      topic: "parse-error",
      payload: body as Prisma.InputJsonValue,
      hmacValid: hmac.valid,
      processed: false,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
