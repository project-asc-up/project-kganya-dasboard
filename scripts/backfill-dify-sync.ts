import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { buildResourceTextContent, enqueueDifySyncJob } from "@/lib/dify-sync";
import { getPrismaClient } from "@/lib/prisma";

const OUT_DIR = resolve(process.cwd(), ".tmp", "dify-sync");

function getLimit(argv: string[]) {
  const index = argv.indexOf("--limit");
  if (index === -1) return undefined;
  const value = Number(argv[index + 1]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

async function main() {
  const prisma = getPrismaClient();
  const limit = getLimit(process.argv.slice(2));

  const resources = await prisma.resource.findMany({
    orderBy: [{ updatedAt: "asc" }, { createdAt: "asc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      url: true,
      sourceUrl: true,
      notes: true,
    },
  });

  const enqueued: Array<{ id: string; status: string }> = [];

  for (const resource of resources) {
    const existing = await prisma.difySyncMap.findUnique({
      where: {
        sourceTable_sourceId: {
          sourceTable: "resources",
          sourceId: resource.id,
        },
      },
    });

    if (existing?.syncStatus === "synced" && existing.difyDocumentId) {
      continue;
    }

    await enqueueDifySyncJob({
      sourceTable: "resources",
      sourceId: resource.id,
      action: "create",
      contentKind: "text",
      inputChecksum: null,
      payload: {
        name: resource.title,
        text: buildResourceTextContent({
          title: resource.title,
          category: resource.category,
          description: resource.description,
          url: resource.url,
          sourceUrl: resource.sourceUrl,
          notes: resource.notes,
        }),
      },
    });

    enqueued.push({ id: resource.id, status: "queued" });
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    join(OUT_DIR, "backfill-summary.json"),
    JSON.stringify({ total: resources.length, queued: enqueued.length, enqueued }, null, 2),
    "utf8",
  );

  console.log(JSON.stringify({ total: resources.length, queued: enqueued.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
