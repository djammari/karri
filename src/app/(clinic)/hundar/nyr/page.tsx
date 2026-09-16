import { createDogAction } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/clinic/page-chrome";
import { DogFields } from "@/components/clinic/record-fields";
import { getPrisma } from "@/lib/prisma";

export default async function NewDogPage({
  searchParams,
}: {
  searchParams: Promise<{ owner?: string }>;
}) {
  const params = await searchParams;
  const selected =
    typeof params.owner === "string" ? params.owner : undefined;
  const owners = await getPrisma().owner.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Nýr hundur"
        description="Sjúklingurinn. Allar grunnupplýsingar, örmerki, trygging og hreyfing eru hluti af sjúkraskránni."
      />
      <Card>
        <CardHeader>
          <CardTitle>Hundur</CardTitle>
        </CardHeader>
        <CardContent>
          {owners.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Skráðu eiganda áður en hundur er stofnaður.
            </p>
          ) : (
            <form action={createDogAction} className="space-y-6">
              <div className="grid gap-1.5">
                <label htmlFor="ownerId" className="text-sm">
                  Eigandi
                </label>
                <select
                  id="ownerId"
                  name="ownerId"
                  required
                  defaultValue={selected}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">Veldu eiganda</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} · {owner.phone}
                    </option>
                  ))}
                </select>
              </div>
              <DogFields />
              <Button type="submit">Vista hund</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
