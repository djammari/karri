import Link from "next/link";
import { notFound } from "next/navigation";
import { updateDogAction } from "@/app/actions/records";
import { saveNoteAction } from "@/app/actions/visits";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/clinic/page-chrome";
import { ProgressBadge, ProgressTrend } from "@/components/clinic/progress-trend";
import { DogFields } from "@/components/clinic/record-fields";
import {
  SERVICES,
  TREATMENT_OPTIONS,
  visitTypeLabel,
} from "@/lib/clinic";
import { ageLabel, formatDateTime } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";
import type { Treatments } from "@/lib/clinic";

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dog = await getPrisma().dog.findUnique({
    where: { id },
    include: {
      owner: true,
      visits: { orderBy: { occurredAt: "desc" } },
      reports: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!dog) notFound();

  const intake = dog.visits.find((visit) => visit.type === "INTAKE");
  const latestReport = dog.reports[0];
  const treatmentsLabel = (value: unknown) => {
    if (!value || typeof value !== "object") return "";
    const treatments = value as Treatments;
    return TREATMENT_OPTIONS.filter((option) => treatments[option.key])
      .map((option) => option.label)
      .join(", ");
  };

  return (
    <div>
      <PageHeader
        eyebrow={dog.owner.name}
        title={dog.name}
        description={`${dog.breed} · ${ageLabel(dog.birthDate)}${dog.activity ? ` · ${dog.activity}` : ""}`}
        actions={
          <>
            {!intake ? (
              <Button asChild>
                <Link href={`/hundar/${dog.id}/fyrsta-koma`}>
                  Fyrsta koma ({SERVICES.intake.durationMinutes} mín)
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/hundar/${dog.id}/endurhaefing`}>
                  Endurhæfing ({SERVICES.rehab.durationMinutes} mín)
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/hundar/${dog.id}/sjukraskyrsla`}>
                Sjúkraskýrsla
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Framvinda</CardTitle>
            <CardDescription>
              Betri, óbreytt eða verra eftir hvern endurhæfingartíma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressTrend
              points={dog.visits
                .slice()
                .reverse()
                .map((visit) => ({
                  occurredAt: visit.occurredAt,
                  progress: visit.progress,
                }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Eigandi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <Link
                href={`/vidskiptavinir/${dog.owner.id}`}
                className="hover:text-primary"
              >
                {dog.owner.name}
              </Link>
            </p>
            <p>{dog.owner.phone}</p>
            <p>{dog.owner.email || "Ekkert netfang"}</p>
            {latestReport ? (
              <p className="pt-2 text-muted-foreground">
                Sjúkraskýrsla:{" "}
                {latestReport.status === "SENT"
                  ? `send á ${latestReport.sentToEmail}`
                  : "drög, ósend"}
              </p>
            ) : (
              <p className="pt-2 text-muted-foreground">
                Engin sjúkraskýrsla enn.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sjúkradagbók</CardTitle>
          <CardDescription>
            Allar komur, meðferðir og ráðleggingar heim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dog.visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Engin færsla enn. Byrjaðu á fyrstu komu, 90 mínútur.
            </p>
          ) : (
            <ol className="space-y-5">
              {dog.visits.map((visit) => (
                <li
                  key={visit.id}
                  className="border-b border-border pb-5 last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {visitTypeLabel(visit.type)} · {formatDateTime(visit.occurredAt)}
                    </p>
                    {visit.durationMinutes ? (
                      <span className="text-xs text-muted-foreground">
                        {visit.durationMinutes} mín
                      </span>
                    ) : null}
                    <ProgressBadge value={visit.progress} />
                  </div>
                  {treatmentsLabel(visit.treatments) ? (
                    <p className="mt-1 text-sm text-primary">
                      {treatmentsLabel(visit.treatments)}
                    </p>
                  ) : null}
                  {visit.findings ? (
                    <p className="mt-2 text-sm">{visit.findings}</p>
                  ) : null}
                  {visit.treatmentNotes ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Meðferð: {visit.treatmentNotes}
                    </p>
                  ) : null}
                  {visit.homeRecommendations ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Heim: {visit.homeRecommendations}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}

          <form
            action={saveNoteAction.bind(null, dog.id)}
            className="mt-6 grid gap-3"
          >
            <Textarea
              name="findings"
              rows={3}
              placeholder="Stutt athugasemd í dagbók…"
              required
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                name="progress"
                defaultValue="UNRATED"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="UNRATED">Framvinda ómetin</option>
                <option value="BETTER">Betri</option>
                <option value="STABLE">Óbreytt</option>
                <option value="WORSE">Verra</option>
              </select>
              <Button type="submit" variant="outline">
                Vista færslu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grunnupplýsingar hunds</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateDogAction.bind(null, dog.id)} className="space-y-6">
            <DogFields dog={dog} />
            <Button type="submit">Vista upplýsingar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
