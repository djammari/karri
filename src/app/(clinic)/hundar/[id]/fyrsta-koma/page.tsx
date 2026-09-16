import { notFound } from "next/navigation";
import { saveIntakeAction } from "@/app/actions/visits";
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
import { INTAKE_SECTIONS, SERVICES } from "@/lib/clinic";
import { datetimeLocal } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dog = await getPrisma().dog.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!dog) notFound();

  return (
    <div>
      <PageHeader
        eyebrow={dog.owner.name}
        title={`Fyrsta koma — ${dog.name}`}
        description={`${SERVICES.intake.description} Skráðu allt sem þú sérð svo hægt sé að útbúa sjúkraskýrslu á eftir.`}
      />
      <form action={saveIntakeAction.bind(null, dog.id)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tími</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Dagsetning og tími" name="occurredAt">
              <Input
                id="occurredAt"
                name="occurredAt"
                type="datetime-local"
                defaultValue={datetimeLocal()}
                required
              />
            </Field>
            <Field
              label="Ráðleggingar heim"
              name="homeRecommendations"
              className="md:col-span-2"
            >
              <Textarea
                id="homeRecommendations"
                name="homeRecommendations"
                rows={3}
                placeholder="Æfingar, hvíld, göngur, hvað má ekki."
              />
            </Field>
            <Field
              label="Meðferð í þessum tíma"
              name="treatmentNotes"
              className="md:col-span-2"
            >
              <Textarea id="treatmentNotes" name="treatmentNotes" rows={3} />
            </Field>
            <Field
              label="Næsti tími"
              name="nextVisitNotes"
              className="md:col-span-2"
            >
              <Textarea
                id="nextVisitNotes"
                name="nextVisitNotes"
                rows={2}
                defaultValue="Endurhæfing, 1 klukkustund."
              />
            </Field>
          </CardContent>
        </Card>

        {INTAKE_SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {section.fields.map((field) => (
                <Field key={field.key} label={field.label} name={field.key}>
                  <Textarea
                    id={field.key}
                    name={field.key}
                    rows={field.rows ?? 3}
                    required={field.key === "chiefComplaint"}
                  />
                </Field>
              ))}
            </CardContent>
          </Card>
        ))}

        <Button type="submit">Vista fyrstu komu og opna sjúkraskýrslu</Button>
      </form>
    </div>
  );
}
