import { CLINIC } from "@/lib/clinic";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs tracking-[0.18em] text-primary uppercase">
        {CLINIC.name}
      </p>
      <h1 className="mt-3 text-2xl">Fannst ekki</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Þessi síða er ekki til. Farðu til baka í yfirlit sjúkraskrárinnar.
      </p>
      <a href="/yfirlit" className="mt-4 text-sm text-primary">
        Yfirlit
      </a>
    </div>
  );
}
