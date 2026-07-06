import { PrismaClient } from "@/generated/kganya-prisma/client";

import { loadRepoEnv } from "@/lib/load-env";
import { createDatabaseAdapter } from "@/lib/db-adapter";

loadRepoEnv();

const globalForKganyaPrisma = globalThis as typeof globalThis & {
  kganyaPrisma?: PrismaClient;
};

function resolveUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL
  );
}

function createKganyaPrismaClient() {
  const url = resolveUrl();

  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = createDatabaseAdapter(url);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export function getKganyaPrismaClient() {
  if (!globalForKganyaPrisma.kganyaPrisma) {
    globalForKganyaPrisma.kganyaPrisma = createKganyaPrismaClient();
  }

  return globalForKganyaPrisma.kganyaPrisma;
}
