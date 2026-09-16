"use server";

import { Progress, VisitType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  EMPTY_INTAKE,
  TREATMENT_OPTIONS,
  type IntakeFields,
  type Treatments,
} from "@/lib/clinic";
import { getPrisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function optional(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function parseProgress(value: string): Progress {
  if (value === "BETTER" || value === "STABLE" || value === "WORSE") {
    return value;
  }
  return Progress.UNRATED;
}

function parseIntake(formData: FormData): IntakeFields {
  const intake = { ...EMPTY_INTAKE };
  for (const key of Object.keys(EMPTY_INTAKE) as (keyof IntakeFields)[]) {
    intake[key] = text(formData, key);
  }
  return intake;
}

function parseTreatments(formData: FormData): Treatments {
  const treatments: Treatments = {};
  for (const option of TREATMENT_OPTIONS) {
    if (formData.get(option.key) === "on") {
      treatments[option.key] = true;
    }
  }
  treatments.details = text(formData, "treatmentDetails") || undefined;
  return treatments;
}

export async function saveIntakeAction(dogId: string, formData: FormData) {
  const intake = parseIntake(formData);
  const occurredAt = text(formData, "occurredAt");
  const visit = await getPrisma().visit.create({
    data: {
      dogId,
      type: VisitType.INTAKE,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      durationMinutes: 90,
      findings: optional(formData, "gait") || optional(formData, "findings"),
      assessment: intake.workingDiagnosis || null,
      treatmentNotes: optional(formData, "treatmentNotes"),
      homeRecommendations: optional(formData, "homeRecommendations"),
      nextVisitNotes: optional(formData, "nextVisitNotes"),
      progress: Progress.UNRATED,
      intake,
    },
  });

  const dog = await getPrisma().dog.update({
    where: { id: dogId },
    data: {
      diagnoses: intake.workingDiagnosis || undefined,
      medications: intake.medications || undefined,
      activity: intake.activity || undefined,
    },
  });

  revalidatePath(`/hundar/${dogId}`);
  redirect(`/hundar/${dog.id}/sjukraskyrsla?visit=${visit.id}`);
}

export async function saveRehabAction(dogId: string, formData: FormData) {
  const occurredAt = text(formData, "occurredAt");
  const treatments = parseTreatments(formData);
  await getPrisma().visit.create({
    data: {
      dogId,
      type: VisitType.REHAB,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      durationMinutes: Number(formData.get("durationMinutes") || 60),
      findings: optional(formData, "findings"),
      treatmentNotes: optional(formData, "treatmentNotes"),
      homeRecommendations: optional(formData, "homeRecommendations"),
      nextVisitNotes: optional(formData, "nextVisitNotes"),
      progress: parseProgress(text(formData, "progress")),
      treatments,
      bookingId: optional(formData, "bookingId"),
    },
  });
  revalidatePath(`/hundar/${dogId}`);
  redirect(`/hundar/${dogId}`);
}

export async function saveNoteAction(dogId: string, formData: FormData) {
  await getPrisma().visit.create({
    data: {
      dogId,
      type: VisitType.NOTE,
      occurredAt: new Date(),
      findings: optional(formData, "findings"),
      progress: parseProgress(text(formData, "progress")),
    },
  });
  revalidatePath(`/hundar/${dogId}`);
}
