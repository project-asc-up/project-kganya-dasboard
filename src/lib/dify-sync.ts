import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { Prisma } from "@/generated/prisma/client";
import { createDifyDocument, createDifyDocumentFromFile, deleteDifyDocument, updateDifyDocument, updateDifyDocumentFromFile } from "@/lib/dify-knowledge";
import { getPrismaClient } from "@/lib/prisma";

type DifySyncAction = "create" | "update" | "delete";
type DifySyncContentKind = "text" | "file";

type EnqueueDifySyncJobInput = {
  sourceTable: string;
  sourceId: string;
  action: DifySyncAction;
  contentKind: DifySyncContentKind;
  payload: Prisma.InputJsonValue;
  inputChecksum?: string | null;
};

export function buildDifySyncDedupeKey(input: Pick<EnqueueDifySyncJobInput, "sourceTable" | "sourceId" | "action" | "contentKind">) {
  return [input.sourceTable, input.sourceId, input.action, input.contentKind].join(":");
}

type StagedUploadManifest = {
  fileName: string;
  mimeType: string | null;
  stagedAt: string;
};

const STAGING_ROOT = resolve(process.cwd(), ".tmp", "dify-sync", "uploads");
const MAX_ATTEMPTS = 5;

function normalizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function jobNameFor(sourceTable: string, sourceId: string) {
  return `${sourceTable}:${sourceId}`;
}

export function buildResourceTextContent(input: {
  title: string;
  category: string;
  description: string | null;
  url: string;
  sourceUrl: string | null;
  notes: string | null;
}) {
  const lines = [
    `# ${input.title}`,
    "",
    `- Category: ${input.category}`,
    `- URL: ${input.url}`,
    input.sourceUrl ? `- Source URL: ${input.sourceUrl}` : null,
    input.notes ? `- Notes: ${input.notes}` : null,
    input.description ? "" : null,
    input.description ? input.description : null,
  ].filter((line): line is string => line !== null);

  return lines.join("\n").trim();
}

