import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();

    const queries = [
      "ALTER TABLE faculties ADD COLUMN IF NOT EXISTS dify_document_id text",
      "ALTER TABLE asc_coaches ADD COLUMN IF NOT EXISTS dify_document_id text",
      "ALTER TABLE programmes ADD COLUMN IF NOT EXISTS dify_document_id text",
      "ALTER TABLE resources ADD COLUMN IF NOT EXISTS dify_document_id text",
      "ALTER TABLE faqs ADD COLUMN IF NOT EXISTS dify_document_id text",
      "ALTER TABLE mutation_receipts DROP COLUMN IF EXISTS sync_job_id",
      "DROP TABLE IF EXISTS dify_sync_map CASCADE",
      "DROP TABLE IF EXISTS dify_sync_jobs CASCADE"
    ];

    console.log("Running schema migration via Prisma in Next.js...");
    const results = [];
    for (const query of queries) {
      console.log(`Executing: ${query}`);
      const res = await prisma.$executeRawUnsafe(query);
      results.push({ query, res });
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("Migration via Prisma failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
