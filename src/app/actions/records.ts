"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  return value || null;
}

export async function createOwnerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name || !phone) {
    throw new Error("Nafn og sími eiganda eru nauðsynleg.");
  }
  const owner = await getPrisma().owner.create({
    data: {
      name,
      phone,
      kennitala: text(formData, "kennitala"),
      email: text(formData, "email"),
      address: text(formData, "address"),
      postalCode: text(formData, "postalCode"),
      city: text(formData, "city"),
      notes: text(formData, "notes"),
    },
  });
  revalidatePath("/vidskiptavinir");
  redirect(`/vidskiptavinir/${owner.id}`);
}

export async function updateOwnerAction(ownerId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name || !phone) {
    throw new Error("Nafn og sími eiganda eru nauðsynleg.");
  }
  await getPrisma().owner.update({
    where: { id: ownerId },
    data: {
      name,
      phone,
      kennitala: text(formData, "kennitala"),
      email: text(formData, "email"),
      address: text(formData, "address"),
      postalCode: text(formData, "postalCode"),
      city: text(formData, "city"),
      notes: text(formData, "notes"),
    },
  });
  revalidatePath(`/vidskiptavinir/${ownerId}`);
  revalidatePath("/vidskiptavinir");
}

export async function createDogAction(formData: FormData) {
  const ownerId = String(formData.get("ownerId") || "");
  const name = String(formData.get("name") || "").trim();
  const breed = String(formData.get("breed") || "").trim();
  if (!ownerId || !name || !breed) {
    throw new Error("Eigandi, nafn hunds og kynþáttur eru nauðsynleg.");
  }
  const birth = String(formData.get("birthDate") || "");
  const weight = String(formData.get("weightKg") || "");
  const dog = await getPrisma().dog.create({
    data: {
      ownerId,
      name,
      breed,
      sex: (String(formData.get("sex") || "UNKNOWN") as "MALE" | "FEMALE" | "UNKNOWN"),
      birthDate: birth ? new Date(birth) : null,
      weightKg: weight ? Number(weight) : null,
      color: text(formData, "color"),
      chipNumber: text(formData, "chipNumber"),
      insurance: text(formData, "insurance"),
      vetName: text(formData, "vetName"),
      vetPhone: text(formData, "vetPhone"),
      activity: text(formData, "activity"),
      diagnoses: text(formData, "diagnoses"),
      medications: text(formData, "medications"),
      allergies: text(formData, "allergies"),
      notes: text(formData, "notes"),
    },
  });
  revalidatePath("/hundar");
  revalidatePath(`/vidskiptavinir/${ownerId}`);
  redirect(`/hundar/${dog.id}`);
}

export async function updateDogAction(dogId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const breed = String(formData.get("breed") || "").trim();
  const birth = String(formData.get("birthDate") || "");
  const weight = String(formData.get("weightKg") || "");
  await getPrisma().dog.update({
    where: { id: dogId },
    data: {
      name,
      breed,
      sex: (String(formData.get("sex") || "UNKNOWN") as "MALE" | "FEMALE" | "UNKNOWN"),
      birthDate: birth ? new Date(birth) : null,
      weightKg: weight ? Number(weight) : null,
      color: text(formData, "color"),
      chipNumber: text(formData, "chipNumber"),
      insurance: text(formData, "insurance"),
      vetName: text(formData, "vetName"),
      vetPhone: text(formData, "vetPhone"),
      activity: text(formData, "activity"),
      diagnoses: text(formData, "diagnoses"),
      medications: text(formData, "medications"),
      allergies: text(formData, "allergies"),
      notes: text(formData, "notes"),
    },
  });
  revalidatePath(`/hundar/${dogId}`);
  revalidatePath("/hundar");
}
