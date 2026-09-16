import { createOwnerAction } from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/clinic/page-chrome";
import { OwnerFields } from "@/components/clinic/record-fields";

export default function NewOwnerPage() {
  return (
    <div>
      <PageHeader
        title="Nýr eigandi"
        description="Skráðu viðskiptavininn sem kemur með hundinn. Allar upplýsingar fylgja sjúkraskránni."
      />
      <Card>
        <CardHeader>
          <CardTitle>Eigandi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOwnerAction} className="space-y-6">
            <OwnerFields />
            <Button type="submit">Vista eiganda</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
