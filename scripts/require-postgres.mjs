const url =
  process.env.DIRECT_URL?.trim() ||
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

if (url) {
  process.exit(0);
}

console.error(`
Postgres URL missing on this Vercel project.

In Vercel → karri → Settings → Environment Variables, add (Production + Preview + Development):
  POSTGRES_URL_NON_POOLING
  POSTGRES_PRISMA_URL
  POSTGRES_URL

Copy them from the existing Darrwin Vercel project. Do not delete Darrwin's env vars.
Then Redeploy.
`);
process.exit(1);
