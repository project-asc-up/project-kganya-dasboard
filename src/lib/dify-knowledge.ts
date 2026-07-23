import { readFile } from "node:fs/promises";

function getDifyConfig() {
  const apiBase = process.env.DIFY_API_BASE ?? "https://api.dify.ai/v1";
  const apiKey = process.env.DIFY_KB_API_KEY;
  const datasetId = process.env.DIFY_DATASET_ID;

  if (!apiKey) {
    throw new Error("DIFY_KB_API_KEY is not configured");
  }

  if (!datasetId) {
    throw new Error("DIFY_DATASET_ID is not configured");
  }

  return { apiBase, apiKey, datasetId };
}

async function difyJsonRequest(path: string, init: RequestInit) {
  const { apiBase, apiKey } = getDifyConfig();
  const normalizedBase = apiBase.replace(/\/+$/, "");
  const response = await fetch(`${normalizedBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Dify API error ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<{ document?: { id?: string } } | Record<string, unknown>>;
}

async function difyMultipartRequest(path: string, formData: FormData, init?: RequestInit) {
  const { apiBase, apiKey } = getDifyConfig();
  const normalizedBase = apiBase.replace(/\/+$/, "");
  const response = await fetch(`${normalizedBase}${path}`, {
    ...(init ?? {}),
    method: init?.method ?? "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Dify API error ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<{ document?: { id?: string } } | Record<string, unknown>>;
}

export async function createDifyDocument(name: string, text: string): Promise<string> {
  const { datasetId } = getDifyConfig();
  const data = (await difyJsonRequest(`/datasets/${datasetId}/document/create_by_text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      text,
      indexing_technique: "high_quality",
      process_rule: { mode: "automatic" },
    }),
  })) as { document?: { id?: string } };

  const documentId = data.document?.id;
  if (!documentId) {
    throw new Error("Dify create_by_text response did not include document.id");
  }

  return documentId;
}

export async function updateDifyDocument(documentId: string, name: string, text: string) {
  const { datasetId } = getDifyConfig();
  await difyJsonRequest(`/datasets/${datasetId}/documents/${documentId}/update_by_text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, text }),
  });
}

export async function deleteDifyDocument(documentId: string) {
  const { datasetId } = getDifyConfig();
  await difyJsonRequest(`/datasets/${datasetId}/documents/${documentId}`, {
    method: "DELETE",
  });
}

export type DifyFileInput = {
  name: string;
  fileName: string;
  filePath: string;
  mimeType?: string | null;
};

async function buildFileFormData(input: DifyFileInput) {
  const fileBytes = await readFile(input.filePath);
  const formData = new FormData();
  formData.set(
    "data",
    JSON.stringify({
      indexing_technique: "high_quality",
      process_rule: { mode: "automatic" },
      name: input.name,
    }),
  );
  formData.set(
    "file",
    new Blob([fileBytes], { type: input.mimeType ?? "application/octet-stream" }),
    input.fileName,
  );
  return formData;
}

export async function createDifyDocumentFromFile(input: DifyFileInput): Promise<string> {
  const { datasetId } = getDifyConfig();
  const data = (await difyMultipartRequest(
    `/datasets/${datasetId}/document/create_by_file`,
    await buildFileFormData(input),
  )) as { document?: { id?: string } };

  const documentId = data.document?.id;
  if (!documentId) {
    throw new Error("Dify create_by_file response did not include document.id");
  }

  return documentId;
}

export async function updateDifyDocumentFromFile(documentId: string, input: DifyFileInput) {
  const { datasetId } = getDifyConfig();
  await difyMultipartRequest(
    `/datasets/${datasetId}/documents/${documentId}/update_by_file`,
    await buildFileFormData(input),
    { method: "POST" },
  );
}
