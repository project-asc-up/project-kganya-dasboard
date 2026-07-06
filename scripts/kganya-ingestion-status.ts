import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getKganyaPrismaClient } from "@/lib/kganya-prisma";

type IngestionStatusRow = {
  organizations: number;
  knowledge_sources: number;
  source_records: number;
  document_chunks: number;
  ingestion_jobs: number;
  pending_embedding_jobs: number;
  queued_embedding_jobs: number;
  completed_embedding_jobs: number;
};

async function runWithRetry<T>(operation: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;
      const isRetryable = code === "ETIMEDOUT";

      if (!isRetryable || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError;
}

async function main() {
  const prisma = getKganyaPrismaClient();

  const rows = await runWithRetry(
    () =>
      prisma.$queryRaw<IngestionStatusRow[]>`
        SELECT
          (SELECT COUNT(*)::int FROM organizations) AS organizations,
          (SELECT COUNT(*)::int FROM knowledge_sources) AS knowledge_sources,
          (SELECT COUNT(*)::int FROM source_records) AS source_records,
          (SELECT COUNT(*)::int FROM document_chunks) AS document_chunks,
          (SELECT COUNT(*)::int FROM ingestion_jobs) AS ingestion_jobs,
          (SELECT COUNT(*)::int FROM ingestion_jobs WHERE job_type = 'embedding' AND state = 'pending') AS pending_embedding_jobs,
          (SELECT COUNT(*)::int FROM ingestion_jobs WHERE job_type = 'embedding' AND state = 'queued') AS queued_embedding_jobs,
          (SELECT COUNT(*)::int FROM ingestion_jobs WHERE job_type = 'embedding' AND state = 'completed') AS completed_embedding_jobs
      `,
    3,
  );

  const output = rows[0] ?? {
    organizations: 0,
    knowledge_sources: 0,
    source_records: 0,
    document_chunks: 0,
    ingestion_jobs: 0,
    pending_embedding_jobs: 0,
    queued_embedding_jobs: 0,
    completed_embedding_jobs: 0,
  };

  const outDir = join(process.cwd(), ".tmp");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "kganya-ingestion-status.json"), JSON.stringify(output, null, 2));

  console.log(JSON.stringify(output, null, 2));
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
  try {
    const prisma = getKganyaPrismaClient();
    await prisma.$disconnect();
  } catch {}
});
