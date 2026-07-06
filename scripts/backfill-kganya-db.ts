import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  buildKganyaImportBundle,
} from "@/lib/kganya-import";
import { getKganyaPrismaClient } from "@/lib/kganya-prisma";
import { Prisma } from "@/generated/kganya-prisma/client";

async function listBackfillFiles(root: string): Promise<Array<{ path: string; contents: string }>> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: Array<{ path: string; contents: string }> = [];

  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listBackfillFiles(fullPath)));
      continue;
    }

    if (!entry.name.endsWith(".md") && !entry.name.endsWith(".csv")) {
      continue;
    }

    files.push({
      path: fullPath,
      contents: await readFile(fullPath, "utf8"),
    });
  }

  return files;
}

async function ensureOrganization(prisma: ReturnType<typeof getKganyaPrismaClient>) {
  const clerkOrgId = process.env.KGANYA_CLERK_ORG_ID ?? "up-student-support";
  const slug = process.env.KGANYA_ORG_SLUG ?? "up-student-support";
  const name = process.env.KGANYA_ORG_NAME ?? "UP Student Support";

  const existing = await prisma.organization.findFirst({
    where: { clerkOrgId },
  });

  if (existing) {
    return prisma.organization.update({
      where: { id: existing.id },
      data: {
        name,
        slug,
        status: "active",
      },
    });
  }

  return prisma.organization.create({
    data: {
      clerkOrgId,
      name,
      slug,
      status: "active",
    },
  });
}

