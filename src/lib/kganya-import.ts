import { createHash } from "node:crypto";
import { basename, extname } from "node:path";

import { parse as parseCsv } from "csv-parse/sync";

export interface KganyaMarkdownFrontmatter {
  title?: string;
  slug?: string;
  category?: string;
  audience?: string;
  last_verified?: string;
  source_priority?: string;
  tags?: string[] | string;
  related_files?: string[] | string;
}

export interface KganyaKnowledgeSourceDraft {
  sourceKey: string;
  sourceFamily: string;
  sourceType: string;
  title: string;
  canonicalRef: string;
  originalPath: string;
  status: string;
  lastVerifiedAt: string | null;
}

export interface KganyaSourceRecordDraft {
  sourceKey: string;
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
}

export interface KganyaSourceRecordFieldDraft {
  sourceKey: string;
  recordKey: string;
  fieldName: string;
  fieldValue: string;
  fieldType: string;
  fieldOrder: number;
  isKey: boolean;
}

export interface KganyaEvaluationCaseDraft {
  promptText: string;
  expectedCategory: string;
  expectedAnswerTrait: string;
  expectedSourceKey: string | null;
  expectedChunkHint: string | null;
  status: string;
}

export interface KganyaEvaluationSetDraft {
  name: string;
  sourceName: string;
  status: string;
  cases: KganyaEvaluationCaseDraft[];
}

export interface KganyaRetrievalMetricDraft {
  sourceKey: string;
  recordKey: string;
  metricKey: string;
  metricValue: number;
  thresholdValue: number | null;
  observedAt: string;
}

export interface KganyaDocumentChunkDraft {
  sourceKey: string;
  recordKey: string;
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
}

export interface KganyaImportBundle {
  knowledgeSources: KganyaKnowledgeSourceDraft[];
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
  evaluationSets: KganyaEvaluationSetDraft[];
  retrievalMetrics: KganyaRetrievalMetricDraft[];
}

interface ParsedMarkdownDocument {
  frontmatter: KganyaMarkdownFrontmatter;
  body: string;
}

export function parseMarkdownDocument(source: string): ParsedMarkdownDocument {
  const normalized = source.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return { frontmatter: {}, body: normalized.trim() };
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return { frontmatter: {}, body: normalized.trim() };
  }

  const frontmatterBlock = normalized.slice(4, closingIndex).trim();
  const body = normalized.slice(closingIndex + 5).trim();

  return {
    frontmatter: parseSimpleFrontmatter(frontmatterBlock),
    body,
  };
}

export function buildMarkdownImport(
  filePath: string,
  source: string,
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecord: KganyaSourceRecordDraft;
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
  chunks: string[];
} {
  const parsed = parseMarkdownDocument(source);
  const fileName = basename(filePath, extname(filePath));
  const title = parsed.frontmatter.title?.trim() || humanize(fileName);
  const category = parsed.frontmatter.category?.trim() || fileName;
  const lastVerifiedAt = parsed.frontmatter.last_verified?.trim() ?? null;
  const relativePath = normalizeRelativePath(filePath);
  const sourceKeyPath = relativePath.replace(extname(relativePath), "");
  const sourceKey = buildSourceKey(sourceKeyPath);

  const knowledgeSource: KganyaKnowledgeSourceDraft = {
    sourceKey,
    sourceFamily: category,
    sourceType: "markdown",
    title,
    canonicalRef: relativePath,
    originalPath: relativePath,
    status: "active",
    lastVerifiedAt,
  };

  const sourceRecord: KganyaSourceRecordDraft = {
    sourceKey,
    recordKey: "document",
    topic: category,
    sourceKind: "markdown",
    title,
    bodyMarkdown: parsed.body,
    bodyJson: {
      frontmatter: parsed.frontmatter,
      filePath: relativePath,
      fileName,
      kind: "markdown",
    },
    sourceUrl: null,
    sourceAnchor: null,
    version: 1,
    status: "active",
    active: true,
    checksum: hashText(parsed.body),
    createdBy: null,
  };

  const sourceRecordFields = Object.entries(parsed.frontmatter).map(([fieldName, value], index) => ({
    sourceKey,
    recordKey: "document",
    fieldName,
    fieldValue: stringifyFrontmatterValue(value),
    fieldType: Array.isArray(value) ? "json-array" : "text",
    fieldOrder: index,
    isKey: fieldName === "slug",
  }));

  return {
    knowledgeSource,
    sourceRecord,
    sourceRecordFields,
    documentChunks: buildMarkdownChunkDrafts({
      sourceKey,
      recordKey: sourceRecord.recordKey,
      sourceFamily: knowledgeSource.sourceFamily,
      topic: sourceRecord.topic,
      title,
      body: parsed.body,
    }),
    chunks: chunkMarkdownBody(parsed.body),
  };
}

