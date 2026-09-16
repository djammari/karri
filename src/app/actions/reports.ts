"use server";

import { ReportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ReportFields } from "@/lib/clinic";
import { REPORT_TEMPLATE } from "@/lib/clinic";
import { reportEmailCopy, sendClinicEmail } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";

function fieldsFromForm(formData: FormData): ReportFields {
  const fields = {} as ReportFields;
  for (const field of REPORT_TEMPLATE) {
    fields[field.key] = String(formData.get(field.key) || "").trim();
  }
  return fields;
}

function reportBody(fields: ReportFields) {
  return REPORT_TEMPLATE.map(
    (field) => `${field.label}\n${fields[field.key] || "—"}`,
  ).join("\n\n");
}

export async function saveReportAction(dogId: string, formData: FormData) {
  const fields = fieldsFromForm(formData);
  const extraNotes = String(formData.get("extraNotes") || "").trim() || null;
  const visitId = String(formData.get("visitId") || "") || null;
  const existingId = String(formData.get("reportId") || "");
  const db = getPrisma();

  const report = existingId
    ? await db.medicalReport.update({
        where: { id: existingId },
        data: { fields, extraNotes, visitId },
      })
    : await db.medicalReport.create({
        data: {
          dogId,
          visitId,
          fields,
          extraNotes,
          status: ReportStatus.DRAFT,
        },
      });

  revalidatePath(`/hundar/${dogId}`);
  redirect(`/hundar/${dogId}/sjukraskyrsla?report=${report.id}`);
}

export async function sendReportAction(dogId: string, formData: FormData) {
  const fields = fieldsFromForm(formData);
  const extraNotes = String(formData.get("extraNotes") || "").trim();
  const visitId = String(formData.get("visitId") || "") || null;
  const existingId = String(formData.get("reportId") || "");
  const to = String(formData.get("to") || "").trim();
  if (!to) {
    throw new Error("Netfang eiganda vantar.");
  }

  const db = getPrisma();
  const dog = await db.dog.findUniqueOrThrow({
    where: { id: dogId },
    include: { owner: true },
  });

  const report = existingId
    ? await db.medicalReport.update({
        where: { id: existingId },
        data: { fields, extraNotes, visitId },
      })
    : await db.medicalReport.create({
        data: { dogId, visitId, fields, extraNotes },
      });

  const copy = reportEmailCopy({
    ownerName: dog.owner.name,
    dogName: dog.name,
    extraNotes,
    body: reportBody(fields),
  });

  const sent = await sendClinicEmail({
    to,
    subject: `Sjúkraskýrsla — ${dog.name} | Óstöðvandi`,
    text: copy.text,
    html: copy.html,
    reportId: report.id,
  });

  await db.medicalReport.update({
    where: { id: report.id },
    data: {
      status: ReportStatus.SENT,
      sentAt: new Date(),
      sentToEmail: to,
      extraNotes,
      fields,
    },
  });

  revalidatePath(`/hundar/${dogId}`);
  redirect(
    `/hundar/${dogId}/sjukraskyrsla?report=${report.id}&sent=${sent.provider}`,
  );
}
