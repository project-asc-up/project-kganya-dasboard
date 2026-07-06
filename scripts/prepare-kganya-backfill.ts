import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { buildKganyaImportBundle } from "../src/lib/kganya-import";

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

async function main() {
  const repoRoot = process.cwd();
  const kbRoot = join(repoRoot, "..", "kganya-operating-system", "knowledge-base");
  const files = await listBackfillFiles(kbRoot);
  const bundle = buildKganyaImportBundle(files);

  const output = {
    knowledgeSources: bundle.knowledgeSources.length,
    sourceRecords: bundle.sourceRecords.length,
    sourceRecordFields: bundle.sourceRecordFields.length,
    documentChunks: bundle.documentChunks.length,
    evaluationSets: bundle.evaluationSets.length,
    evaluationCases: bundle.evaluationSets.reduce((count, set) => count + set.cases.length, 0),
    retrievalMetrics: bundle.retrievalMetrics.length,
    sampleKnowledgeSources: bundle.knowledgeSources.slice(0, 5),
    sampleEvaluationCases: bundle.evaluationSets.flatMap((set) => set.cases).slice(0, 5),
  };

  const outDir = join(repoRoot, ".tmp");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "kganya-backfill-preview.json"), JSON.stringify(output, null, 2));

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
