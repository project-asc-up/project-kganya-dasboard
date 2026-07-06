import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  buildKganyaEmbeddingDispatchPayload,
  signKganyaEmbeddingDispatchPayload,
  type KganyaEmbeddingDispatchJobInput,
} from "@/lib/kganya-embedding-dispatch";
import { getKganyaPrismaClient } from "@/lib/kganya-prisma";

type DispatchOptions = {
  limit: number;
  outPath: string;
  webhookUrl: string | null;
  webhookSecret: string | null;
};

function parseOptions(argv: string[]): DispatchOptions {
  const getValue = (name: string): string | null => {
    const prefix = `${name}=`;
    const match = argv.find((value) => value.startsWith(prefix));
    return match ? match.slice(prefix.length) : null;
  };

  const parsedLimit = Number(getValue("--limit") ?? "25");
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 25;

  return {
    limit,
    outPath: getValue("--out") ?? join(process.cwd(), ".tmp", "kganya-embedding-dispatch.json"),
    webhookUrl: process.env.KGANYA_EMBEDDING_WEBHOOK_URL ?? process.env.N8N_EMBEDDING_WEBHOOK_URL ?? null,
    webhookSecret: process.env.KGANYA_EMBEDDING_WEBHOOK_SECRET ?? null,
  };
}

async function runWithRetry<T>(operation: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;
      if (code !== "ETIMEDOUT" || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError;
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const prisma = getKganyaPrismaClient();

  const pendingJobs = await runWithRetry(
    () =>
      prisma.ingestionJob.findMany({
        where: {
          jobType: "embedding",
          state: "pending",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: options.limit,
        select: {
          id: true,
          organization: {
            select: {
              id: true,
              clerkOrgId: true,
              name: true,
              slug: true,
            },
          },
          knowledgeSource: {
            select: {
              id: true,
              sourceKey: true,
              sourceFamily: true,
              sourceType: true,
              title: true,
              canonicalRef: true,
              originalUri: true,
              originalPath: true,
            },
          },
          sourceRecord: {
            select: {
              id: true,
              recordKey: true,
              topic: true,
              sourceKind: true,
              title: true,
              bodyMarkdown: true,
              bodyJson: true,
              sourceUrl: true,
              sourceAnchor: true,
              version: true,
              checksum: true,
              fields: {
                orderBy: {
                  fieldOrder: "asc",
                },
                select: {
                  fieldName: true,
                  fieldValue: true,
                  fieldType: true,
                  fieldOrder: true,
                  isKey: true,
                },
              },
              chunks: {
                orderBy: {
                  chunkIndex: "asc",
                },
                select: {
                  chunkIndex: true,
                  chunkType: true,
                  sourceFamily: true,
                  topic: true,
                  title: true,
                  sectionPath: true,
                  chunkText: true,
                  chunkHash: true,
                  active: true,
                },
              },
            },
          },
        },
      }),
    3,
  );

  const jobs: KganyaEmbeddingDispatchJobInput[] = pendingJobs
    .filter(
      (job): job is (typeof job & { sourceRecord: NonNullable<typeof job.sourceRecord> }) =>
        job.sourceRecord !== null,
    )
    .map((job) => ({
      id: job.id,
      organization: job.organization,
      knowledgeSource: job.knowledgeSource,
      sourceRecord: job.sourceRecord,
    }));

  const payload = buildKganyaEmbeddingDispatchPayload(jobs);

  await mkdir(join(process.cwd(), ".tmp"), { recursive: true });
  await writeFile(options.outPath, JSON.stringify(payload, null, 2));

  if (!options.webhookUrl) {
    console.log(
      JSON.stringify(
        {
          dispatched: false,
          reason: "KGANYA_EMBEDDING_WEBHOOK_URL is not configured",
          outPath: options.outPath,
          jobCount: payload.jobCount,
          checksum: payload.checksum,
        },
        null,
        2,
      ),
    );
    await prisma.$disconnect();
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-kganya-batch-id": payload.batchId,
      "x-kganya-checksum": payload.checksum,
    };

    if (options.webhookSecret) {
      headers["x-kganya-signature"] = signKganyaEmbeddingDispatchPayload(payload, options.webhookSecret);
    }

    const response = await fetch(options.webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Kganya embedding webhook rejected the batch (${response.status}): ${responseText}`);
    }

    const dispatchedAt = new Date();
    await runWithRetry(
      () =>
        prisma.ingestionJob.updateMany({
          where: {
            id: {
              in: pendingJobs.map((job) => job.id),
            },
            jobType: "embedding",
            state: "pending",
          },
          data: {
            state: "queued",
            startedAt: dispatchedAt,
          },
        }),
      3,
    );

    console.log(
      JSON.stringify(
        {
          dispatched: true,
          webhookUrl: options.webhookUrl,
          outPath: options.outPath,
          jobCount: payload.jobCount,
          checksum: payload.checksum,
          queuedJobCount: pendingJobs.length,
        },
        null,
        2,
      ),
    );
  } finally {
    clearTimeout(timeout);
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
  try {
    const prisma = getKganyaPrismaClient();
    await prisma.$disconnect();
  } catch {}
});
