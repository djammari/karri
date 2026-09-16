import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOwnerAction } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/clinic/page-chrome";
import { OwnerFields } from "@/components/clinic/record-fields";
import { getPrisma } from "@/lib/prisma";

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await getPrisma().owner.findUnique({
    where: { id },
    include: { dogs: true, bookings: { orderBy: { startsAt: "desc" }, take: 5 } },
  });
  if (!owner) notFound();

  return (
    <div>
      <PageHeader
        title={owner.name}
        description={[owner.phone, owner.email, owner.city]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <Button asChild>
            <Link href={`/hundar/nyr?owner=${owner.id}`}>Skrá hund</Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upplýsingar eiganda</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateOwnerAction.bind(null, owner.id)} className="space-y-6">
              <OwnerFields owner={owner} />
              <Button type="submit">Vista breytingar</Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hundar</CardTitle>
            </CardHeader>
            <CardContent>
              {owner.dogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Enginn hundur skráður á þennan eiganda.
                </p>
              ) : (
                <ul className="space-y-2">
                  {owner.dogs.map((dog) => (
                    <li key={dog.id}>
                      <Link
                        href={`/hundar/${dog.id}`}
                        className="hover:text-primary"
                      >
                        {dog.name} · {dog.breed}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          {owner.shopifyCustomerId ? (
            <p className="text-xs text-muted-foreground">
              Shopify viðskiptavinur: {owner.shopifyCustomerId}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
