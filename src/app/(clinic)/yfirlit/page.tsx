import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/clinic/page-chrome";
import { CLINIC, SERVICES, visitTypeLabel } from "@/lib/clinic";
import { formatDateTime, formatKr } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export default async function OverviewPage() {
  const db = getPrisma();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [dogs, owners, today, recentVisits, unsentReports, unmatched] =
    await Promise.all([
      db.dog.count(),
      db.owner.count(),
      db.booking.findMany({
        where: { startsAt: { gte: start, lt: end } },
        orderBy: { startsAt: "asc" },
        include: { dog: true, owner: true },
      }),
      db.visit.findMany({
        orderBy: { occurredAt: "desc" },
        take: 6,
        include: { dog: { include: { owner: true } } },
      }),
      db.medicalReport.findMany({
        where: { status: "DRAFT" },
        include: { dog: true },
        take: 5,
      }),
      db.booking.count({ where: { ownerId: null } }),
    ]);

  return (
    <div>
      <PageHeader
        eyebrow="Garðatorg 3"
        title="Yfirlit dagsins"
        description={`${CLINIC.name} er heilsumiðstöð fyrir hunda. Hér eru sjúkraskrár, fyrstu komur og endurhæfing — aðskilið frá versluninni á ostodvandi.is.`}
        actions={
          <>
            <Button asChild>
              <Link href="/hundar/nyr">Nýr hundur</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vidskiptavinir/nyr">Nýr eigandi</Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Hundar" value={dogs} />
        <Stat label="Eigendur" value={owners} />
        <Stat label="Bókanir í dag" value={today.length} />
        <Stat label="Ótengdar bókanir" value={unmatched} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bókanir í dag</CardTitle>
            <CardDescription>
              Sesami-tímar af ostodvandi.is og handvirkar bókanir. Fyrsti tími{" "}
              {SERVICES.intake.durationMinutes} mín ({formatKr(SERVICES.intake.priceKr)}
              ), endurhæfing {SERVICES.rehab.durationMinutes} mín (
              {formatKr(SERVICES.rehab.priceKr)}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {today.length === 0 ? (
              <EmptyState
                title="Engin bókun í dag"
                description="Þegar Sesami sendir bókun birtist hún hér. Þú getur sent sýniviðburð undir Samþættingar."
              />
            ) : (
              <ul className="space-y-3">
                {today.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{booking.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.customerName}
                        {booking.dog ? ` · ${booking.dog.name}` : ""}
                      </p>
                    </div>
                    <p className="text-sm">{formatDateTime(booking.startsAt)}</p>
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/bokkanir">Allar bókanir</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nýlegar færslur</CardTitle>
            <CardDescription>Sjúkradagbók — fyrstu komur og endurhæfing.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentVisits.length === 0 ? (
              <EmptyState
                title="Dagbókin er tóm"
                description="Skráðu fyrstu komu hunds til að byrja sjúkraskrá."
              />
            ) : (
              <ul className="space-y-3">
                {recentVisits.map((visit) => (
                  <li key={visit.id}>
                    <Link
                      href={`/hundar/${visit.dogId}`}
                      className="flex items-start justify-between gap-3 hover:text-primary"
                    >
                      <div>
                        <p className="font-medium">
                          {visit.dog.name} · {visitTypeLabel(visit.type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {visit.dog.owner.name}
                        </p>
                      </div>
                      <p className="text-sm">{formatDateTime(visit.occurredAt)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {unsentReports.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sjúkraskýrslur ósendar</CardTitle>
            <CardDescription>
              Fylltu út sniðmátið og sendu eiganda eftir fyrstu komu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {unsentReports.map((report) => (
              <Button key={report.id} variant="outline" asChild>
                <Link
                  href={`/hundar/${report.dogId}/sjukraskyrsla?report=${report.id}`}
                >
                  {report.dog.name}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-display text-3xl not-italic">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
