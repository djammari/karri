import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/clinic/page-chrome";
import { getPrisma } from "@/lib/prisma";

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const owners = await getPrisma().owner.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    include: { _count: { select: { dogs: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Viðskiptavinir"
        description="Eigendur hundanna. Tengjast Shopify-viðskiptavinum þegar netfang eða Shopify-númer passar."
        actions={
          <Button asChild>
            <Link href="/vidskiptavinir/nyr">Nýr eigandi</Link>
          </Button>
        }
      />
      <form className="mb-5 max-w-sm">
        <Input name="q" placeholder="Leita að nafni, síma eða netfangi" defaultValue={q} />
      </form>
      {owners.length === 0 ? (
        <EmptyState
          title={q ? "Ekkert fannst" : "Engir eigendur skráðir"}
          description="Skráðu eiganda áður en hundur er tekinn inn í sjúkraþjálfun."
          action={
            <Button asChild>
              <Link href="/vidskiptavinir/nyr">Skrá eiganda</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Nafn</th>
                <th className="px-3 py-2 font-medium">Sími</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">
                  Netfang
                </th>
                <th className="px-3 py-2 font-medium">Hundar</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Link
                      href={`/vidskiptavinir/${owner.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {owner.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{owner.phone}</td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    {owner.email || "—"}
                  </td>
                  <td className="px-3 py-2">{owner._count.dogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

