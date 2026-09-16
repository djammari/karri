/**
 * Env names from the old Darrwin/Vercel project keep working.
 * Do not require new secrets if POSTGRES_* / NEXTAUTH_* / SESAMI_* already exist.
 */
export function postgresUrl() {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ""
  );
}

export function postgresDirectUrl() {
  return (
    process.env.DIRECT_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    postgresUrl()
  );
}

export function appUrl() {
  const explicit =
    process.env.APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://127.0.0.1:4317";
}

export function authSecret() {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "local-dev-only-ostodvandi"
  );
}
