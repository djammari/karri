import { fireMockSesamiAction } from "@/app/actions/bookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/clinic/page-chrome";
import { formatDateTime } from "@/lib/format";
import { integrationStatus } from "@/lib/integrations/crypto";
import { appUrl } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export default async function IntegrationsPage() {
  const status = integrationStatus();
  const base = appUrl();
  const events = await getPrisma().webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <PageHeader
        title="Samþættingar"
        description="Shopify og Sesami eru aðskilin lög. Klíníska kerfið opnast og virkar án lykla. Webhooks taka á móti bókunum þegar þau eru stillt."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shopify</CardTitle>
            <CardDescription>
              Verslunin á ostodvandi.is. Viðskiptavinir geta orðið eigendur í
              sjúkraskránni.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Verslun"
              value={status.shopify.shop || "óskráð"}
            />
            <Row
              label="Webhook secret"
              value={status.shopify.webhookSecret ? "stilling klár" : "vantar — mock leyfður"}
            />
            <p className="pt-2 font-mono text-xs break-all">
              {base}/api/webhooks/shopify
            </p>
            <p className="text-muted-foreground">
              Topics: customers/create, customers/update, orders/create. HMAC
              header: X-Shopify-Hmac-Sha256.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesami</CardTitle>
            <CardDescription>
              Tímabókanir á Shopify-vörunni „Sjúkraþjálfun“ (90 mín fyrsti tími
              / 1 klst endurhæfing).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Webhook secret"
              value={status.sesami.webhookSecret ? "stilling klár" : "vantar — mock leyfður"}
            />
            <Row
              label="API lykill"
              value={status.sesami.apiKey ? "stilling klár" : "vantar — engin útsending"}
            />
            <p className="pt-2 font-mono text-xs break-all">
              {base}/api/webhooks/sesami
            </p>
            <p className="text-muted-foreground">
              Events: appointment.created / updated / cancelled (einnig
              booking.*). Header: X-Sesami-Signature.
            </p>
            <form action={fireMockSesamiAction}>
              <Button type="submit" variant="outline">
                Senda sýniviðburð
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Webhook-atburðir</CardTitle>
          <CardDescription>
            Síðustu innkomu. Óstaðfest HMAC er leyfð staðbundið þegar secret
            vantar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Enginn viðburður enn. Prófaðu sýniviðburð eða GET á webhook
              slóðunum.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2"
                >
                  <div>
                    <p>
                      {event.source} · {event.topic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(event.createdAt)}
                      {event.error ? ` · ${event.error}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={event.processed ? "secondary" : "destructive"}>
                      {event.processed ? "unninn" : "villa"}
                    </Badge>
                    <Badge variant={event.hmacValid ? "default" : "outline"}>
                      {event.hmacValid ? "HMAC" : "óstaðfest"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
