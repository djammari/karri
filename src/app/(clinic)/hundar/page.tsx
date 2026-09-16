import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/clinic/page-chrome";
import { ProgressBadge } from "@/components/clinic/progress-trend";
import { getPrisma } from "@/lib/prisma";

export default async function DogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const dogs = await getPrisma().dog.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { breed: { contains: q, mode: "insensitive" } },
            { owner: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      owner: true,
      visits: { orderBy: { occurredAt: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Hundar"
        description="Sjúklingar sjúkraþjálfunarinnar. Opnaðu hund til að sjá dagbók, fyrstu komu og framvindu."
        actions={
          <Button asChild>
            <Link href="/hundar/nyr">Nýr hundur</Link>
          </Button>
        }
      />
      <form className="mb-5 max-w-sm">
        <Input
          name="q"
          placeholder="Leita að hundi, kynþætti eða eiganda"
          defaultValue={q}
        />
      </form>
      {dogs.length === 0 ? (
        <EmptyState
          title={q ? "Ekkert fannst" : "Engir hundar skráðir"}
          description="Byrjaðu á eiganda og skráðu svo hundinn sem kemur í sjúkraþjálfun."
          action={
            <Button asChild>
              <Link href="/hundar/nyr">Skrá hund</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {dogs.map((dog) => {
            const last = dog.visits[0];
            return (
              <Link
                key={dog.id}
                href={`/hundar/${dog.id}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg">{dog.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dog.breed} · {dog.owner.name}
                    </p>
                  </div>
                  {last ? <ProgressBadge value={last.progress} /> : null}
                </div>
                {dog.diagnoses ? (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {dog.diagnoses}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Engin greining skráð enn.
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
