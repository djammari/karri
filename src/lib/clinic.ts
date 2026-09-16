export const CLINIC = {
  name: "Óstöðvandi",
  legalName: "Óstöðvandi ehf.",
  address: "Garðatorg 3, 210 Garðabæ",
  kennitala: "460618-0450",
  phone: "771-7910 / 869-6916",
  email: "ostodvandi@ostodvandi.is",
  site: "https://ostodvandi.is",
  hours:
    "Þri–fimt 13:00–16:00, fös 13:00–15:00. Mánudaga og laugardaga lokað.",
  staffTitle: "Dýrahjúkrunarfræðingur og hundasjúkraþjálfari",
} as const;

export const SERVICES = {
  intake: {
    key: "intake",
    title: "Fyrsti tími — sjúkraþjálfun",
    durationMinutes: 90,
    priceKr: 25000,
    description:
      "Fyrsta koma, 90 mínútur. Skoðun, greining á því sem er að og skráning í sjúkraskrá.",
  },
  rehab: {
    key: "rehab",
    title: "Sjúkraþjálfun — 1 klukkustund",
    durationMinutes: 60,
    priceKr: 15000,
    description:
      "Endurhæfingarheimsókn. Vatnshlaupabretti, vatnsborð, laser, æfingar og ráðleggingar heim.",
  },
} as const;

export const TREATMENT_OPTIONS = [
  { key: "waterTreadmill", label: "Vatnshlaupabretti" },
  { key: "waterboard", label: "Vatnsborð" },
  { key: "laser", label: "Laser" },
  { key: "exercises", label: "Æfingar" },
  { key: "massage", label: "Nudd" },
  { key: "stretching", label: "Teygjur" },
  { key: "balance", label: "Jafnvægisþjálfun" },
  { key: "other", label: "Annað" },
] as const;

export type TreatmentKey = (typeof TREATMENT_OPTIONS)[number]["key"];

export type Treatments = Partial<Record<TreatmentKey, boolean>> & {
  details?: string;
};

export type IntakeFields = {
  chiefComplaint: string;
  onset: string;
  history: string;
  surgeries: string;
  medications: string;
  vet: string;
  previousTreatment: string;
  activity: string;
  living: string;
  gait: string;
  posture: string;
  palpation: string;
  rom: string;
  pain: string;
  neuro: string;
  waterTest: string;
  workingDiagnosis: string;
  goals: string;
  plan: string;
  extra: string;
};

export const EMPTY_INTAKE: IntakeFields = {
  chiefComplaint: "",
  onset: "",
  history: "",
  surgeries: "",
  medications: "",
  vet: "",
  previousTreatment: "",
  activity: "",
  living: "",
  gait: "",
  posture: "",
  palpation: "",
  rom: "",
  pain: "",
  neuro: "",
  waterTest: "",
  workingDiagnosis: "",
  goals: "",
  plan: "",
  extra: "",
};

