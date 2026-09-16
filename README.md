# Óstöðvandi — sjúkraskrá

Innra kerfi fyrir [Óstöðvandi](https://ostodvandi.is): sjúkraþjálfun og endurhæfing hunda á Garðatorgi 3, Garðabæ. Íslenskt viðmót. Verslunin á Shopify og Sesami-bókanir eru aðskilið samþættingalag — klíníska kerfið keyrir án Shopify-lykla.

Þetta er nýsmíði, ekki afrit af eldra Darrwin-verkefni. Lénið (eigandi/hundur, dagbók, Sesami `appointment.*` webhook) var lesið sem tilvísun.

## Hvað er með

- Viðskiptavinir (eigendur) og hundar (sjúklingar) með allri grunnskráningu
- Sjúkradagbók
- Fyrsta koma, 90 mínútur: löng skoðun sem greinir hvað er að
- Sjúkraskýrsla út frá einföldu sniðmáti, send eiganda (Resend eða staðbundin vistun)
- Endurhæfing, ~1 klst: vatnshlaupabretti, vatnsborð, laser, æfingar og ráðleggingar heim
- Framvinda: betri / óbreytt / verra
- Innskráning með umhverfisbreytum (sjúkraskrár)
- Shopify + Sesami webhook/bókunarsamþætting

## Keyrsla staðbundið

Þú þarft Node 22+ og PostgreSQL.

```bash
cp .env.example .env
# sjálfgefið: postgresql://ostodvandi:ostodvandi@127.0.0.1:5432/ostodvandi
npm install
npx prisma generate
npx prisma migrate deploy   # eða: npx prisma db push
npm run db:seed             # valkvætt sýnigögn (Freyr / Sigrún)
npm run dev
```

Appið keyrir á [http://127.0.0.1:4317](http://127.0.0.1:4317).

Sjálfgefin innskráning (aðeins fyrir þróun):

- notandi: `klinik`
- lykilorð: `klinik`

Breytið `CLINIC_USERNAME`, `CLINIC_PASSWORD` og `AUTH_SECRET` áður en raunverulegar sjúkraskrár eru vistaðar.

Án `RESEND_API_KEY` eru tölvupóstar vistaðir í `data/emails/` og í póstskrá gagnagrunnsins.

## Gagnagrunnur (Vercel / Neon)

Eldri Vercel env-nöfn eru enn lesin. **Ekki eyða** núverandi breytum.

Runtime (eitt dugar): `DATABASE_URL` / `POSTGRES_PRISMA_URL` / `POSTGRES_URL`  
Migrate (eitt dugar): `DIRECT_URL` / `POSTGRES_URL_NON_POOLING`

Sesami: `SESAMI_API_KEY`, `SESAMI_WEBHOOK_SECRET` (óbreytt). App-slóð: `APP_URL` eða `NEXTAUTH_URL`.

Sjá einnig `SHOPIFY_INTEGRATION.md`.

## Stafla

Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, Resend.
