import { NextRequest, NextResponse } from "next/server";
import { Prisma, WebhookSource } from "@prisma/client";
import { verifyShopifyHmac } from "@/lib/integrations/shopify";
import {
  recordWebhook,
  upsertOwnerFromShopify,
} from "@/lib/integrations/sync";
import { appUrl } from "@/lib/env";

export async function GET() {
  const base = appUrl();
  return NextResponse.json({
    ok: true,
    message: "Shopify webhook er tilbúinn.",
    webhook_url: `${base}/api/webhooks/shopify`,
    topics: ["customers/create", "customers/update", "orders/create"],
    secretConfigured: Boolean(
      process.env.SHOPIFY_WEBHOOK_SECRET?.trim() ||
        process.env.SHOPIFY_API_SECRET?.trim(),
    ),
  });
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic") || "unknown";
  const shop = request.headers.get("x-shopify-shop-domain");
  const hmac = verifyShopifyHmac(raw, hmacHeader);

  if (hmac.configured && !hmac.valid) {
    await recordWebhook({
      source: WebhookSource.SHOPIFY,
      topic,
      shopDomain: shop,
      payload: { raw: raw.slice(0, 2000) },
      hmacValid: false,
      processed: false,
      error: "Ógild HMAC",
    });
    return NextResponse.json({ error: "Ógild HMAC" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ error: "Ógild JSON" }, { status: 400 });
  }

  try {
    if (topic.startsWith("customers/")) {
      await upsertOwnerFromShopify(
        body as {
          id?: number | string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
        },
      );
    }
    await recordWebhook({
      source: WebhookSource.SHOPIFY,
      topic,
      shopDomain: shop,
      payload: body as Prisma.InputJsonValue,
      hmacValid: hmac.valid,
      processed: true,
    });
    return NextResponse.json({ ok: true, topic, hmacValid: hmac.valid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Villa";
    await recordWebhook({
      source: WebhookSource.SHOPIFY,
      topic,
      shopDomain: shop,
      payload: body as Prisma.InputJsonValue,
      hmacValid: hmac.valid,
      processed: false,
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
