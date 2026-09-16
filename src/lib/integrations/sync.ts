import { BookingSource, Prisma, WebhookSource } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { NormalizedSesamiBooking } from "@/lib/integrations/sesami";
import {
  shopifyCustomerName,
  type ShopifyCustomerPayload,
} from "@/lib/integrations/shopify";

export async function matchOwner(opts: {
  email?: string | null;
  phone?: string | null;
  shopifyCustomerId?: string | null;
}) {
  const db = getPrisma();
  if (opts.shopifyCustomerId) {
    const byShopify = await db.owner.findUnique({
      where: { shopifyCustomerId: opts.shopifyCustomerId },
    });
    if (byShopify) return byShopify;
  }
  if (opts.email) {
    const byEmail = await db.owner.findFirst({
      where: { email: { equals: opts.email, mode: "insensitive" } },
    });
    if (byEmail) {
      if (opts.shopifyCustomerId && !byEmail.shopifyCustomerId) {
        return db.owner.update({
          where: { id: byEmail.id },
          data: { shopifyCustomerId: opts.shopifyCustomerId },
        });
      }
      return byEmail;
    }
  }
  if (opts.phone) {
    const digits = opts.phone.replace(/\D/g, "");
    if (digits.length >= 7) {
      const owners = await db.owner.findMany();
      return (
        owners.find((owner) => owner.phone.replace(/\D/g, "").endsWith(digits)) ??
        null
      );
    }
  }
  return null;
}

export async function upsertOwnerFromShopify(customer: ShopifyCustomerPayload) {
  const db = getPrisma();
  const shopifyCustomerId = customer.id ? String(customer.id) : undefined;
  const email = customer.email || undefined;
  const phone =
    customer.phone || customer.default_address?.phone || undefined;
  const existing = await matchOwner({ email, phone, shopifyCustomerId });
  const data = {
    name: shopifyCustomerName(customer),
    email: email ?? existing?.email,
    phone: phone || existing?.phone || "óskráð",
    address: customer.default_address?.address1,
    postalCode: customer.default_address?.zip,
    city: customer.default_address?.city,
    shopifyCustomerId: shopifyCustomerId ?? existing?.shopifyCustomerId,
  };

  if (existing) {
    return db.owner.update({
      where: { id: existing.id },
      data,
    });
  }

  return db.owner.create({ data });
}

export async function applySesamiBooking(
  payload: NormalizedSesamiBooking,
  raw: Prisma.InputJsonValue,
) {
  const db = getPrisma();
  const owner = await matchOwner({
    email: payload.customer.email,
    phone: payload.customer.phone,
    shopifyCustomerId: payload.customer.shopifyCustomerId,
  });

  const dogs = owner
    ? await db.dog.findMany({ where: { ownerId: owner.id } })
    : [];
  const dogId = dogs.length === 1 ? dogs[0].id : null;

  const shared = {
    shopifyCustomerId: payload.customer.shopifyCustomerId,
    ownerId: owner?.id,
    dogId,
    customerName: payload.customer.name,
    customerEmail: payload.customer.email,
    customerPhone: payload.customer.phone,
    serviceId: payload.booking.serviceId,
    serviceName: payload.booking.serviceName,
    resourceId: payload.booking.resourceId,
    resourceName: payload.booking.resourceName,
    startsAt: payload.booking.startsAt,
    endsAt: payload.booking.endsAt,
    timeZone: payload.booking.timeZone || "Atlantic/Reykjavik",
    status: payload.event === "cancelled" ? "cancelled" : payload.booking.status,
    notes: payload.notes,
    tags: payload.tags,
    source: BookingSource.SESAMI,
    rawPayload: raw,
  };

  const existing = await db.booking.findUnique({
    where: { sesamiBookingId: payload.booking.id },
  });

  if (payload.event === "cancelled" && existing) {
    return db.booking.update({
      where: { id: existing.id },
      data: { status: "cancelled", rawPayload: raw },
    });
  }

  if (existing) {
    return db.booking.update({
      where: { id: existing.id },
      data: shared,
    });
  }

  return db.booking.create({
    data: {
      sesamiBookingId: payload.booking.id,
      ...shared,
    },
  });
}

export async function recordWebhook(opts: {
  source: WebhookSource;
  topic: string;
  shopDomain?: string | null;
  payload: Prisma.InputJsonValue;
  hmacValid: boolean;
  processed: boolean;
  error?: string;
}) {
  return getPrisma().webhookEvent.create({
    data: {
      source: opts.source,
      topic: opts.topic,
      shopDomain: opts.shopDomain ?? undefined,
      payload: opts.payload,
      hmacValid: opts.hmacValid,
      processed: opts.processed,
      error: opts.error,
    },
  });
}