export function parseSourceInventoryCsv(
  filePath: string,
  source: string,
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
} {
  return parseStructuredCsvImport(filePath, source, {
    sourceFamily: "inventory",
    sourceTitle: "Source Inventory",
    rowKind: "inventory-row",
    getRowKey: (row) => row.id ?? row.source ?? row.title,
    getTopic: (row) => row.category ?? "inventory",
    getTitle: (row) => row.title ?? row.name ?? row.source ?? "Unknown source",
    getSourceUrl: (row) => row.url ?? null,
    getSourceAnchor: (row) => row.id ?? null,
  });
}

export function parseFaqGoldSetCsv(
  filePath: string,
  source: string,
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
  evaluationSet: KganyaEvaluationSetDraft;
} {
  const structured = parseStructuredCsvImport(filePath, source, {
    sourceFamily: "evaluation",
    sourceTitle: "FAQ Gold Set",
    rowKind: "gold-set-row",
    getRowKey: (row) => row.prompt_id ?? row.id ?? row.prompt,
    getTopic: (row) => row.expected_category ?? row.category ?? "general",
    getTitle: (row) => row.prompt ?? row.question ?? "FAQ prompt",
    getSourceUrl: (row) => row.source ?? null,
    getSourceAnchor: (row) => row.prompt_id ?? null,
  });

  return {
    ...structured,
    evaluationSet: {
      name: "FAQ Gold Set",
      sourceName: basename(filePath),
      status: "active",
      cases: structured.sourceRecords.map((record) => {
        const row = record.bodyJson?.row as Record<string, string> | undefined;

        return {
          promptText: row?.prompt ?? row?.question ?? record.title,
          expectedCategory: row?.expected_category ?? row?.category ?? record.topic,
          expectedAnswerTrait: row?.expected_answer_trait ?? row?.expected_answer ?? "",
          expectedSourceKey: row?.source ?? null,
          expectedChunkHint: row?.prompt ?? row?.question ?? null,
          status: row?.status ?? "active",
        };
      }),
    },
  };
}

export function parseQuestionClustersCsv(
  filePath: string,
  source: string,
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
  evaluationSet: KganyaEvaluationSetDraft;
} {
  const structured = parseStructuredCsvImport(filePath, source, {
    sourceFamily: "evaluation",
    sourceTitle: "Question Clusters",
    rowKind: "question-cluster-row",
    getRowKey: (row) => row.cluster_id ?? row.id ?? row.question_pattern,
    getTopic: (row) => row.category ?? "general",
    getTitle: (row) => row.question_pattern ?? row.intent ?? "Question cluster",
    getSourceUrl: (row) => row.answer_source ?? null,
    getSourceAnchor: (row) => row.cluster_id ?? null,
  });

  return {
    ...structured,
    evaluationSet: {
      name: "Question Clusters",
      sourceName: basename(filePath),
      status: "active",
      cases: structured.sourceRecords.map((record) => {
        const row = record.bodyJson?.row as Record<string, string> | undefined;

        return {
          promptText: row?.question_pattern ?? record.title,
          expectedCategory: row?.category ?? record.topic,
          expectedAnswerTrait: row?.intent ?? "",
          expectedSourceKey: row?.answer_source ?? null,
          expectedChunkHint: row?.question_pattern ?? null,
          status: row?.status ?? "active",
        };
      }),
    },
  };
}

