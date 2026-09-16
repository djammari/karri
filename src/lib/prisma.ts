import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { postgresUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrisma() {
  const url = postgresUrl();
  if (!url) {
    throw new Error(
      "Gagnagrunnstenging vantar. Settu DATABASE_URL, POSTGRES_PRISMA_URL eða POSTGRES_URL.",
    );
  }
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: url,
      max: 5,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma();
  }
  return globalForPrisma.prisma;
}