export async function stageResourceUpload(input: {
  sourceTable: string;
  sourceId: string;
  fileName: string;
  mimeType: string | null;
  bytes: Buffer;
}) {
  const safeFileName = normalizeName(input.fileName) || "upload.bin";
  const stageDir = join(STAGING_ROOT, input.sourceTable, input.sourceId);
  await mkdir(stageDir, { recursive: true });
  const filePath = join(stageDir, safeFileName);
  await writeFile(filePath, input.bytes);

  const manifest: StagedUploadManifest = {
    fileName: input.fileName,
    mimeType: input.mimeType,
    stagedAt: new Date().toISOString(),
  };

  await writeFile(join(stageDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  return { filePath, manifestPath: join(stageDir, "manifest.json") };
}

export async function getStagedResourceUpload(input: { sourceTable: string; sourceId: string }) {
  const stageDir = join(STAGING_ROOT, input.sourceTable, input.sourceId);
  const manifestPath = join(stageDir, "manifest.json");

  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as StagedUploadManifest;
    return {
      filePath: join(stageDir, normalizeName(manifest.fileName) || "upload.bin"),
      fileName: manifest.fileName,
      mimeType: manifest.mimeType,
    };
  } catch {
    return null;
  }
}

export async function upsertDifySyncMap(input: {
  sourceTable: string;
  sourceId: string;
  difyDocumentId?: string | null;
  syncStatus?: string;
  lastSyncedAt?: Date | null;
  lastError?: string | null;
}) {
  const prisma = getPrismaClient();
  return prisma.difySyncMap.upsert({
    where: {
      sourceTable_sourceId: {
        sourceTable: input.sourceTable,
        sourceId: input.sourceId,
      },
    },
    create: {
      sourceTable: input.sourceTable,
      sourceId: input.sourceId,
      difyDocumentId: input.difyDocumentId ?? null,
      syncStatus: input.syncStatus ?? "pending",
      lastSyncedAt: input.lastSyncedAt ?? null,
      lastError: input.lastError ?? null,
    },
    update: {
      difyDocumentId: input.difyDocumentId ?? undefined,
      syncStatus: input.syncStatus ?? undefined,
      lastSyncedAt: input.lastSyncedAt ?? undefined,
      lastError: input.lastError ?? undefined,
    },
  });
}

export async function enqueueDifySyncJob(input: EnqueueDifySyncJobInput) {
  const prisma = getPrismaClient();
  const dedupeKey = buildDifySyncDedupeKey(input);
  const existing = await prisma.difySyncJob.findFirst({
    where: { dedupeKey, status: { in: ["pending", "processing"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    if (existing.status === "pending") {
      return prisma.difySyncJob.update({
        where: { id: existing.id },
        data: { payload: input.payload, nextRetryAt: null, lastError: null },
      });
    }
    return existing;
  }
  const job = await prisma.difySyncJob.create({
    data: {
      sourceTable: input.sourceTable,
      sourceId: input.sourceId,
      syncAction: input.action,
      contentKind: input.contentKind,
      dedupeKey,
      status: "pending",
      payload: input.payload,
      attemptCount: 0,
      nextRetryAt: null,
    },
  });

  await upsertDifySyncMap({
    sourceTable: input.sourceTable,
    sourceId: input.sourceId,
    syncStatus: "pending",
    lastError: null,
  });

  return job;
}

export async function processPendingDifySyncJobs(limit = 10) {
  const prisma = getPrismaClient();
  const jobs = await prisma.difySyncJob.findMany({
    where: {
      status: "pending",
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results: Array<{ jobId: string; status: string }> = [];

  for (const job of jobs) {
    const claimed = await prisma.difySyncJob.updateMany({
      where: {
        id: job.id,
        status: "pending",
      },
      data: {
        status: "processing",
      },
    });

    if (claimed.count === 0) {
      continue;
    }

    try {
      const payload = (job.payload ?? {}) as Record<string, unknown>;
      const name = typeof payload.name === "string" ? payload.name : jobNameFor(job.sourceTable, job.sourceId);
      const contentKind = job.contentKind === "file" ? "file" : "text";

      let difyDocumentId: string | null = null;

      if (job.syncAction === "delete") {
        const map = await prisma.difySyncMap.findUnique({
          where: {
            sourceTable_sourceId: {
              sourceTable: job.sourceTable,
              sourceId: job.sourceId,
            },
          },
        });
        if (map?.difyDocumentId) {
          await deleteDifyDocument(map.difyDocumentId);
          difyDocumentId = map.difyDocumentId;
        }
      } else if (contentKind === "file") {
        const staged = await getStagedResourceUpload({ sourceTable: job.sourceTable, sourceId: job.sourceId });
        if (!staged) {
          throw new Error("Missing staged upload for Dify file sync");
        }
        if (job.syncAction === "create") {
          difyDocumentId = await createDifyDocumentFromFile({
            name,
            fileName: staged.fileName,
            filePath: staged.filePath,
            mimeType: staged.mimeType,
          });
        } else {
          const map = await prisma.difySyncMap.findUnique({
            where: {
              sourceTable_sourceId: {
                sourceTable: job.sourceTable,
                sourceId: job.sourceId,
              },
            },
          });
          if (!map?.difyDocumentId) {
            throw new Error("Missing Dify document id for file update");
          }
          await updateDifyDocumentFromFile(map.difyDocumentId, {
            name,
            fileName: staged.fileName,
            filePath: staged.filePath,
            mimeType: staged.mimeType,
          });
          difyDocumentId = map.difyDocumentId;
        }
      } else {
        const text = typeof payload.text === "string" ? payload.text : "";
        if (!text) {
          throw new Error("Missing text payload for Dify sync");
        }
        if (job.syncAction === "create") {
          difyDocumentId = await createDifyDocument(name, text);
        } else {
          const map = await prisma.difySyncMap.findUnique({
            where: {
              sourceTable_sourceId: {
                sourceTable: job.sourceTable,
                sourceId: job.sourceId,
              },
            },
          });
          if (!map?.difyDocumentId) {
            throw new Error("Missing Dify document id for text update");
          }
          await updateDifyDocument(map.difyDocumentId, name, text);
          difyDocumentId = map.difyDocumentId;
        }
      }

      const finishedAt = new Date();
      await prisma.difySyncMap.upsert({
        where: {
          sourceTable_sourceId: {
            sourceTable: job.sourceTable,
            sourceId: job.sourceId,
          },
        },
        create: {
          sourceTable: job.sourceTable,
          sourceId: job.sourceId,
          difyDocumentId,
          syncStatus: "synced",
          lastSyncedAt: finishedAt,
          lastError: null,
        },
        update: {
          difyDocumentId: difyDocumentId ?? undefined,
          syncStatus: "synced",
          lastSyncedAt: finishedAt,
          lastError: null,
        },
      });

      await prisma.difySyncJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          attemptCount: job.attemptCount,
          lastError: null,
          nextRetryAt: null,
        },
      });

      results.push({ jobId: job.id, status: "completed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Dify sync error";
      const nextAttempt = job.attemptCount + 1;
      const retryable = nextAttempt < MAX_ATTEMPTS;
      const nextRetryAt = retryable ? new Date(Date.now() + nextAttempt * 60_000) : null;

      await prisma.difySyncMap.upsert({
        where: {
          sourceTable_sourceId: {
            sourceTable: job.sourceTable,
            sourceId: job.sourceId,
          },
        },
        create: {
          sourceTable: job.sourceTable,
          sourceId: job.sourceId,
          syncStatus: "failed",
          lastError: message,
        },
        update: {
          syncStatus: "failed",
          lastError: message,
        },
      });

      await prisma.difySyncJob.update({
        where: { id: job.id },
        data: {
          status: retryable ? "pending" : "failed",
          attemptCount: nextAttempt,
          lastError: message,
          nextRetryAt,
        },
      });

      results.push({ jobId: job.id, status: retryable ? "pending" : "failed" });
    }
  }

  return results;
}