export const INTAKE_SECTIONS: {
  title: string;
  description: string;
  fields: { key: keyof IntakeFields; label: string; rows?: number }[];
}[] = [
  {
    title: "Ástæða komu",
    description:
      "Hvað er að, hvenær byrjaði og hvað hefur eigandi þegar reynt.",
    fields: [
      {
        key: "chiefComplaint",
        label: "Ástæða komu / aðalvandamál",
        rows: 4,
      },
      { key: "onset", label: "Hvenær byrjaði og hvernig þróaðist", rows: 3 },
      { key: "previousTreatment", label: "Fyrri meðferð", rows: 3 },
    ],
  },
  {
    title: "Sjúkrasaga",
    description: "Aðgerðir, lyf, dýralæknir og annað sem skiptir máli.",
    fields: [
      { key: "history", label: "Sjúkrasaga", rows: 4 },
      { key: "surgeries", label: "Skurðaðgerðir / áverkar", rows: 3 },
      { key: "medications", label: "Lyf og bætiefni", rows: 2 },
      { key: "vet", label: "Dýralæknir / tilvísun", rows: 2 },
    ],
  },
  {
    title: "Hreyfing og heimili",
    description:
      "Óstöðvandi sinnir virkum hundum — canicross, hjól, göngur og daglegt álag.",
    fields: [
      {
        key: "activity",
        label: "Íþróttir og hreyfing (canicross, hjól, göngur, skíði…)",
        rows: 3,
      },
      { key: "living", label: "Heimili, gólf, bíll, aðrir hundar", rows: 2 },
    ],
  },
  {
    title: "Skoðun",
    description: "Göngulag, stelling, þreifing, hreyfiferill, verkur og taugar.",
    fields: [
      { key: "gait", label: "Göngulag", rows: 3 },
      { key: "posture", label: "Stelling og staða", rows: 3 },
      { key: "palpation", label: "Þreifing", rows: 3 },
      { key: "rom", label: "Hreyfiferill (ROM)", rows: 3 },
      { key: "pain", label: "Verkur og viðbrögð", rows: 3 },
      { key: "neuro", label: "Taugaskoðun", rows: 3 },
      {
        key: "waterTest",
        label: "Hreyfing í vatni / fyrsta prófun á vatnshlaupabretti",
        rows: 3,
      },
    ],
  },
  {
    title: "Niðurstaða og áætlun",
    description: "Vinnugreining, markmið eiganda og meðferðaráætlun.",
    fields: [
      { key: "workingDiagnosis", label: "Vinnugreining", rows: 3 },
      { key: "goals", label: "Markmið", rows: 3 },
      { key: "plan", label: "Meðferðaráætlun", rows: 4 },
      { key: "extra", label: "Annað sem þarf að skrá", rows: 3 },
    ],
  },
];

export type ReportFields = {
  reason: string;
  examination: string;
  diagnosis: string;
  treatment: string;
  homePlan: string;
  prognosis: string;
  followUp: string;
};

export const REPORT_TEMPLATE: {
  key: keyof ReportFields;
  label: string;
  hint: string;
}[] = [
  {
    key: "reason",
    label: "Ástæða komu",
    hint: "Af hverju hundurinn kom og hvað eigandi lýsir.",
  },
  {
    key: "examination",
    label: "Skoðun",
    hint: "Göngulag, stelling, þreifing, hreyfiferill og verkur.",
  },
  {
    key: "diagnosis",
    label: "Niðurstaða",
    hint: "Vinnugreining — hvað er að.",
  },
  {
    key: "treatment",
    label: "Meðferð í fyrstu komu",
    hint: "Það sem var gert í 90 mínútna tímanum.",
  },
  {
    key: "homePlan",
    label: "Æfingar og ráðleggingar heim",
    hint: "Það sem eigandi á að gera milli tíma.",
  },
  {
    key: "prognosis",
    label: "Framvinda / horfur",
    hint: "Hvað má búast við og hvað þarf að fylgjast með.",
  },
  {
    key: "followUp",
    label: "Næstu skref",
    hint: "Endurhæfingartímar, tíðni og áherslur.",
  },
];

export function staffName() {
  return process.env.CLINIC_STAFF_NAME || "Kolbrún Arna";
}

export function progressLabel(value: string) {
  switch (value) {
    case "BETTER":
      return "Betri";
    case "STABLE":
      return "Óbreytt";
    case "WORSE":
      return "Verra";
    default:
      return "Ómetið";
  }
}

export function visitTypeLabel(value: string) {
  switch (value) {
    case "INTAKE":
      return "Fyrsta koma";
    case "REHAB":
      return "Endurhæfing";
    default:
      return "Athugasemd";
  }
}

export function sexLabel(value: string) {
  switch (value) {
    case "MALE":
      return "Karlkyns";
    case "FEMALE":
      return "Kvenkyns";
    default:
      return "Óskráð";
  }
}

export function bookingStatusLabel(status: string) {
  const map: Record<string, string> = {
    confirmed: "Staðfest",
    pending: "Í bið",
    scheduled: "Bókað",
    "in-progress": "Í gangi",
    completed: "Lokið",
    cancelled: "Aflýst",
    canceled: "Aflýst",
    rescheduled: "Endurbókað",
    no_show: "Mætti ekki",
    SCHEDULED: "Bókað",
    IN_PROGRESS: "Í gangi",
    COMPLETED: "Lokið",
    CANCELLED: "Aflýst",
    RESCHEDULED: "Endurbókað",
    NO_SHOW: "Mætti ekki",
  };
  return map[status] || status;
}
