import { randomUUID } from "node:crypto";

import { Prisma } from "@/generated/kganya-prisma/client";
import { getKganyaPrismaClient } from "@/lib/kganya-prisma";
import {
  buildSourceKey,
  hashText,
} from "@/lib/kganya-import";
import { resolveKganyaOrganization } from "@/lib/kganya-organization";

type UploadedResourceDocument = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string;
  extractionMode: "text" | "pdf" | "docx" | "image-ocr";
};

type PersistUploadedResourceDocumentInput = {
  resourceId: string;
  resourceTitle: string;
  category: string;
  sourceUrl: string | null;
  notes: string | null;
  createdBy: string | null;
  uploadedDocument: UploadedResourceDocument;
};

export async function extractUploadedResourceDocument(file: File): Promise<UploadedResourceDocument> {
  const fileName = file.name || "uploaded-document";
  const mimeType = file.type || "application/octet-stream";
  const sizeBytes = file.size;
  const lowerName = fileName.toLowerCase();
  const extension = lowerName.split(".").pop() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return {
      fileName,
      mimeType,
      sizeBytes,
      extractedText: await file.text(),
      extractionMode: "text",
    };
  }

  if (extension === "pdf") {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as { default?: (input: Buffer) => Promise<{ text: string }> }).default ??
      (pdfParseModule as unknown as (input: Buffer) => Promise<{ text: string }>);
    const parsed = await pdfParse(buffer);
    return {
      fileName,
      mimeType,
      sizeBytes,
      extractedText: parsed.text || "",
      extractionMode: "pdf",
    };
  }

  if (extension === "docx") {
    const mammothModule = await import("mammoth");
    const parsed = await mammothModule.extractRawText({ buffer });
    return {
      fileName,
      mimeType,
      sizeBytes,
      extractedText: parsed.value || "",
      extractionMode: "docx",
    };
  }

  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg"].includes(extension)) {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    try {
      const imageDataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      const result = await worker.recognize(imageDataUrl);
      return {
        fileName,
        mimeType,
        sizeBytes,
        extractedText: result.data.text || "",
        extractionMode: "image-ocr",
      };
    } finally {
      await worker.terminate();
    }
  }

  throw new Error("Unsupported file type. Use .md, .txt, .pdf, .docx, .png, .jpg, or .jpeg.");
}

