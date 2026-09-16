# Shopify og Sesami

Óstöðvandi verslar og bókar tíma á [ostodvandi.is](https://ostodvandi.is) (Shopify + Sesami). Klíníska kerfið er aðskilið: sjúkraskrár opnast og virka án Shopify-leyndarmála.

Sesami-vörurnar á síðunni:

- Sjúkraþjálfun — 90 mínútur, fyrsti tími (25.000 kr)
- Sjúkraþjálfun — 1 klukkustund (15.000 kr)

## Endpoints

| Leið | Hlutverk |
| --- | --- |
| `POST /api/webhooks/shopify` | Shopify HMAC webhook (viðskiptavinir, pantanir) |
| `GET /api/webhooks/shopify` | Staða / stilling |
| `POST /api/webhooks/sesami` | Sesami bókunarviðburðir |
| `GET /api/webhooks/sesami` | Staða / stilling |

## Umhverfisbreytur

Nöfn úr eldra Darrwin/Vercel-verkefni eru enn í gildi. **Ekki eyða** núverandi Vercel env.

```
# Gagnagrunnur (eitt af þessu dugar)
DATABASE_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL=
DIRECT_URL=
POSTGRES_URL_NON_POOLING=

# App URL (NEXTAUTH_URL úr eldra verkefni er enn lesið)
APP_URL=
NEXTAUTH_URL=

# Sesami (óbreytt nöfn)
SESAMI_WEBHOOK_SECRET=
SESAMI_API_KEY=
SESAMI_API_BASE=https://api.sesami.co/v1

# Shopify (valkvæmt; UI blokkar ekki)
SHOPIFY_SHOP_DOMAIN=
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_WEBHOOK_SECRET=

# Póstur
RESEND_API_KEY=
```

Ef webhook-secret vantar: viðburðurinn er vistaður sem **óstaðfestur** og unninn (svo hægt sé að þróa án lykla). Ef secret er sett og HMAC passar ekki: `401`.

## Shopify

Í Shopify Admin → Settings → Notifications / webhooks, bættu við:

- URL: `https://<app>/api/webhooks/shopify`
- Format: JSON
- Topics: `customers/create`, `customers/update`, `orders/create`
- HMAC header: `X-Shopify-Hmac-Sha256`

`customers/*` uppfærir eða stofnar eiganda (match á Shopify-númeri eða netfangi).

## Sesami

Í Sesami stillingum (bókunarappið á Shopify):

- URL: `https://<app>/api/webhooks/sesami`
- Events: `appointment.created`, `appointment.updated`, `appointment.cancelled`
- Header: `X-Sesami-Signature`

Raunverulegt payload sem kerfið býst við (úr fyrri Darrwin-samþættingu):

```json
{
  "event": "appointment.created",
  "sent_at": "2026-09-16T13:00:00Z",
  "booking": {
    "id": "sesami_booking_123",
    "status": "confirmed",
    "service_id": "sjukrathjalfun-1klst",
    "service_title": "Sjúkraþjálfun — 1 klukkustund",
    "starts_at": "2026-09-17T13:00:00Z",
    "ends_at": "2026-09-17T14:00:00Z",
    "time_zone": "Atlantic/Reykjavik",
    "resource_id": "gardatorg-3",
    "resource_name": "Óstöðvandi, Garðatorg 3"
  },
  "customer": {
    "shopify_customer_id": "123456",
    "name": "Sigrún Ólafsdóttir",
    "email": "sigrun@example.is",
    "phone": "771-0000"
  },
  "metadata": {
    "notes": "Hundurinn Freyr",
    "tags": "sjukrathjalfun",
    "source": "sesami"
  }
}
```

Eldra `event_type: booking.created` snið er einnig lesið.

Bókanir eru vistaðar í `bookings`. Ef netfang eða Shopify-númer passar við eiganda er bókunin tengd. Ef eigandi á einn hund er hundurinn tengdur sjálfkrafa.

Útsending til baka í Sesami (`SESAMI_API_KEY`) er valkvæð. Án lykils er aflýsing aðeins skráð hér.

## Próf án lykla

Undir **Samþættingar** eða **Bókanir**: „Senda sýniviðburð“ / „Senda sýnibókun“. Eða:

```bash
curl -s http://127.0.0.1:4317/api/webhooks/sesami
```
