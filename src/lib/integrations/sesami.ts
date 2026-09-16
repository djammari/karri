import { z } from "zod";
import { hmacSha256Hex, verifyOptionalHmac } from "@/lib/integrations/crypto";

const sesamiLiveSchema = z.object({
  event: z.string(),
  sent_at: z.string().optional(),
  booking: z.object({
    id: z.string(),
    status: z.string(),
    service_id: z.string().optional(),
    service_title: z.string(),
    starts_at: z.string(),
    ends_at: z.string(),
    time_zone: z.string().optional(),
    resource_id: z.string().optional(),
    resource_name: z.string().optional(),
  }),
  customer: z.object({
    shopify_customer_id: z.union([z.string(), z.number()]).optional(),
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  metadata: z
    .object({
      notes: z.string().optional(),
      tags: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
  shop: z
    .object({
      domain: z.string().optional(),
    })
    .optional(),
});

const sesamiDocsSchema = z.object({
  event_type: z.string(),
  booking: z.object({
    id: z.string(),
    customer: z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
    service: z.object({
      name: z.string(),
      duration: z.number().optional(),
      staff_member: z.string().optional(),
    }),
    appointment_time: z.string(),
    status: z.string().optional(),
    notes: z.string().optional(),
  }),
  shop: z
    .object({
      domain: z.string().optional(),
    })
    .optional(),
  timestamp: z.string().optional(),
});

export type NormalizedSesamiBooking = {
  event: "created" | "updated" | "cancelled" | "unknown";
  topic: string;
  shopDomain?: string;
  booking: {
    id: string;
    status: string;
    serviceId?: string;
    serviceName: string;
    startsAt: Date;
    endsAt: Date;
    timeZone?: string;
    resourceId?: string;
    resourceName?: string;
  };
  customer: {
    shopifyCustomerId?: string;
    name: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  tags?: string;
};

function classifyEvent(raw: string): NormalizedSesamiBooking["event"] {
  const value = raw.toLowerCase();
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("update")) return "updated";
  if (value.includes("create")) return "created";
  return "unknown";
}

export function parseSesamiPayload(body: unknown): NormalizedSesamiBooking {
  const live = sesamiLiveSchema.safeParse(body);
  if (live.success) {
    const data = live.data;
    return {
      event: classifyEvent(data.event),
      topic: data.event,
      shopDomain: data.shop?.domain,
      booking: {
        id: data.booking.id,
        status: data.booking.status,
        serviceId: data.booking.service_id,
        serviceName: data.booking.service_title,
        startsAt: new Date(data.booking.starts_at),
        endsAt: new Date(data.booking.ends_at),
        timeZone: data.booking.time_zone,
        resourceId: data.booking.resource_id,
        resourceName: data.booking.resource_name,
      },
      customer: {
        shopifyCustomerId: data.customer.shopify_customer_id
          ? String(data.customer.shopify_customer_id)
          : undefined,
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
      },
      notes: data.metadata?.notes,
      tags: data.metadata?.tags,
    };
  }

  const docs = sesamiDocsSchema.safeParse(body);
  if (docs.success) {
    const data = docs.data;
    const start = new Date(data.booking.appointment_time);
    const duration = data.booking.service.duration ?? 60;
    const end = new Date(start.getTime() + duration * 60 * 1000);
    return {
      event: classifyEvent(data.event_type),
      topic: data.event_type,
      shopDomain: data.shop?.domain,
      booking: {
        id: data.booking.id,
        status: data.booking.status || "confirmed",
        serviceName: data.booking.service.name,
        startsAt: start,
        endsAt: end,
        resourceName: data.booking.service.staff_member,
      },
      customer: {
        name: data.booking.customer.name,
        email: data.booking.customer.email,
        phone: data.booking.customer.phone,
      },
      notes: data.booking.notes,
    };
  }

  throw new Error("Óþekkt Sesami webhook snið");
}

export function verifySesamiHmac(rawBody: string, header: string | null) {
  const secret = process.env.SESAMI_WEBHOOK_SECRET?.trim();
  const expected = secret ? hmacSha256Hex(secret, rawBody) : "";
  return verifyOptionalHmac({
    secret,
    provided: header,
    expected,
  });
}

export function sampleSesamiPayload() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(13, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    event: "appointment.created",
    sent_at: new Date().toISOString(),
    booking: {
      id: `sesami_demo_${Date.now()}`,
      status: "confirmed",
      service_id: "sjukrathjalfun-1klst",
      service_title: "Sjúkraþjálfun — 1 klukkustund",
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      time_zone: "Atlantic/Reykjavik",
      resource_id: "gardatorg-3",
      resource_name: "Óstöðvandi, Garðatorg 3",
    },
    customer: {
      shopify_customer_id: "demo-shopify-1",
      name: "Sigrún Ólafsdóttir",
      email: "sigrun.olafsdottir@example.is",
      phone: "771-0000",
    },
    metadata: {
      notes: "Hundurinn Freyr, border collie. Endurhæfing eftir krossband.",
      tags: "sjukrathjalfun,endurhaefing",
      source: "sesami",
    },
    shop: {
      domain: process.env.SHOPIFY_SHOP_DOMAIN || "ostodvandi.myshopify.com",
    },
  };
}

export async function syncBookingToSesami(opts: {
  sesamiBookingId: string;
  action: "update" | "cancel";
  status?: string;
  startsAt?: Date;
  endsAt?: Date;
}) {
  const apiKey = process.env.SESAMI_API_KEY?.trim();
  const base = process.env.SESAMI_API_BASE || "https://api.sesami.co/v1";
  if (!apiKey) {
    return {
      skipped: true,
      reason: "SESAMI_API_KEY vantar — engin útsending til Sesami.",
    };
  }

  const method = opts.action === "cancel" ? "DELETE" : "PATCH";
  const response = await fetch(`${base}/bookings/${opts.sesamiBookingId}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body:
      opts.action === "cancel"
        ? undefined
        : JSON.stringify({
            status: opts.status,
            starts_at: opts.startsAt?.toISOString(),
            ends_at: opts.endsAt?.toISOString(),
          }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sesami API ${response.status}: ${text.slice(0, 400)}`);
  }

  return { skipped: false };
}
