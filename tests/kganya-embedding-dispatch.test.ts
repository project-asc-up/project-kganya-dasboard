import assert from "node:assert/strict";
import test from "node:test";

import {
  buildKganyaEmbeddingDispatchPayload,
  projectKganyaEmbeddingDispatchJob,
  signKganyaEmbeddingDispatchPayload,
} from "@/lib/kganya-embedding-dispatch";

const jobInput = {
  id: "job-1",
  organization: {
    id: "org-1",
    clerkOrgId: "clerk-org-1",
    name: "UP Support",
    slug: "up-support",
  },
  knowledgeSource: {
    id: "source-1",
    sourceKey: "knowledge-base-fees",
    sourceFamily: "fees",
    sourceType: "markdown",
    title: "Fees",
    canonicalRef: "knowledge-base/fees.md",
    originalUri: null,
    originalPath: "knowledge-base/fees.md",
  },
  sourceRecord: {
    id: "record-1",
    recordKey: "document",
    topic: "fees",
    sourceKind: "markdown",
    title: "Fees",
    bodyMarkdown: "# Fees\n\nPay on time.",
    bodyJson: { kind: "markdown" },
    sourceUrl: null,
    sourceAnchor: null,
    version: 1,
    checksum: "abc123",
    fields: [
      {
        fieldName: "title",
        fieldValue: "Fees",
        fieldType: "text",
        fieldOrder: 1,
        isKey: false,
      },
      {
        fieldName: "slug",
        fieldValue: "fees",
        fieldType: "text",
        fieldOrder: 0,
        isKey: true,
      },
    ],
    chunks: [
      {
        chunkIndex: 1,
        chunkType: "markdown-paragraph",
        sourceFamily: "fees",
        topic: "fees",
        title: "Fees",
        sectionPath: "Fees",
        chunkText: "Pay on time.",
        chunkHash: "hash-2",
        active: true,
      },
      {
        chunkIndex: 0,
        chunkType: "markdown-section",
        sourceFamily: "fees",
        topic: "fees",
        title: "Fees",
        sectionPath: "Fees",
        chunkText: "# Fees",
        chunkHash: "hash-1",
        active: true,
      },
    ],
  },
};

test("projectKganyaEmbeddingDispatchJob sorts fields and chunks", () => {
  const projected = projectKganyaEmbeddingDispatchJob(jobInput);

  assert.equal(projected.jobId, "job-1");
  assert.equal(projected.chunkCount, 2);
  assert.equal(projected.sourceRecord.fields[0].fieldName, "slug");
  assert.equal(projected.chunks[0].chunkIndex, 0);
});

test("buildKganyaEmbeddingDispatchPayload is deterministic for supplied batch metadata", () => {
  const payload = buildKganyaEmbeddingDispatchPayload([jobInput], {
    batchId: "batch-1",
    generatedAt: "2026-07-06T00:00:00.000Z",
  });

  assert.equal(payload.batchId, "batch-1");
  assert.equal(payload.generatedAt, "2026-07-06T00:00:00.000Z");
  assert.equal(payload.jobCount, 1);
  assert.equal(payload.source, "kganya");
  assert.match(payload.checksum, /^[a-f0-9]{64}$/);
});

test("signKganyaEmbeddingDispatchPayload signs the payload body", () => {
  const payload = buildKganyaEmbeddingDispatchPayload([jobInput], {
    batchId: "batch-2",
    generatedAt: "2026-07-06T00:00:00.000Z",
  });

  const signature = signKganyaEmbeddingDispatchPayload(payload, "secret");

  assert.match(signature, /^[a-f0-9]{64}$/);
  assert.notEqual(signature, payload.checksum);
});
