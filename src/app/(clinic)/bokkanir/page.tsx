import Link from "next/link";
import {
  cancelBookingAction,
  fireMockSesamiAction,
  linkBookingAction,
} from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/clinic/page-chrome";
import { bookingStatusLabel } from "@/lib/clinic";
import { formatDateTime } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export default async function BookingsPage() {
  const db = getPrisma();
  const [bookings, owners] = await Promise.all([
    db.booking.findMany({
      orderBy: { startsAt: "desc" },
      include: { owner: true, dog: true },
      take: 80,
    }),
    db.owner.findMany({
      include: { dogs: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Bókanir"
        description="Tímar frá Sesami á ostodvandi.is. Tengdu bókun við eiganda og hund svo hægt sé að skrá endurhæfingu."
        actions={
          <form action={fireMockSesamiAction}>
            <Button type="submit" variant="outline">
              Senda sýnibókun
            </Button>
          </form>
        }
      />
      {bookings.length === 0 ? (
        <EmptyState
          title="Engar bókanir"
          description="Kerfið bíður eftir Sesami webhook. Án lykla geturðu sent sýnibókun hér til að prófa flæðið."
          action={
            <form action={fireMockSesamiAction}>
              <Button type="submit">Senda sýnibókun</Button>
            </form>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base not-italic normal-case tracking-normal">
                  <span>
                    {booking.serviceName} · {formatDateTime(booking.startsAt)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {bookingStatusLabel(booking.status)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  {booking.customerName}
                  {booking.customerPhone ? ` · ${booking.customerPhone}` : ""}
                  {booking.customerEmail ? ` · ${booking.customerEmail}` : ""}
                </p>
                {booking.notes ? (
                  <p className="text-muted-foreground">{booking.notes}</p>
                ) : null}
                {booking.dog ? (
                  <p>
                    Tengt:{" "}
                    <Link
                      href={`/hundar/${booking.dog.id}`}
                      className="hover:text-primary"
                    >
                      {booking.dog.name}
                    </Link>
                  </p>
                ) : (
                  <form
                    action={linkBookingAction}
                    className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  >
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <select
                      name="ownerId"
                      className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5"
                      defaultValue=""
                    >
                      <option value="">Veldu eiganda</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="dogId"
                      className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5"
                      defaultValue=""
                    >
                      <option value="">Hundur (valkvætt)</option>
                      {owners.flatMap((owner) =>
                        owner.dogs.map((dog) => (
                          <option key={dog.id} value={dog.id}>
                            {dog.name} ({owner.name})
                          </option>
                        )),
                      )}
                    </select>
                    <Button type="submit" size="sm">
                      Tengja
                    </Button>
                  </form>
                )}
                {booking.status !== "cancelled" ? (
                  <form action={cancelBookingAction.bind(null, booking.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Aflýsa
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
