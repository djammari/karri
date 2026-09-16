"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl">Villa í kerfinu</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "Eitthvað fór úrskeiðis. Reyndu aftur."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 text-sm text-primary"
      >
        Reyna aftur
      </button>
    </div>
  );
}
