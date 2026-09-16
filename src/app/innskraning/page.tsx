import { loginAction } from "@/app/actions/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CLINIC } from "@/lib/clinic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const next = typeof params.next === "string" ? params.next : "/yfirlit";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs tracking-[0.18em] text-primary uppercase">
            Innra kerfi
          </p>
          <CardTitle className="font-display text-2xl">Óstöðvandi</CardTitle>
          <CardDescription>
            Sjúkraskrár fyrir sjúkraþjálfun hunda á {CLINIC.address}. Aðeins
            fyrir starfsfólk. Gögnin eru trúnaðarmál.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Innskráning tókst ekki</AlertTitle>
              <AlertDescription>
                Notandanafn eða lykilorð er rangt.
              </AlertDescription>
            </Alert>
          ) : null}
          <form action={loginAction} className="grid gap-4">
            <input type="hidden" name="next" value={next} />
            <div className="grid gap-1.5">
              <label htmlFor="username" className="text-sm">
                Notandanafn
              </label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="password" className="text-sm">
                Lykilorð
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="uppercase tracking-wider">
              Innskrá
            </Button>
            <p className="text-xs text-muted-foreground">
              Staðbundin sjálfgefin innskráning er <code>klinik</code> /{" "}
              <code>klinik</code>. Breytið því áður en raunverulegar
              sjúkraskrár eru vistaðar.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
