import { hmacSha256Base64, verifyOptionalHmac } from "@/lib/integrations/crypto";

export function shopifyWebhookSecret() {
  return (
    process.env.SHOPIFY_WEBHOOK_SECRET?.trim() ||
    process.env.SHOPIFY_API_SECRET?.trim()
  );
}

export function verifyShopifyHmac(rawBody: string, header: string | null) {
  const secret = shopifyWebhookSecret();
  const expected = secret ? hmacSha256Base64(secret, rawBody) : "";
  return verifyOptionalHmac({
    secret,
    provided: header,
    expected,
  });
}

export type ShopifyCustomerPayload = {
  id?: number | string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  default_address?: {
    phone?: string | null;
    address1?: string | null;
    zip?: string | null;
    city?: string | null;
  } | null;
};

export function shopifyCustomerName(customer: ShopifyCustomerPayload) {
  const name = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || customer.email || "Shopify viðskiptavinur";
}
