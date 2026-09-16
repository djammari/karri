import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/clinic/page-chrome";

type OwnerValues = {
  name?: string;
  kennitala?: string | null;
  email?: string | null;
  phone?: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  notes?: string | null;
};

export function OwnerFields({ owner }: { owner?: OwnerValues }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nafn eiganda" name="name">
        <Input id="name" name="name" required defaultValue={owner?.name} />
      </Field>
      <Field label="Sími" name="phone">
        <Input id="phone" name="phone" required defaultValue={owner?.phone} />
      </Field>
      <Field label="Netfang" name="email">
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={owner?.email ?? ""}
        />
      </Field>
      <Field label="Kennitala" name="kennitala">
        <Input
          id="kennitala"
          name="kennitala"
          defaultValue={owner?.kennitala ?? ""}
        />
      </Field>
      <Field label="Heimilisfang" name="address" className="md:col-span-2">
        <Input
          id="address"
          name="address"
          defaultValue={owner?.address ?? ""}
        />
      </Field>
      <Field label="Póstnúmer" name="postalCode">
        <Input
          id="postalCode"
          name="postalCode"
          defaultValue={owner?.postalCode ?? ""}
        />
      </Field>
      <Field label="Bær" name="city">
        <Input id="city" name="city" defaultValue={owner?.city ?? "Garðabær"} />
      </Field>
      <Field
        label="Athugasemdir"
        name="notes"
        className="md:col-span-2"
        hint="Samskipti, aðgengi, aðrir hundar á heimilinu."
      >
        <Textarea id="notes" name="notes" rows={3} defaultValue={owner?.notes ?? ""} />
      </Field>
    </div>
  );
}

type DogValues = {
  name?: string;
  breed?: string;
  sex?: string;
  birthDate?: Date | null;
  weightKg?: number | null;
  color?: string | null;
  chipNumber?: string | null;
  insurance?: string | null;
  vetName?: string | null;
  vetPhone?: string | null;
  activity?: string | null;
  diagnoses?: string | null;
  medications?: string | null;
  allergies?: string | null;
  notes?: string | null;
};

export function DogFields({ dog }: { dog?: DogValues }) {
  const birth = dog?.birthDate
    ? new Date(dog.birthDate).toISOString().slice(0, 10)
    : "";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nafn hunds" name="name">
        <Input id="name" name="name" required defaultValue={dog?.name} />
      </Field>
      <Field label="Kynþáttur" name="breed">
        <Input id="breed" name="breed" required defaultValue={dog?.breed} />
      </Field>
      <Field label="Kyn" name="sex">
        <select
          id="sex"
          name="sex"
          defaultValue={dog?.sex ?? "UNKNOWN"}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="UNKNOWN">Óskráð</option>
          <option value="MALE">Karlkyns</option>
          <option value="FEMALE">Kvenkyns</option>
        </select>
      </Field>
      <Field label="Fæðingardagur" name="birthDate">
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          defaultValue={birth}
        />
      </Field>
      <Field label="Þyngd (kg)" name="weightKg">
        <Input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.1"
          defaultValue={dog?.weightKg ?? ""}
        />
      </Field>
      <Field label="Litur" name="color">
        <Input id="color" name="color" defaultValue={dog?.color ?? ""} />
      </Field>
      <Field label="Örmerki" name="chipNumber">
        <Input
          id="chipNumber"
          name="chipNumber"
          defaultValue={dog?.chipNumber ?? ""}
        />
      </Field>
      <Field label="Trygging" name="insurance">
        <Input
          id="insurance"
          name="insurance"
          defaultValue={dog?.insurance ?? ""}
        />
      </Field>
      <Field label="Dýralæknir" name="vetName">
        <Input id="vetName" name="vetName" defaultValue={dog?.vetName ?? ""} />
      </Field>
      <Field label="Sími dýralæknis" name="vetPhone">
        <Input
          id="vetPhone"
          name="vetPhone"
          defaultValue={dog?.vetPhone ?? ""}
        />
      </Field>
      <Field
        label="Hreyfing / íþróttir"
        name="activity"
        className="md:col-span-2"
        hint="Canicross, hjól, göngur, skíði eða daglegt álag."
      >
        <Input id="activity" name="activity" defaultValue={dog?.activity ?? ""} />
      </Field>
      <Field label="Greiningar" name="diagnoses" className="md:col-span-2">
        <Textarea
          id="diagnoses"
          name="diagnoses"
          rows={3}
          defaultValue={dog?.diagnoses ?? ""}
        />
      </Field>
      <Field label="Lyf" name="medications">
        <Textarea
          id="medications"
          name="medications"
          rows={2}
          defaultValue={dog?.medications ?? ""}
        />
      </Field>
      <Field label="Ofnæmi" name="allergies">
        <Textarea
          id="allergies"
          name="allergies"
          rows={2}
          defaultValue={dog?.allergies ?? ""}
        />
      </Field>
      <Field label="Annað um hundinn" name="notes" className="md:col-span-2">
        <Textarea id="notes" name="notes" rows={3} defaultValue={dog?.notes ?? ""} />
      </Field>
    </div>
  );
}
