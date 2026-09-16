"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { sampleSesamiPayload, parseSesamiPayload } from "@/lib/integrations/sesami";
import { applySesamiBooking, recordWebhook } from "@/lib/integrations/sync";
import { WebhookSource } from "@prisma/client";
import { syncBookingToSesami } from "@/lib/integrations/sesami";

export async function linkBookingAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") || "");
  const ownerId = String(formData.get("ownerId") || "") || null;
  const dogId = String(formData.get("dogId") || "") || null;
  await getPrisma().booking.update({
    where: { id: bookingId },
    data: { ownerId, dogId },
  });
  revalidatePath("/bokkanir");
  revalidatePath("/samthattingar");
}

export async function fireMockSesamiAction() {
  const payload = sampleSesamiPayload();
  const normalized = parseSesamiPayload(payload);
  await applySesamiBooking(normalized, payload);
  await recordWebhook({
    source: WebhookSource.SESAMI,
    topic: normalized.topic,
    shopDomain: normalized.shopDomain,
    payload,
    hmacValid: false,
    processed: true,
  });
  revalidatePath("/bokkanir");
  revalidatePath("/samthattingar");
  revalidatePath("/yfirlit");
}

export async function cancelBookingAction(bookingId: string) {
  const booking = await getPrisma().booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
  });
  if (booking.sesamiBookingId) {
    await syncBookingToSesami({
      sesamiBookingId: booking.sesamiBookingId,
      action: "cancel",
    });
  }
  revalidatePath("/bokkanir");
}
