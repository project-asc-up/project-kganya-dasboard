import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "csv-parse/sync";

import { PrismaClient } from "../src/generated/prisma/client";
import { CoachLevel } from "../src/generated/prisma/enums";
import { createDatabaseAdapter } from "../src/lib/db-adapter";

type CsvRow = Record<string, string>;

const repoRoot = process.cwd();
const docsDir = path.join(repoRoot, "docs");
const envFiles = [path.join(repoRoot, ".env.local"), path.join(repoRoot, ".env")];

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const cleaned = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separatorIndex = cleaned.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = cleaned.slice(0, separatorIndex).trim();
    let value = cleaned.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

for (const filePath of envFiles) {
  loadEnvFile(filePath);
}

function createPrismaClient() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL must be configured to run the seed script");
  }

  const adapter = createDatabaseAdapter(connectionString);

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

function csvPath(filename: string) {
  return path.join(docsDir, filename);
}

async function readCsv(filename: string) {
  const content = (await readFile(csvPath(filename), "utf8"))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_quotes: true,
  }) as CsvRow[];
}

function nullableString(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableInt(value?: string) {
  const normalized = nullableString(value);
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function nullableDate(value?: string) {
  const normalized = nullableString(value);
  return normalized ? new Date(normalized) : null;
}

function requiredString(value: string | undefined, fallback: string) {
  return nullableString(value) ?? fallback;
}

function requiredInt(value: string | undefined, fallback: number) {
  return nullableInt(value) ?? fallback;
}

function buildSeedKey(parts: Array<string | null | undefined>) {
  return parts.map((part) => nullableString(part) ?? "general").join("::");
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function parseCoachLevel(value?: string): CoachLevel {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "UNDERGRADUATE") return CoachLevel.UNDERGRADUATE;
  if (normalized === "POSTGRADUATE") return CoachLevel.POSTGRADUATE;
  if (normalized === "BOTH") return CoachLevel.BOTH;
  return CoachLevel.UNKNOWN;
}

async function main() {
  const [
    facultyRows,
    coachRows,
    resourceRows,
    faqRows,
  ] = await Promise.all([
    readCsv("seed-faculties.csv"),
    readCsv("seed-asc-coaches.csv"),
    readCsv("seed-resources.csv"),
    readCsv("seed-faqs.csv"),
  ]);

  for (const row of facultyRows) {
    await prisma.faculty.upsert({
      where: { code: row.code },
      update: {
        name: row.name,
        codeStatus: row.code_status,
        officialPageUrl: nullableString(row.official_page_url),
        supportPageUrl: nullableString(row.support_page_url),
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        notes: nullableString(row.notes),
        aliases: nullableString(row.aliases),
      },
      create: {
        code: row.code,
        name: row.name,
        codeStatus: row.code_status,
        officialPageUrl: nullableString(row.official_page_url),
        supportPageUrl: nullableString(row.support_page_url),
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        notes: nullableString(row.notes),
        aliases: nullableString(row.aliases),
      },
    });
  }

  const faculties = await prisma.faculty.findMany({
    select: { id: true, code: true },
  });
  const facultyIdByCode = new Map(
    faculties.map((faculty: { code: string; id: string }) => [faculty.code, faculty.id]),
  );

  for (const row of coachRows) {
    const facultyId = facultyIdByCode.get(row.faculty_code);
    if (!facultyId) {
      throw new Error(`Missing faculty for coach row: ${row.name} (${row.faculty_code})`);
    }

    await prisma.ascCoach.upsert({
      where: {
        facultyId_email: {
          facultyId,
          email: row.email,
        },
      },
      update: {
        name: row.name,
        titleRole: nullableString(row.title_role),
        phone: nullableString(row.phone),
        cell: nullableString(row.cell),
        officeLocation: nullableString(row.office_location),
        building: nullableString(row.building),
        appointmentLink: nullableString(row.appointment_link),
        level: parseCoachLevel(row.level),
        cluster: nullableString(row.cluster),
        responsibilities: nullableString(row.responsibilities),
        isActive: (row.is_active ?? "").toLowerCase() === "true",
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        verificationStatus: nullableString(row.verification_status),
        notes: nullableString(row.notes),
      },
      create: {
        facultyId,
        email: row.email,
        name: row.name,
        titleRole: nullableString(row.title_role),
        phone: nullableString(row.phone),
        cell: nullableString(row.cell),
        officeLocation: nullableString(row.office_location),
        building: nullableString(row.building),
        appointmentLink: nullableString(row.appointment_link),
        level: parseCoachLevel(row.level),
        cluster: nullableString(row.cluster),
        responsibilities: nullableString(row.responsibilities),
        isActive: (row.is_active ?? "").toLowerCase() === "true",
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        verificationStatus: nullableString(row.verification_status),
        notes: nullableString(row.notes),
      },
    });
  }


  for (const row of resourceRows) {
    const facultyId = nullableString(row.faculty_code)
      ? facultyIdByCode.get(row.faculty_code) ?? null
      : null;
    const seedKey = buildSeedKey(["resource", row.faculty_code, row.title]);

    await prisma.resource.upsert({
      where: { seedKey },
      update: {
        seedKey,
        category: row.category,
        facultyId,
        description: nullableString(row.description),
        url: row.url,
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        notes: nullableString(row.notes),
      },
      create: {
        seedKey,
        category: row.category,
        facultyId,
        description: nullableString(row.description),
        title: row.title,
        url: row.url,
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        notes: nullableString(row.notes),
      },
    });
  }

  for (const row of faqRows) {
    const facultyId = nullableString(row.faculty_code)
      ? facultyIdByCode.get(row.faculty_code) ?? null
      : null;
    const seedKey = buildSeedKey(["faq", row.faculty_code, row.question]);

    await prisma.faq.upsert({
      where: { seedKey },
      update: {
        seedKey,
        answer: row.answer,
        category: row.category,
        facultyId,
        priority: nullableInt(row.priority),
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        notes: nullableString(row.notes),
      },
      create: {
        seedKey,
        facultyId,
        question: row.question,
        answer: row.answer,
        category: row.category,
        priority: nullableInt(row.priority),
        sourceUrl: nullableString(row.source_url),
        lastVerified: nullableDate(row.last_verified),
        notes: nullableString(row.notes),
      },
    });
  }

  const [facultyCount, coachCount, resourceCount, faqCount] =
    await Promise.all([
      prisma.faculty.count(),
      prisma.ascCoach.count(),
      prisma.resource.count(),
      prisma.faq.count(),
    ]);

  console.log(
    JSON.stringify(
      {
        faculties: facultyCount,
        ascCoaches: coachCount,
        resources: resourceCount,
        faqs: faqCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