export function parseKpiBaselineCsv(
  filePath: string,
  source: string,
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
  retrievalMetrics: KganyaRetrievalMetricDraft[];
} {
  const structured = parseStructuredCsvImport(filePath, source, {
    sourceFamily: "metrics",
    sourceTitle: "KPI Baseline And Thresholds",
    rowKind: "kpi-row",
    getRowKey: (row) => row.metric_id ?? row.id ?? row.metric,
    getTopic: () => "metrics",
    getTitle: (row) => row.metric ?? "KPI metric",
    getSourceUrl: () => null,
    getSourceAnchor: (row) => row.metric_id ?? null,
  });

  return {
    ...structured,
    retrievalMetrics: structured.sourceRecords.flatMap((record) => {
      const row = record.bodyJson?.row as Record<string, string> | undefined;
      const observedAt = row?.last_edited ?? "2026-07-05";
      const parsedThreshold = parseNumericThreshold(row?.success_threshold ?? "");

      if (!row) {
        return [];
      }

      return [
        {
          sourceKey: record.sourceKey,
          recordKey: record.recordKey,
          metricKey: row.metric ?? record.title,
          metricValue: parsedThreshold ?? 0,
          thresholdValue: parsedThreshold,
          observedAt,
        },
      ];
    }),
  };
}

export function parseComplaintThemeLogCsv(
  filePath: string,
  source: string,
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
} {
  return parseStructuredCsvImport(filePath, source, {
    sourceFamily: "analysis",
    sourceTitle: "Complaint Theme Log",
    rowKind: "complaint-theme-row",
    getRowKey: (row) => row.theme_id ?? row.id ?? row.theme,
    getTopic: (row) => row.severity ?? "analysis",
    getTitle: (row) => row.theme ?? "Complaint theme",
    getSourceUrl: (row) => row.url ?? null,
    getSourceAnchor: (row) => row.theme_id ?? null,
  });
}

export function buildKganyaImportBundle(files: Array<{ path: string; contents: string }>): KganyaImportBundle {
  const knowledgeSources: KganyaKnowledgeSourceDraft[] = [];
  const sourceRecords: KganyaSourceRecordDraft[] = [];
  const sourceRecordFields: KganyaSourceRecordFieldDraft[] = [];
  const documentChunks: KganyaDocumentChunkDraft[] = [];
  const evaluationSets: KganyaEvaluationSetDraft[] = [];
  const retrievalMetrics: KganyaRetrievalMetricDraft[] = [];

  for (const file of files) {
    const lower = file.path.toLowerCase();

    if (lower.endsWith(".md")) {
      const markdown = buildMarkdownImport(file.path, file.contents);
      knowledgeSources.push(markdown.knowledgeSource);
      sourceRecords.push(markdown.sourceRecord);
      sourceRecordFields.push(...markdown.sourceRecordFields);
      documentChunks.push(...markdown.documentChunks);
      continue;
    }

    if (lower.endsWith("source_inventory.csv")) {
      const inventory = parseSourceInventoryCsv(file.path, file.contents);
      knowledgeSources.push(inventory.knowledgeSource);
      sourceRecords.push(...inventory.sourceRecords);
      sourceRecordFields.push(...inventory.sourceRecordFields);
      documentChunks.push(...inventory.documentChunks);
      continue;
    }

    if (lower.endsWith("faq_gold_set.csv")) {
      const faqSet = parseFaqGoldSetCsv(file.path, file.contents);
      knowledgeSources.push(faqSet.knowledgeSource);
      sourceRecords.push(...faqSet.sourceRecords);
      sourceRecordFields.push(...faqSet.sourceRecordFields);
      documentChunks.push(...faqSet.documentChunks);
      evaluationSets.push(faqSet.evaluationSet);
      continue;
    }

    if (lower.endsWith("question_clusters.csv")) {
      const questionClusters = parseQuestionClustersCsv(file.path, file.contents);
      knowledgeSources.push(questionClusters.knowledgeSource);
      sourceRecords.push(...questionClusters.sourceRecords);
      sourceRecordFields.push(...questionClusters.sourceRecordFields);
      documentChunks.push(...questionClusters.documentChunks);
      evaluationSets.push(questionClusters.evaluationSet);
      continue;
    }

    if (lower.endsWith("kpi_baseline_and_thresholds.csv")) {
      const kpis = parseKpiBaselineCsv(file.path, file.contents);
      knowledgeSources.push(kpis.knowledgeSource);
      sourceRecords.push(...kpis.sourceRecords);
      sourceRecordFields.push(...kpis.sourceRecordFields);
      documentChunks.push(...kpis.documentChunks);
      retrievalMetrics.push(...kpis.retrievalMetrics);
      continue;
    }

    if (lower.endsWith("complaint_theme_log.csv")) {
      const complaints = parseComplaintThemeLogCsv(file.path, file.contents);
      knowledgeSources.push(complaints.knowledgeSource);
      sourceRecords.push(...complaints.sourceRecords);
      sourceRecordFields.push(...complaints.sourceRecordFields);
      documentChunks.push(...complaints.documentChunks);
    }
  }

  return {
    knowledgeSources,
    sourceRecords,
    sourceRecordFields,
    documentChunks,
    evaluationSets,
    retrievalMetrics,
  };
}

