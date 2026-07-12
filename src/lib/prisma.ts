import { PrismaClient } from "@/generated/prisma/client";

import { loadRepoEnv } from "@/lib/load-env";
import { createDatabaseAdapter } from "@/lib/db-adapter";

loadRepoEnv();

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export function resolveDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  return (
    env.DATABASE_URL ||
    env.DATABASE_URL_UNPOOLED ||
    env.POSTGRES_URL_NON_POOLING ||
    env.POSTGRES_PRISMA_URL ||
    env.POSTGRES_URL ||
    env.DIRECT_URL
  );
}

function createPrismaClient() {
  const url = resolveDatabaseUrl();

  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = createDatabaseAdapter(url);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
