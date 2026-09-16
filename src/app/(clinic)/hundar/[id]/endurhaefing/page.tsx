import { notFound } from "next/navigation";
import { saveRehabAction } from "@/app/actions/visits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, PageHeader } from "@/components/clinic/page-chrome";
import { SERVICES, TREATMENT_OPTIONS } from "@/lib/clinic";
import { datetimeLocal } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export default async function RehabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dog = await getPrisma().dog.findUnique({
    where: { id },
    include: {
      owner: true,
      bookings: {
        where: { status: { not: "cancelled" } },
        orderBy: { startsAt: "desc" },
        take: 8,
      },
    },
  });
  if (!dog) notFound();

  return (
    <div>
      <PageHeader
        eyebrow={dog.owner.name}
        title={`Endurhæfing — ${dog.name}`}
        description={SERVICES.rehab.description}
      />
      <Card>
        <CardHeader>
          <CardTitle>1 klukkustund</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveRehabAction.bind(null, dog.id)} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Dagsetning og tími" name="occurredAt">
                <Input
                  id="occurredAt"
                  name="occurredAt"
                  type="datetime-local"
                  defaultValue={datetimeLocal()}
                  required
                />
              </Field>
              <Field label="Lengd (mínútur)" name="durationMinutes">
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  defaultValue={60}
                />
              </Field>
            </div>
            {dog.bookings.length > 0 ? (
              <Field label="Tengd bókun" name="bookingId">
                <select
                  id="bookingId"
                  name="bookingId"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  defaultValue=""
                >
                  <option value="">Engin</option>
                  {dog.bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.serviceName} ·{" "}
                      {booking.startsAt.toISOString().slice(0, 16)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-medium">Meðferð sem var gerð</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TREATMENT_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <input type="checkbox" name={option.key} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <Field label="Nánar um meðferð" name="treatmentDetails">
              <Textarea
                id="treatmentDetails"
                name="treatmentDetails"
                rows={2}
                placeholder="Tími á vatnshlaupabretti, vatnshæð, laser, æfingar…"
              />
            </Field>
            <Field label="Hvað var gert / staða í tíma" name="treatmentNotes">
              <Textarea id="treatmentNotes" name="treatmentNotes" rows={4} required />
            </Field>
            <Field label="Skoðun / breytingar" name="findings">
              <Textarea id="findings" name="findings" rows={3} />
            </Field>
            <Field
              label="Æfingar og ráðleggingar fyrir eiganda"
              name="homeRecommendations"
            >
              <Textarea
                id="homeRecommendations"
                name="homeRecommendations"
                rows={4}
                required
              />
            </Field>
            <Field label="Framvinda frá síðasta tíma" name="progress">
              <select
                id="progress"
                name="progress"
                required
                defaultValue="STABLE"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="BETTER">Betri</option>
                <option value="STABLE">Óbreytt</option>
                <option value="WORSE">Verra</option>
                <option value="UNRATED">Ómetið</option>
              </select>
            </Field>
            <Button type="submit">Vista endurhæfingartíma</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
