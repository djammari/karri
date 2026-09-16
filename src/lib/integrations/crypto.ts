import { createHmac, timingSafeEqual } from "crypto";

export function timingSafeMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function hmacSha256Base64(secret: string, payload: string | Buffer) {
  return createHmac("sha256", secret).update(payload).digest("base64");
}

export function hmacSha256Hex(secret: string, payload: string | Buffer) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export type HmacResult = {
  configured: boolean;
  valid: boolean;
};

/**
 * If no secret is configured the clinic still accepts the webhook (local/mock).
 * Production should set the secret; invalid signatures are then rejected.
 */
export function verifyOptionalHmac(opts: {
  secret: string | undefined;
  provided: string | null;
  expected: string;
}): HmacResult {
  const secret = opts.secret?.trim();
  if (!secret) {
    return { configured: false, valid: false };
  }
  if (!opts.provided) {
    return { configured: true, valid: false };
  }
  const provided = opts.provided.replace(/^sha256=/i, "").trim();
  return {
    configured: true,
    valid: timingSafeMatch(provided, opts.expected),
  };
}

export function integrationStatus() {
  return {
    shopify: {
      shop: process.env.SHOPIFY_SHOP_DOMAIN || "",
      apiKey: Boolean(process.env.SHOPIFY_API_KEY?.trim()),
      apiSecret: Boolean(process.env.SHOPIFY_API_SECRET?.trim()),
      webhookSecret: Boolean(
        process.env.SHOPIFY_WEBHOOK_SECRET?.trim() ||
          process.env.SHOPIFY_API_SECRET?.trim(),
      ),
    },
    sesami: {
      webhookSecret: Boolean(process.env.SESAMI_WEBHOOK_SECRET?.trim()),
      apiKey: Boolean(process.env.SESAMI_API_KEY?.trim()),
      apiBase: process.env.SESAMI_API_BASE || "https://api.sesami.co/v1",
    },
    resend: Boolean(process.env.RESEND_API_KEY?.trim()),
  };
}
