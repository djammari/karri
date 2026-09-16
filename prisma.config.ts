import "dotenv/config";
import { defineConfig } from "prisma/config";

function databaseUrl() {
  const url =
    process.env.DIRECT_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim();
  if (url) return url;
  if (process.env.VERCEL) {
    throw new Error(
      "Postgres URL missing at build time. On the Vercel project, set POSTGRES_URL_NON_POOLING (and POSTGRES_PRISMA_URL / POSTGRES_URL). Enable them for Production, Preview, and Development. Do not delete env vars on the old Darrwin project.",
    );
  }
  return "postgresql://ostodvandi:ostodvandi@127.0.0.1:5432/ostodvandi";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl(),
  },
});
