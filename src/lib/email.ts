import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Resend } from "resend";
import { EmailProvider } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { CLINIC, staffName } from "@/lib/clinic";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  reportId?: string;
};

export async function sendClinicEmail(input: SendEmailInput) {
  const from =
    process.env.CLINIC_FROM_EMAIL ||
    `Óstöðvandi <${CLINIC.email}>`;
  const key = process.env.RESEND_API_KEY?.trim();

  if (key) {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    await getPrisma().emailLog.create({
      data: {
        reportId: input.reportId,
        to: input.to,
        subject: input.subject,
        body: input.text,
        html: input.html,
        provider: EmailProvider.RESEND,
        providerId: result.data?.id,
      },
    });
    return { provider: EmailProvider.RESEND, id: result.data?.id ?? null };
  }

  const dir = path.join(process.cwd(), "data", "emails");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${input.to.replace(/[^a-z0-9@._-]/gi, "_")}.json`;
  await writeFile(
    path.join(dir, filename),
    JSON.stringify(
      {
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        mockedAt: new Date().toISOString(),
        note: "RESEND_API_KEY vantar — tölvupóstur vistaður staðbundið.",
      },
      null,
      2,
    ),
    "utf8",
  );

  const log = await getPrisma().emailLog.create({
    data: {
      reportId: input.reportId,
      to: input.to,
      subject: input.subject,
      body: input.text,
      html: input.html,
      provider: EmailProvider.MOCK,
      providerId: filename,
    },
  });

  return { provider: EmailProvider.MOCK, id: log.id };
}

export function reportEmailCopy(opts: {
  ownerName: string;
  dogName: string;
  extraNotes: string;
  body: string;
}) {
  const staff = staffName();
  const text = [
    `Sæl/sæll ${opts.ownerName}`,
    "",
    `Hér er sjúkraskýrsla fyrir ${opts.dogName} eftir komu til sjúkraþjálfunar hjá Óstöðvandi.`,
    "",
    opts.body,
    opts.extraNotes ? `\nAthugasemdir til eiganda:\n${opts.extraNotes}\n` : "",
    `Ef eitthvað er óljóst er velkomið að hafa samband í síma ${CLINIC.phone} eða á ${CLINIC.email}.`,
    "",
    "Kær kveðja,",
    `${staff}`,
    CLINIC.staffTitle,
    CLINIC.name,
    CLINIC.address,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const html = `
    <div style="font-family:Barlow,Arial,sans-serif;color:#08140e;line-height:1.5">
      <p>Sæl/sæll ${escapeHtml(opts.ownerName)}</p>
      <p>Hér er sjúkraskýrsla fyrir <strong>${escapeHtml(opts.dogName)}</strong> eftir komu til sjúkraþjálfunar hjá Óstöðvandi.</p>
      <pre style="white-space:pre-wrap;font-family:Barlow,Arial,sans-serif">${escapeHtml(opts.body)}</pre>
      ${
        opts.extraNotes
          ? `<p><strong>Athugasemdir til eiganda</strong></p><p>${escapeHtml(opts.extraNotes).replace(/\n/g, "<br/>")}</p>`
          : ""
      }
      <p>Ef eitthvað er óljóst er velkomið að hafa samband í síma ${CLINIC.phone} eða á ${CLINIC.email}.</p>
      <p>Kær kveðja,<br/>${escapeHtml(staff)}<br/>${CLINIC.staffTitle}<br/>${CLINIC.name}<br/>${CLINIC.address}</p>
    </div>
  `;

  return { text, html };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
