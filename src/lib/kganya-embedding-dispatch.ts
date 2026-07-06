import { createHash, createHmac, randomUUID } from "node:crypto";

export interface KganyaEmbeddingDispatchField {
  fieldName: string;
  fieldValue: string;
  fieldType: string;
  fieldOrder: number;
  isKey: boolean;
}

export interface KganyaEmbeddingDispatchChunk {
  chunkIndex: number;
  chunkType: string;
  sourceFamily: string;
  topic: string;
  title: string;
  sectionPath: string | null;
  chunkText: string;
  chunkHash: string;
  active: boolean;
}

export interface KganyaEmbeddingDispatchJobInput {
  id: string;
  organization: {
    id: string;
    clerkOrgId: string;
    name: string;
    slug: string;
  };
  knowledgeSource: {
    id: string;
    sourceKey: string;
    sourceFamily: string;
    sourceType: string;
    title: string;
    canonicalRef: string | null;
    originalUri: string | null;
    originalPath: string | null;
  };
  sourceRecord: {
    id: string;
    recordKey: string;
    topic: string;
    sourceKind: string;
    title: string;
    bodyMarkdown: string | null;
    bodyJson: unknown;
    sourceUrl: string | null;
    sourceAnchor: string | null;
    version: number;
    checksum: string | null;
    fields: KganyaEmbeddingDispatchField[];
    chunks: KganyaEmbeddingDispatchChunk[];
  };
}

export interface KganyaEmbeddingDispatchJob {
  jobId: string;
  organization: KganyaEmbeddingDispatchJobInput["organization"];
  knowledgeSource: KganyaEmbeddingDispatchJobInput["knowledgeSource"];
  sourceRecord: {
    id: string;
    recordKey: string;
    topic: string;
    sourceKind: string;
    title: string;
    version: number;
    checksum: string | null;
    sourceUrl: string | null;
    sourceAnchor: string | null;
    bodyMarkdown: string | null;
    bodyJson: unknown;
    fields: KganyaEmbeddingDispatchField[];
  };
  chunks: KganyaEmbeddingDispatchChunk[];
  chunkCount: number;
}

export interface KganyaEmbeddingDispatchPayload {
  batchId: string;
  source: "kganya";
  generatedAt: string;
  jobCount: number;
  jobs: KganyaEmbeddingDispatchJob[];
  checksum: string;
}

export function buildKganyaEmbeddingDispatchPayload(
  jobs: KganyaEmbeddingDispatchJobInput[],
  options?: {
    batchId?: string;
    generatedAt?: string;
  },
): KganyaEmbeddingDispatchPayload {
  const projectedJobs = jobs.map(projectKganyaEmbeddingDispatchJob);
  const batchId = options?.batchId ?? randomUUID();
  const generatedAt = options?.generatedAt ?? new Date().toISOString();

  const payloadWithoutChecksum = {
    batchId,
    source: "kganya" as const,
    generatedAt,
    jobCount: projectedJobs.length,
    jobs: projectedJobs,
  };

  return {
    ...payloadWithoutChecksum,
    checksum: createHash("sha256")
      .update(JSON.stringify(payloadWithoutChecksum))
      .digest("hex"),
  };
}

export function projectKganyaEmbeddingDispatchJob(
  job: KganyaEmbeddingDispatchJobInput,
): KganyaEmbeddingDispatchJob {
  const fields = [...job.sourceRecord.fields].sort((left, right) => left.fieldOrder - right.fieldOrder);
  const chunks = [...job.sourceRecord.chunks].sort((left, right) => left.chunkIndex - right.chunkIndex);

  return {
    jobId: job.id,
    organization: job.organization,
    knowledgeSource: job.knowledgeSource,
    sourceRecord: {
      id: job.sourceRecord.id,
      recordKey: job.sourceRecord.recordKey,
      topic: job.sourceRecord.topic,
      sourceKind: job.sourceRecord.sourceKind,
      title: job.sourceRecord.title,
      version: job.sourceRecord.version,
      checksum: job.sourceRecord.checksum,
      sourceUrl: job.sourceRecord.sourceUrl,
      sourceAnchor: job.sourceRecord.sourceAnchor,
      bodyMarkdown: job.sourceRecord.bodyMarkdown,
      bodyJson: job.sourceRecord.bodyJson,
      fields,
    },
    chunks,
    chunkCount: chunks.length,
  };
}

export function signKganyaEmbeddingDispatchPayload(
  payload: KganyaEmbeddingDispatchPayload,
  secret: string,
): string {
  return createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
}