export async function persistUploadedResourceDocument(
  input: PersistUploadedResourceDocumentInput,
) {
  const organization = await resolveKganyaOrganization();
  const prisma = getKganyaPrismaClient();
  const sourceKey = buildSourceKey(`resource-${input.resourceId}-${input.uploadedDocument.fileName}`);
  const recordKey = buildSourceKey(
    `resource-${input.resourceId}-${hashText(input.uploadedDocument.extractedText).slice(0, 16)}`,
  );
  const sourceType = "document";
  const normalizedText = input.uploadedDocument.extractedText.replace(/\r\n/g, "\n").trim();
  const fallbackDescription =
    input.uploadedDocument.extractionMode === "image-ocr"
      ? normalizedText.length > 0
        ? `Image OCR extracted ${normalizedText.length} characters from ${input.uploadedDocument.fileName}.`
        : `Image OCR did not detect readable text in ${input.uploadedDocument.fileName}.`
      : null;
  const contentSections = [
    `# ${input.resourceTitle}`,
    "",
    `- Resource ID: ${input.resourceId}`,
    `- Category: ${input.category}`,
    `- File: ${input.uploadedDocument.fileName}`,
    `- Mime type: ${input.uploadedDocument.mimeType}`,
    `- Size bytes: ${input.uploadedDocument.sizeBytes}`,
    `- Extraction mode: ${input.uploadedDocument.extractionMode}`,
    input.sourceUrl ? `- Source URL: ${input.sourceUrl}` : null,
    input.notes ? `- Notes: ${input.notes}` : null,
    fallbackDescription ? `- Summary: ${fallbackDescription}` : null,
    "",
    normalizedText || fallbackDescription || "No extractable text was found in the uploaded file.",
  ].filter((line): line is string => line !== null);
  const markdownBody = [
    ...contentSections,
  ].join("\n");
  const bodyJson = {
    kind: "uploaded-resource-document",
    resourceId: input.resourceId,
    fileName: input.uploadedDocument.fileName,
    mimeType: input.uploadedDocument.mimeType,
    sizeBytes: input.uploadedDocument.sizeBytes,
    extractionMode: input.uploadedDocument.extractionMode,
    extractedTextLength: normalizedText.length,
    summary: fallbackDescription,
    sourceUrl: input.sourceUrl,
    notes: input.notes,
  };

  const knowledgeSource = await prisma.knowledgeSource.upsert({
    where: {
      organizationId_sourceKey: {
        organizationId: organization.id,
        sourceKey,
      },
    },
    create: {
      organizationId: organization.id,
      sourceKey,
      sourceFamily: "resource-upload",
      sourceType,
      title: input.resourceTitle,
      canonicalRef: `resource:${input.resourceId}`,
      originalUri: input.sourceUrl,
      originalPath: input.uploadedDocument.fileName,
      status: "active",
      lastVerifiedAt: null,
    },
    update: {
      sourceFamily: "resource-upload",
      sourceType,
      title: input.resourceTitle,
      canonicalRef: `resource:${input.resourceId}`,
      originalUri: input.sourceUrl,
      originalPath: input.uploadedDocument.fileName,
      status: "active",
      lastVerifiedAt: null,
    },
  });

  const sourceRecord = await prisma.sourceRecord.findFirst({
    where: {
      organizationId: organization.id,
      knowledgeSourceId: knowledgeSource.id,
      recordKey,
      version: 1,
    },
  });

  const sourceRecordData = {
    recordKey,
    topic: input.category,
    sourceKind: "uploaded-document",
    title: input.resourceTitle,
    bodyMarkdown: markdownBody,
    bodyJson: bodyJson as Prisma.InputJsonValue,
    sourceUrl: input.sourceUrl,
    sourceAnchor: null,
    version: 1,
    status: "active",
    active: true,
    checksum: hashText(markdownBody),
    createdBy: input.createdBy,
  };

  const savedSourceRecord = sourceRecord
    ? await prisma.sourceRecord.update({
        where: { id: sourceRecord.id },
        data: sourceRecordData,
      })
    : await prisma.sourceRecord.create({
        data: {
          organizationId: organization.id,
          knowledgeSourceId: knowledgeSource.id,
          ...sourceRecordData,
        },
      });

  await prisma.sourceRecordField.deleteMany({
    where: { sourceRecordId: savedSourceRecord.id },
  });

  const fields = [
    {
      fieldName: "resourceId",
      fieldValue: input.resourceId,
      fieldType: "text",
      fieldOrder: 0,
      isKey: true,
    },
    {
      fieldName: "fileName",
      fieldValue: input.uploadedDocument.fileName,
      fieldType: "text",
      fieldOrder: 1,
      isKey: true,
    },
    {
      fieldName: "mimeType",
      fieldValue: input.uploadedDocument.mimeType,
      fieldType: "text",
      fieldOrder: 2,
      isKey: false,
    },
    {
      fieldName: "sizeBytes",
      fieldValue: String(input.uploadedDocument.sizeBytes),
      fieldType: "number",
      fieldOrder: 3,
      isKey: false,
    },
    {
      fieldName: "category",
      fieldValue: input.category,
      fieldType: "text",
      fieldOrder: 4,
      isKey: false,
    },
    {
      fieldName: "resourceTitle",
      fieldValue: input.resourceTitle,
      fieldType: "text",
      fieldOrder: 5,
      isKey: false,
    },
  ];

  await prisma.sourceRecordField.createMany({
    data: fields.map((field) => ({
      sourceRecordId: savedSourceRecord.id,
      fieldName: field.fieldName,
      fieldValue: field.fieldValue,
      fieldType: field.fieldType,
      fieldOrder: field.fieldOrder,
      isKey: field.isKey,
    })),
  });

  const chunks = splitUploadedDocumentIntoChunks({
    title: input.resourceTitle,
    contentText: markdownBody,
  });

  await prisma.$executeRaw`
    DELETE FROM "document_chunks"
    WHERE "source_record_id" = ${savedSourceRecord.id}
  `;

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
        ${organization.id},
        ${knowledgeSource.id},
        ${savedSourceRecord.id},
        ${1},
        ${chunk.chunkIndex},
        ${chunk.chunkType},
        ${"resource-upload"},
        ${input.category},
        ${input.resourceTitle},
        ${chunk.sectionPath},
        ${chunk.chunkText},
        ${chunk.chunkHash},
        ${null},
        ${"pending"},
        ${true},
        NOW(),
        NOW()
      )
    `;
  }

  const ingestionJob = await prisma.ingestionJob.findFirst({
    where: {
      organizationId: organization.id,
      knowledgeSourceId: knowledgeSource.id,
      sourceRecordId: savedSourceRecord.id,
      jobType: "resource-document-upload",
    },
  });

  const jobData = {
    jobType: "resource-document-upload",
    state: "completed",
    inputChecksum: hashText(markdownBody),
    outputChecksum: hashText(JSON.stringify({ chunks: chunks.length })),
    errorMessage: null,
    retryCount: 0,
    startedAt: new Date(),
    finishedAt: new Date(),
  };

  if (ingestionJob) {
    await prisma.ingestionJob.update({
      where: { id: ingestionJob.id },
      data: jobData,
    });
  } else {
    await prisma.ingestionJob.create({
      data: {
        organizationId: organization.id,
        knowledgeSourceId: knowledgeSource.id,
        sourceRecordId: savedSourceRecord.id,
        ...jobData,
      },
    });
  }

  return {
    organizationId: organization.id,
    sourceKey,
    recordKey,
    chunkCount: chunks.length,
  };
}

function splitUploadedDocumentIntoChunks(input: {
  title: string;
  contentText: string;
}) {
  const paragraphs = input.contentText
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunkTexts: string[] = [];

  for (const paragraph of paragraphs.length > 0 ? paragraphs : [input.contentText.trim()]) {
    if (!paragraph) {
      continue;
    }

    if (paragraph.length <= 1200) {
      chunkTexts.push(paragraph);
      continue;
    }

    let remaining = paragraph.trim();
    while (remaining.length > 0) {
      const window = remaining.slice(0, 1200);
      const breakPoint = Math.max(
        window.lastIndexOf(". "),
        window.lastIndexOf("! "),
        window.lastIndexOf("? "),
        window.lastIndexOf("\n"),
      );
      const splitAt = breakPoint > 400 ? breakPoint + 1 : 1200;
      const chunk = remaining.slice(0, splitAt).trim();
      if (chunk) {
        chunkTexts.push(chunk);
      }
      remaining = remaining.slice(splitAt).trim();
    }
  }

  return chunkTexts.map((chunkText, chunkIndex) => ({
    chunkIndex,
    chunkType: "document-section",
    sectionPath: `section-${chunkIndex + 1}`,
    chunkText,
    chunkHash: hashText(`${input.title}\n\n${chunkText}`),
  }));
}