async function upsertKnowledgeSource(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  organizationId: string,
  draft: {
    sourceKey: string;
    sourceFamily: string;
    sourceType: string;
    title: string;
    canonicalRef: string;
    originalPath: string;
    status: string;
    lastVerifiedAt: string | null;
  },
) {
  const existing = await prisma.knowledgeSource.findFirst({
    where: {
      organizationId,
      sourceKey: draft.sourceKey,
    },
  });

  const data = {
    sourceKey: draft.sourceKey,
    sourceFamily: draft.sourceFamily,
    sourceType: draft.sourceType,
    title: draft.title,
    canonicalRef: draft.canonicalRef,
    originalPath: draft.originalPath,
    status: draft.status,
    lastVerifiedAt: draft.lastVerifiedAt ? new Date(draft.lastVerifiedAt) : null,
  };

  if (existing) {
    return prisma.knowledgeSource.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.knowledgeSource.create({
    data: {
      organizationId,
      ...data,
    },
  });
}

async function upsertSourceRecord(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  organizationId: string,
  knowledgeSourceId: string,
  draft: {
    recordKey: string;
    topic: string;
    sourceKind: string;
    title: string;
    bodyMarkdown: string | null;
    bodyJson: Record<string, unknown> | null;
    sourceUrl: string | null;
    sourceAnchor: string | null;
    version: number;
    status: string;
    active: boolean;
    checksum: string;
    createdBy: string | null;
  },
) {
  const existing = await prisma.sourceRecord.findFirst({
    where: {
      organizationId,
      knowledgeSourceId,
      recordKey: draft.recordKey,
      version: draft.version,
    },
  });

  const bodyJson =
    draft.bodyJson === null ? Prisma.JsonNull : (draft.bodyJson as Prisma.InputJsonValue);

  const data = {
    recordKey: draft.recordKey,
    topic: draft.topic,
    sourceKind: draft.sourceKind,
    title: draft.title,
    bodyMarkdown: draft.bodyMarkdown,
    bodyJson,
    sourceUrl: draft.sourceUrl,
    sourceAnchor: draft.sourceAnchor,
    version: draft.version,
    status: draft.status,
    active: draft.active,
    checksum: draft.checksum,
    createdBy: draft.createdBy,
  };

  if (existing) {
    return prisma.sourceRecord.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.sourceRecord.create({
    data: {
      organizationId,
      knowledgeSourceId,
      ...data,
    },
  });
}

async function replaceSourceRecordFields(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  sourceRecordId: string,
  fields: Array<{
    fieldName: string;
    fieldValue: string;
    fieldType: string;
    fieldOrder: number;
    isKey: boolean;
  }>,
) {
  await prisma.sourceRecordField.deleteMany({
    where: { sourceRecordId },
  });

  if (fields.length === 0) {
    return;
  }

  await prisma.sourceRecordField.createMany({
    data: fields.map((field) => ({
      sourceRecordId,
      fieldName: field.fieldName,
      fieldValue: field.fieldValue,
      fieldType: field.fieldType,
      fieldOrder: field.fieldOrder,
      isKey: field.isKey,
    })),
  });
}

async function replaceDocumentChunks(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  sourceRecordId: string,
  organizationId: string,
  knowledgeSourceId: string,
  version: number,
  chunks: Array<{
    chunkIndex: number;
    chunkType: string;
    sourceFamily: string;
    topic: string;
    title: string;
    sectionPath: string | null;
    chunkText: string;
    chunkHash: string;
    active: boolean;
    embeddingModel: string;
  }>,
) {
  await prisma.$executeRaw`
    DELETE FROM "document_chunks"
    WHERE "source_record_id" = ${sourceRecordId}
  `;

  if (chunks.length === 0) {
    return;
  }

  for (const chunk of chunks) {
    await prisma.$executeRaw`
      INSERT INTO "document_chunks" (
        "id",
        "organization_id",
        "knowledge_source_id",
        "source_record_id",
        "version",
        "chunk_index",
        "chunk_type",
        "source_family",
        "topic",
        "title",
        "section_path",
        "chunk_text",
        "chunk_hash",
        "embedding",
        "embedding_model",
        "active",
        "created_at",
        "updated_at"
      ) VALUES (
        ${randomUUID()},
        ${organizationId},
        ${knowledgeSourceId},
        ${sourceRecordId},
        ${version},
        ${chunk.chunkIndex},
        ${chunk.chunkType},
        ${chunk.sourceFamily},
        ${chunk.topic},
        ${chunk.title},
        ${chunk.sectionPath},
        ${chunk.chunkText},
        ${chunk.chunkHash},
        ${null},
        ${chunk.embeddingModel},
        ${chunk.active},
        NOW(),
        NOW()
      )
    `;
  }
}

async function upsertEvaluationSet(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  organizationId: string,
  draft: { name: string; sourceName: string; status: string },
) {
  const existing = await prisma.evaluationSet.findFirst({
    where: {
      organizationId,
      name: draft.name,
    },
  });

  const data = {
    sourceName: draft.sourceName,
    status: draft.status,
  };

  if (existing) {
    return prisma.evaluationSet.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.evaluationSet.create({
    data: {
      organizationId,
      ...data,
      name: draft.name,
    },
  });
}

async function replaceEvaluationCases(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  evaluationSetId: string,
  cases: Array<{
    promptText: string;
    expectedCategory: string;
    expectedAnswerTrait: string;
    expectedSourceKey: string | null;
    expectedChunkHint: string | null;
    status: string;
  }>,
) {
  await prisma.evaluationCase.deleteMany({
    where: { evaluationSetId },
  });

  if (cases.length === 0) {
    return [];
  }

  return prisma.evaluationCase.createMany({
    data: cases.map((item) => ({
      evaluationSetId,
      promptText: item.promptText,
      expectedCategory: item.expectedCategory,
      expectedAnswerTrait: item.expectedAnswerTrait,
      expectedSourceKey: item.expectedSourceKey,
      expectedChunkHint: item.expectedChunkHint,
      status: item.status,
    })),
  });
}

async function upsertRetrievalMetric(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  organizationId: string,
  draft: {
    metricKey: string;
    metricValue: number;
    thresholdValue: number | null;
    observedAt: string;
  },
) {
  const existing = await prisma.retrievalMetric.findFirst({
    where: {
      organizationId,
      metricKey: draft.metricKey,
      observedAt: new Date(draft.observedAt),
    },
  });

  const data = {
    metricKey: draft.metricKey,
    metricValue: draft.metricValue,
    thresholdValue: draft.thresholdValue,
    observedAt: new Date(draft.observedAt),
  };

  if (existing) {
    return prisma.retrievalMetric.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.retrievalMetric.create({
    data: {
      organizationId,
      ...data,
    },
  });
}

async function upsertEmbeddingJob(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  organizationId: string,
  knowledgeSourceId: string,
  sourceRecordId: string,
  draft: {
    inputChecksum: string;
    retryCount: number;
  },
) {
  const existing = await prisma.ingestionJob.findFirst({
    where: {
      organizationId,
      knowledgeSourceId,
      sourceRecordId,
      jobType: "embedding",
    },
  });

  const data = {
    jobType: "embedding",
    state: "pending",
    inputChecksum: draft.inputChecksum,
    outputChecksum: null,
    errorMessage: null,
    retryCount: draft.retryCount,
    startedAt: null,
    finishedAt: null,
  };

  if (existing) {
    return prisma.ingestionJob.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.ingestionJob.create({
    data: {
      organizationId,
      knowledgeSourceId,
      sourceRecordId,
      ...data,
    },
  });
}

async function upsertPromptPack(
  prisma: ReturnType<typeof getKganyaPrismaClient>,
  organizationId: string,
) {
  const name = "default-pilot";
  const existing = await prisma.promptPack.findFirst({
    where: { organizationId, name, version: 1 },
  });

  const data = {
    channel: "web-and-whatsapp",
    systemPrompt:
      "Answer as the UP student support knowledge assistant. Be direct, cite the knowledge base, and keep the first answer short.",
    stylePrompt:
      "Prefer clear steps, mention the portal first when relevant, and keep the response usable in Chatwoot.",
    fallbackPrompt:
      "If the answer is not in the knowledge base, say what is missing and suggest the next staff action.",
    active: true,
    version: 1,
  };

  if (existing) {
    return prisma.promptPack.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.promptPack.create({
    data: {
      organizationId,
      name,
      ...data,
    },
  });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const repoRoot = process.cwd();
  const kbRoot = join(repoRoot, "..", "kganya-operating-system", "knowledge-base");
  const files = await listBackfillFiles(kbRoot);
  const bundle = buildKganyaImportBundle(files);

  const preview = {
    apply,
    knowledgeSources: bundle.knowledgeSources.length,
    sourceRecords: bundle.sourceRecords.length,
    sourceRecordFields: bundle.sourceRecordFields.length,
    documentChunks: bundle.documentChunks.length,
    evaluationSets: bundle.evaluationSets.length,
    evaluationCases: bundle.evaluationSets.reduce((count, set) => count + set.cases.length, 0),
    retrievalMetrics: bundle.retrievalMetrics.length,
  };

  if (!apply) {
    console.log(JSON.stringify(preview, null, 2));
    return;
  }

  const prisma = getKganyaPrismaClient();
  const organization = await ensureOrganization(prisma);

  const knowledgeSourceByKey = new Map<string, { id: string; sourceKey: string }>();

  for (const draft of bundle.knowledgeSources) {
    const knowledgeSource = await upsertKnowledgeSource(prisma, organization.id, draft);
    knowledgeSourceByKey.set(draft.sourceKey, {
      id: knowledgeSource.id,
      sourceKey: draft.sourceKey,
    });
  }

  let sourceRecordCount = 0;
  let documentChunkCount = 0;
  let embeddingJobCount = 0;
  for (const draft of bundle.sourceRecords) {
    const knowledgeSource = knowledgeSourceByKey.get(draft.sourceKey);
    if (!knowledgeSource) {
      throw new Error(`Missing knowledge source for source record key: ${draft.sourceKey}`);
    }

    const sourceRecord = await upsertSourceRecord(prisma, organization.id, knowledgeSource.id, draft);
    sourceRecordCount += 1;

    const fields = bundle.sourceRecordFields.filter(
      (field) => field.sourceKey === draft.sourceKey && field.recordKey === draft.recordKey,
    );
    await replaceSourceRecordFields(prisma, sourceRecord.id, fields);

    const chunks = bundle.documentChunks.filter(
      (chunk) => chunk.sourceKey === draft.sourceKey && chunk.recordKey === draft.recordKey,
    );
    await replaceDocumentChunks(
      prisma,
      sourceRecord.id,
      organization.id,
      knowledgeSource.id,
      draft.version,
      chunks,
    );
    documentChunkCount += chunks.length;

    if (chunks.length > 0) {
      await upsertEmbeddingJob(prisma, organization.id, knowledgeSource.id, sourceRecord.id, {
        inputChecksum: draft.checksum,
        retryCount: 0,
      });
      embeddingJobCount += 1;
    }
  }

  let evaluationCaseCount = 0;
  for (const evaluationSetDraft of bundle.evaluationSets) {
    const evaluationSet = await upsertEvaluationSet(prisma, organization.id, evaluationSetDraft);
    await replaceEvaluationCases(prisma, evaluationSet.id, evaluationSetDraft.cases);
    evaluationCaseCount += evaluationSetDraft.cases.length;
  }

  let retrievalMetricCount = 0;
  for (const metricDraft of bundle.retrievalMetrics) {
    await upsertRetrievalMetric(prisma, organization.id, metricDraft);
    retrievalMetricCount += 1;
  }

  await upsertPromptPack(prisma, organization.id);

  const result = {
    ...preview,
    organizationId: organization.id,
    sourceRecordsWritten: sourceRecordCount,
    sourceRecordFieldsWritten: bundle.sourceRecordFields.length,
    documentChunksWritten: documentChunkCount,
    embeddingJobsWritten: embeddingJobCount,
    evaluationCasesWritten: evaluationCaseCount,
    retrievalMetricsWritten: retrievalMetricCount,
    promptPackWritten: true,
    vectorBackfillPending: true,
  };

  const outDir = join(repoRoot, ".tmp");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "kganya-backfill-applied.json"), JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
}

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

      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }

  throw lastError;
}

runWithRetry(main, 3).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