export function chunkMarkdownBody(body: string): string[] {
  const normalized = body.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const sections = normalized
    .split(/\n{2,}/g)
    .map((part) => part.trim())
    .filter(Boolean);

  return sections.length > 0 ? sections : [normalized];
}

export function normalizeRelativePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^.*knowledge-base\//, "knowledge-base/");
}

export function buildSourceKey(seed: string): string {
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function humanize(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function inferSourceType(value: string): string {
  const lowered = value.toLowerCase();
  if (lowered.endsWith(".md")) return "markdown";
  if (lowered.endsWith(".csv")) return "csv";
  if (lowered.endsWith(".xlsx")) return "spreadsheet";
  if (lowered.startsWith("http://") || lowered.startsWith("https://")) return "url";
  return "manual";
}

export function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseStructuredCsvImport(
  filePath: string,
  source: string,
  options: {
    sourceFamily: string;
    sourceTitle: string;
    rowKind: string;
    getRowKey: (row: Record<string, string>) => string | undefined;
    getTopic: (row: Record<string, string>) => string;
    getTitle: (row: Record<string, string>) => string;
    getSourceUrl: (row: Record<string, string>) => string | null;
    getSourceAnchor: (row: Record<string, string>) => string | null;
  },
): {
  knowledgeSource: KganyaKnowledgeSourceDraft;
  sourceRecords: KganyaSourceRecordDraft[];
  sourceRecordFields: KganyaSourceRecordFieldDraft[];
  documentChunks: KganyaDocumentChunkDraft[];
} {
  const relativePath = normalizeRelativePath(filePath);
  const sourceKey = buildSourceKey(relativePath.replace(extname(relativePath), ""));
  const rows = parseCsv(source, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  const knowledgeSource: KganyaKnowledgeSourceDraft = {
    sourceKey,
    sourceFamily: options.sourceFamily,
    sourceType: "csv",
    title: options.sourceTitle,
    canonicalRef: relativePath,
    originalPath: relativePath,
    status: "active",
    lastVerifiedAt: null,
  };

  const sourceRecords: KganyaSourceRecordDraft[] = [];
  const sourceRecordFields: KganyaSourceRecordFieldDraft[] = [];
  const documentChunks: KganyaDocumentChunkDraft[] = [];

  rows.forEach((row, index) => {
    const recordKeySeed = options.getRowKey(row) || `row-${index + 1}`;
    const recordKey = buildSourceKey(recordKeySeed);
    const title = options.getTitle(row);
    const topic = options.getTopic(row);
    const sourceUrl = options.getSourceUrl(row);
    const sourceAnchor = options.getSourceAnchor(row);

    const bodyMarkdown = buildStructuredRowMarkdown(title, row);
    const bodyJson = {
      kind: options.rowKind,
      filePath: relativePath,
      fileName: basename(relativePath),
      row,
    };

    sourceRecords.push({
      sourceKey,
      recordKey,
      topic,
      sourceKind: options.rowKind,
      title,
      bodyMarkdown,
      bodyJson,
      sourceUrl,
      sourceAnchor,
      version: 1,
      status: row.status || "active",
      active: true,
      checksum: hashText(JSON.stringify(bodyJson)),
      createdBy: null,
    });

    sourceRecordFields.push(
      ...Object.entries(row).map(([fieldName, fieldValue], fieldOrder) => ({
        sourceKey,
        recordKey,
        fieldName,
        fieldValue,
        fieldType: inferStructuredFieldType(fieldValue),
        fieldOrder,
        isKey: isPrimaryStructuredField(fieldName),
      })),
    );

    documentChunks.push(
      ...buildStructuredRowChunkDrafts({
        sourceKey,
        recordKey,
        sourceFamily: options.sourceFamily,
        topic,
        title,
        sourceKind: options.rowKind,
        bodyMarkdown,
        bodyJson,
      }),
    );
  });

  return {
    knowledgeSource,
    sourceRecords,
    sourceRecordFields,
    documentChunks,
  };
}

function buildMarkdownChunkDrafts(input: {
  sourceKey: string;
  recordKey: string;
  sourceFamily: string;
  topic: string;
  title: string;
  body: string;
}): KganyaDocumentChunkDraft[] {
  const sections = splitMarkdownIntoSections(input.body);

  return sections.map((section, chunkIndex) => ({
    sourceKey: input.sourceKey,
    recordKey: input.recordKey,
    chunkIndex,
    chunkType: section.sectionPath ? "markdown-section" : "markdown-paragraph",
    sourceFamily: input.sourceFamily,
    topic: input.topic,
    title: input.title,
    sectionPath: section.sectionPath,
    chunkText: section.text,
    chunkHash: hashText(section.text),
    active: true,
    embeddingModel: "pending",
  }));
}

function buildStructuredRowChunkDrafts(input: {
  sourceKey: string;
  recordKey: string;
  sourceFamily: string;
  topic: string;
  title: string;
  sourceKind: string;
  bodyMarkdown: string | null;
  bodyJson: Record<string, unknown> | null;
  }): KganyaDocumentChunkDraft[] {
  const chunkText =
    input.bodyMarkdown?.trim() ||
    (input.bodyJson?.row
      ? JSON.stringify(input.bodyJson.row, null, 2)
      : input.bodyJson
        ? JSON.stringify(input.bodyJson, null, 2)
        : input.title);

  const sectionPath = input.sourceKind === "inventory-row" ? "source inventory" : null;

  return [
    {
      sourceKey: input.sourceKey,
      recordKey: input.recordKey,
      chunkIndex: 0,
      chunkType: "row-summary",
      sourceFamily: input.sourceFamily,
      topic: input.topic,
      title: input.title,
      sectionPath,
      chunkText,
      chunkHash: hashText(chunkText),
      active: true,
      embeddingModel: "pending",
    },
  ];
}

function buildStructuredRowMarkdown(title: string, row: Record<string, string>): string {
  const lines = Object.entries(row).map(([fieldName, fieldValue]) => `- ${humanize(fieldName)}: ${fieldValue}`);
  return [`# ${title}`, "", ...lines].join("\n");
}

function splitMarkdownIntoSections(body: string): Array<{ sectionPath: string | null; text: string }> {
  const normalized = body.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const sections: Array<{ sectionPath: string | null; text: string }> = [];
  const headingStack: Array<{ level: number; title: string }> = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    const paragraph = paragraphLines.join("\n").trim();
    if (!paragraph) {
      paragraphLines = [];
      return;
    }

    sections.push({
      sectionPath: headingStack.length > 0 ? headingStack.map((entry) => entry.title).join(" > ") : null,
      text: paragraph,
    });
    paragraphLines = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      headingStack.splice(level - 1);
      headingStack[level - 1] = { level, title };
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();

  return sections.length > 0 ? sections : [{ sectionPath: null, text: normalized }];
}

function inferStructuredFieldType(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "text";
  if (/^(true|false)$/i.test(trimmed)) return "boolean";
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return "number";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "date";
  if (/^https?:\/\//i.test(trimmed)) return "url";
  return "text";
}

function isPrimaryStructuredField(fieldName: string): boolean {
  return /^(id|prompt_id|cluster_id|metric_id|theme_id)$/i.test(fieldName);
}

function parseNumericThreshold(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const rangeMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    return (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2;
  }

  const numericMatch = trimmed.match(/-?\d+(?:\.\d+)?/);
  if (!numericMatch) {
    return null;
  }

  return Number(numericMatch[0]);
}

function stringifyFrontmatterValue(value: string[] | string | undefined): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value ?? "";
}

function parseSimpleFrontmatter(block: string): KganyaMarkdownFrontmatter {
  const result: KganyaMarkdownFrontmatter = {};
  const lines = block.split(/\n+/g);

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = parseFrontmatterValue(rawValue);

    if (key === "title") result.title = String(value);
    else if (key === "slug") result.slug = String(value);
    else if (key === "category") result.category = String(value);
    else if (key === "audience") result.audience = String(value);
    else if (key === "last_verified") result.last_verified = String(value);
    else if (key === "source_priority") result.source_priority = String(value);
    else if (key === "tags") result.tags = value as string[] | string;
    else if (key === "related_files") result.related_files = value as string[] | string;
  }

  return result;
}

function parseFrontmatterValue(rawValue: string): string | string[] {
  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return rawValue.replace(/^["']|["']$/g, "");
}
