import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;
if (!url) {
  throw new Error(
    "Gagnagrunnstenging vantar (DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL).",
  );
}

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const owner = await prisma.owner.upsert({
    where: { shopifyCustomerId: "demo-shopify-1" },
    update: {},
    create: {
      name: "Sigrún Ólafsdóttir",
      kennitala: "120490-0000",
      email: "sigrun.olafsdottir@example.is",
      phone: "771-0000",
      address: "Garðatorg 3",
      postalCode: "210",
      city: "Garðabær",
      shopifyCustomerId: "demo-shopify-1",
      notes:
        "Sýnigögn. Eigandi virks canicross-hunds. Ekki raunveruleg sjúkraskrá.",
    },
  });

  const existingDog = await prisma.dog.findFirst({
    where: { ownerId: owner.id, name: "Freyr" },
  });

  const dog =
    existingDog ??
    (await prisma.dog.create({
      data: {
        ownerId: owner.id,
        name: "Freyr",
        breed: "Border collie",
        sex: "MALE",
        birthDate: new Date("2019-04-12"),
        weightKg: 18.4,
        color: "Svartur og hvítur",
        chipNumber: "900000000000001",
        insurance: "Sjóvá gæludýratrygging",
        vetName: "Dýralæknastofan Garðabæ",
        activity: "Canicross og hjól",
        diagnoses: "Eftirmeðferð eftir krossbandaaðgerð hægra afturfótar.",
        medications: "Engin lyf núna.",
        notes: "Virkur vinnuhundur. Þarf stýrt álag eftir aðgerð.",
      },
    }));

  const intakeCount = await prisma.visit.count({
    where: { dogId: dog.id, type: "INTAKE" },
  });
  if (intakeCount === 0) {
    const intake = await prisma.visit.create({
      data: {
        dogId: dog.id,
        type: "INTAKE",
        occurredAt: new Date("2026-08-26T13:00:00+00:00"),
        durationMinutes: 90,
        progress: "UNRATED",
        findings:
          "Haltar á hægra afturfæti við upphaf göngu. Minnkaður hreyfiferill í hné. Vöðvarýrnun á læri.",
        assessment:
          "Eftirstöðvar eftir krossbandaaðgerð. Þarf stýrða endurhæfingu í vatni og styrktaræfingar.",
        treatmentNotes:
          "Mjúk þreifing, stutt prófun á vatnshlaupabretti á lágum hraða, leiðbeiningar um hvíld og stuttar göngur.",
        homeRecommendations:
          "Stuttar, hægar göngur á sléttu, 3× á dag. Forðast bolta og snöggar beygjur. Ís eftir álag.",
        nextVisitNotes: "Endurhæfing 1 klst. eftir eina viku.",
        intake: {
          chiefComplaint:
            "Haltar á hægra afturfæti eftir krossbandaaðgerð. Erfiðara að hlaupa og hoppa inn í bíl.",
          onset: "Aðgerð fyrir 6 vikum. Haltan minnkaði fyrst en hefur staðið í stað síðustu tvær vikur.",
          history: "Heilbrigður áður. Engin önnur aðgerðasaga.",
          surgeries: "Krossbandaaðgerð hægra hné, júní 2026.",
          medications: "Verkjalyf eftir aðgerð, hætt fyrir 3 vikum.",
          vet: "Dýralæknastofan Garðabæ, tilvísun í sjúkraþjálfun.",
          previousTreatment: "Hvíld og stuttar göngur samkvæmt dýralækni.",
          activity: "Canicross og hjól 3–4× í viku fyrir meiðsli. Nú aðeins stuttar göngur.",
          living: "Einbýlishús, parket og teppi. Annar hundur á heimilinu.",
          gait: "Stytt skref hægra megin, þyngd flutt yfir á vinstri.",
          posture: "Hægri mjöðm lægri. Þyngd á framfótum.",
          palpation: "Vöðvaspenna í læri og lend. Eymsli við hné.",
          rom: "Beygja og rétta í hægra hné skert miðað við vinstri.",
          pain: "Viðbragð við þrýstingi á hné. Eigandi lýsir stirðleika morgna.",
          neuro: "Eðlileg viðbrögð.",
          waterTest: "Róleg ganga í vatnshlaupabretti, 3 mínútur, góð staða.",
          workingDiagnosis:
            "Eftirmeðferð krossbanda. Vöðvarýrnun og skert hreyfiferill hægra hné.",
          goals: "Aflétta haltu, byggja upp vöðva og snúa aftur í stýrða hreyfingu.",
          plan: "Vatnshlaupabretti 1× í viku, laser, æfingar heim. Endurmat eftir 4 tíma.",
          extra: "Eigandi vill skýrslu senda á netfangið sitt.",
        },
      },
    });

    await prisma.medicalReport.create({
      data: {
        dogId: dog.id,
        visitId: intake.id,
        status: "DRAFT",
        fields: {
          reason:
            "Freyr kom til sjúkraþjálfunar vegna höltu á hægra afturfæti eftir krossbandaaðgerð.",
          examination:
            "Skerðing á hreyfiferli í hægra hné, vöðvarýrnun á læri og haltagangur við upphaf göngu.",
          diagnosis:
            "Eftirmeðferð eftir krossbandaaðgerð. Þarf stýrða endurhæfingu.",
          treatment:
            "Skoðun, mjúk vinna og stutt prófun á vatnshlaupabretti.",
          homePlan:
            "Stuttar hægar göngur þrisvar á dag. Enginn bolti. Ís eftir álag.",
          prognosis:
            "Góðar horfur með reglubundinni endurhæfingu og stýrðu álagi.",
          followUp:
            "Endurhæfingarheimsóknir, um 1 klukkustund, vikulega fyrst um sinn.",
        },
        extraNotes:
          "Sýniskýrsla. Sendu raunverulega skýrslu eftir fyrstu komu sjúklings.",
      },
    });

    await prisma.visit.create({
      data: {
        dogId: dog.id,
        type: "REHAB",
        occurredAt: new Date("2026-09-02T13:00:00+00:00"),
        durationMinutes: 60,
        progress: "BETTER",
        treatmentNotes:
          "Vatnshlaupabretti 8 mínútur á lágum hraða. Laser á hné. Styrktaræfingar fyrir afturfætur.",
        homeRecommendations:
          "Halda stuttum göngum. Bæta við 3× sitja-standa á degi. Ekki hlaup enn.",
        findings: "Haltan minni við upphitun. Betri þyngdarflutningur.",
        treatments: {
          waterTreadmill: true,
          laser: true,
          exercises: true,
          details: "Vatn upp að olnboga. Laser 4 mínútur á hné.",
        },
      },
    });

    await prisma.visit.create({
      data: {
        dogId: dog.id,
        type: "REHAB",
        occurredAt: new Date("2026-09-09T13:00:00+00:00"),
        durationMinutes: 60,
        progress: "BETTER",
        treatmentNotes:
          "Vatnshlaupabretti 12 mínútur. Vatnsborð. Laser. Jafnvægisæfingar.",
        homeRecommendations:
          "Göngur má lengja í 20 mínútur á sléttu. Halda sitja-standa. Fylgjast með hné eftir leik.",
        findings: "Jafnari skref. Minnni stirðleiki morgna.",
        treatments: {
          waterTreadmill: true,
          waterboard: true,
          laser: true,
          balance: true,
          details: "Aukið vatnsmagn og lengri tími.",
        },
      },
    });
  }

  console.log("Sýnigögn tilbúin: Sigrún Ólafsdóttir / Freyr");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
