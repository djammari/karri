import { notFound } from "next/navigation";
import { saveReportAction, sendReportAction } from "@/app/actions/reports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, PageHeader } from "@/components/clinic/page-chrome";
import {
  CLINIC,
  REPORT_TEMPLATE,
  staffName,
  type IntakeFields,
  type ReportFields,
} from "@/lib/clinic";
import { getPrisma } from "@/lib/prisma";

function prefillFromIntake(intake: IntakeFields | null): ReportFields {
  return {
    reason: intake?.chiefComplaint || "",
    examination: [
      intake?.gait,
      intake?.posture,
      intake?.palpation,
      intake?.rom,
      intake?.pain,
    ]
      .filter(Boolean)
      .join("\n"),
    diagnosis: intake?.workingDiagnosis || "",
    treatment: intake?.plan || "",
    homePlan: "",
    prognosis: "",
    followUp:
      "Endurhæfingarheimsóknir, um 1 klukkustund, með vatnshlaupabretti, laser og æfingum eftir þörfum.",
  };
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; report?: string; visit?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const sent = typeof query.sent === "string" ? query.sent : null;
  const reportId = typeof query.report === "string" ? query.report : null;
  const visitId = typeof query.visit === "string" ? query.visit : null;

  const dog = await getPrisma().dog.findUnique({
    where: { id },
    include: {
      owner: true,
      visits: { where: { type: "INTAKE" }, orderBy: { occurredAt: "desc" } },
      reports: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!dog) notFound();

  const report =
    dog.reports.find((item) => item.id === reportId) ?? dog.reports[0] ?? null;
  const visit =
    dog.visits.find((item) => item.id === visitId) ??
    dog.visits.find((item) => item.id === report?.visitId) ??
    dog.visits[0] ??
    null;
  const intake = (visit?.intake as IntakeFields | null) ?? null;
  const fields = (report?.fields as ReportFields | undefined) ??
    prefillFromIntake(intake);

  const extra =
    report?.extraNotes ||
    (visit?.homeRecommendations
      ? `Æfingar heim:\n${visit.homeRecommendations}`
      : "");

  return (
    <div>
      <PageHeader
        eyebrow={dog.owner.name}
        title={`Sjúkraskýrsla — ${dog.name}`}
        description={`Einfalt sniðmát frá fyrstu komu. Sent á eiganda frá ${staffName()}, ${CLINIC.staffTitle}.`}
      />
      {sent ? (
        <Alert className="mb-6">
          <AlertTitle>Sjúkraskýrsla send</AlertTitle>
          <AlertDescription>
            {sent === "MOCK"
              ? "RESEND_API_KEY vantar — pósturinn var vistaður staðbundið í data/emails og í póstskrá kerfisins."
              : `Póstur sendur með Resend á ${dog.owner.email}.`}
          </AlertDescription>
        </Alert>
      ) : null}

      {!visit ? (
        <p className="text-sm text-muted-foreground">
          Engin fyrsta koma er skráð. Fylltu fyrst út 90 mínútna skoðun.
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sniðmát</CardTitle>
            <CardDescription>
              Textinn er forútfylltur úr fyrstu komu. Lagfærðu og sendu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5">
              <input type="hidden" name="reportId" value={report?.id ?? ""} />
              <input type="hidden" name="visitId" value={visit.id} />
              {REPORT_TEMPLATE.map((field) => (
                <Field key={field.key} label={field.label} name={field.key} hint={field.hint}>
                  <Textarea
                    id={field.key}
                    name={field.key}
                    rows={4}
                    defaultValue={fields[field.key]}
                  />
                </Field>
              ))}
              <Field
                label="Aukaathugasemdir til eiganda"
                name="extraNotes"
                hint="Það sem þarf, æfingar, hvað má ekki, næstu skref."
              >
                <Textarea
                  id="extraNotes"
                  name="extraNotes"
                  rows={4}
                  defaultValue={extra}
                />
              </Field>
              <Field label="Netfang eiganda" name="to">
                <Input
                  id="to"
                  name="to"
                  type="email"
                  required
                  defaultValue={dog.owner.email ?? ""}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button formAction={saveReportAction.bind(null, dog.id)} variant="outline">
                  Vista drög
                </Button>
                <Button formAction={sendReportAction.bind(null, dog.id)}>
                  Senda sjúkraskýrslu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
