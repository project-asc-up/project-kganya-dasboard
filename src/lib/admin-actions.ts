"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CoachLevel } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { ADMIN_CACHE_TAGS } from "@/lib/admin-cache-tags";
import { buildAdminSeedKey, resolveUniqueAdminSeedKey } from "@/lib/admin-seed-keys";
import { buildResourceTextContent, enqueueDifySyncJob, stageResourceUpload } from "@/lib/dify-sync";
import { getPrismaClient } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { executeMutationWithReceipt, type MutationReceiptStore } from "@/lib/mutation-receipts";
import { faqIdentity } from "@/lib/mutation-identities";
import type { MutationResult } from "@/lib/mutation-types";

function textValue(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredText(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function optionalNumber(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalDate(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isChecked(formData: FormData, key: string) {
  return textValue(formData, key) === "on";
}

async function facultyCodeForId(prisma: ReturnType<typeof getPrismaClient>, facultyId: string | null) {
  if (!facultyId) return "general";

  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    select: { code: true },
  });

  if (!faculty) {
    throw new Error("Selected faculty does not exist");
  }

  return faculty.code;
}

async function facultyIdOrNull(formData: FormData) {
  const raw = textValue(formData, "facultyId");
  return raw && raw.length > 0 ? raw : null;
}

function redirectTo(entity: string, id?: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/${entity}`);
  if (id) {
    revalidatePath(`/admin/${entity}/${id}`);
  }
  revalidateTag(ADMIN_CACHE_TAGS.overview, "max");
  revalidateTag(ADMIN_CACHE_TAGS.health, "max");
  revalidateTag(ADMIN_CACHE_TAGS.faculties, "max");
  revalidateTag(ADMIN_CACHE_TAGS.coaches, "max");
  revalidateTag(ADMIN_CACHE_TAGS.programmes, "max");
  revalidateTag(ADMIN_CACHE_TAGS.courseModules, "max");
  revalidateTag(ADMIN_CACHE_TAGS.resources, "max");
  revalidateTag(ADMIN_CACHE_TAGS.faqs, "max");
}

export async function createFaculty(formData: FormData): Promise<MutationResult> {
  await requirePermission("faculty:create");
  const prisma = getPrismaClient();
  const requestId = textValue(formData, "requestId") ?? crypto.randomUUID();
  const data = {
    name: requiredText(formData, "name"), code: requiredText(formData, "code").toUpperCase(), codeStatus: requiredText(formData, "codeStatus"),
    officialPageUrl: textValue(formData, "officialPageUrl"), supportPageUrl: textValue(formData, "supportPageUrl"), sourceUrl: textValue(formData, "sourceUrl"),
    lastVerified: optionalDate(formData, "lastVerified"), notes: textValue(formData, "notes"), aliases: textValue(formData, "aliases"),
  };
  const result = await executeMutationWithReceipt<{ recordId: string; created: boolean }>({
    store: prisma.mutationReceipt as unknown as MutationReceiptStore, requestId, payload: data, kind: "create", write: async () => { throw new Error("transaction required"); },
    transaction: async (work) => prisma.$transaction(async (tx) => work(tx.mutationReceipt as unknown as MutationReceiptStore, async () => {
      const existing = await tx.faculty.findUnique({ where: { code: data.code } });
      const faculty = existing ? await tx.faculty.update({ where: { id: existing.id }, data }) : await tx.faculty.create({ data });
      return { recordId: faculty.id, created: !existing };
    })),
  });
  const receipt = await prisma.mutationReceipt.findUnique({ where: { requestId } });
  if (!receipt) throw new Error("Mutation receipt was not found after faculty save.");
  const syncJob = await enqueueDifySyncJob({ sourceTable: "faculties", sourceId: result.recordId, action: result.created ? "create" : "update", contentKind: "text", payload: { name: data.name, text: `${data.code}: ${data.name}\n${data.notes ?? ""}` } });
  await prisma.mutationReceipt.update({ where: { requestId }, data: { syncJobId: syncJob.id } });
  return { mutationId: receipt.id, requestId, kind: "create", recordId: result.recordId, persistence: "saved", sync: { status: "pending", jobId: syncJob.id } };
}

export async function updateFaculty(id: string, formData: FormData) {
  await requirePermission("faculty:update");
  const prisma = getPrismaClient();
  await prisma.faculty.update({
    where: { id },
    data: {
      name: requiredText(formData, "name"),
      code: requiredText(formData, "code").toUpperCase(),
      codeStatus: requiredText(formData, "codeStatus"),
      officialPageUrl: textValue(formData, "officialPageUrl"),
      supportPageUrl: textValue(formData, "supportPageUrl"),
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
      aliases: textValue(formData, "aliases"),
    },
  });

  redirectTo("faculties", id);
  redirect(`/admin/faculties/${id}`);
}

export async function deleteFaculty(id: string) {
  await requirePermission("faculty:delete");
  const prisma = getPrismaClient();
  await prisma.faculty.delete({ where: { id } });
  redirectTo("faculties");
  redirect("/admin/faculties");
}

export async function createCoach(formData: FormData) {
  await requirePermission("coach:create");
  const prisma = getPrismaClient();
  const facultyId = requiredText(formData, "facultyId");
  const coach = await prisma.ascCoach.create({
    data: {
      facultyId,
      name: requiredText(formData, "name"),
      email: requiredText(formData, "email").toLowerCase(),
      titleRole: textValue(formData, "titleRole"),
      phone: textValue(formData, "phone"),
      cell: textValue(formData, "cell"),
      officeLocation: textValue(formData, "officeLocation"),
      building: textValue(formData, "building"),
      appointmentLink: textValue(formData, "appointmentLink"),
      level: (textValue(formData, "level") as CoachLevel) ?? CoachLevel.UNKNOWN,
      cluster: textValue(formData, "cluster"),
      responsibilities: textValue(formData, "responsibilities"),
      isActive: isChecked(formData, "isActive"),
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      verificationStatus: textValue(formData, "verificationStatus"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("coaches");
  redirect("/admin/coaches");
}

export async function updateCoach(id: string, formData: FormData) {
  await requirePermission("coach:update");
  const prisma = getPrismaClient();
  const facultyId = requiredText(formData, "facultyId");
  await prisma.ascCoach.update({
    where: { id },
    data: {
      facultyId,
      name: requiredText(formData, "name"),
      email: requiredText(formData, "email").toLowerCase(),
      titleRole: textValue(formData, "titleRole"),
      phone: textValue(formData, "phone"),
      cell: textValue(formData, "cell"),
      officeLocation: textValue(formData, "officeLocation"),
      building: textValue(formData, "building"),
      appointmentLink: textValue(formData, "appointmentLink"),
      level: (textValue(formData, "level") as CoachLevel) ?? CoachLevel.UNKNOWN,
      cluster: textValue(formData, "cluster"),
      responsibilities: textValue(formData, "responsibilities"),
      isActive: isChecked(formData, "isActive"),
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      verificationStatus: textValue(formData, "verificationStatus"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("coaches");
  redirect("/admin/coaches");
}

export async function deleteCoach(id: string) {
  await requirePermission("coach:delete");
  const prisma = getPrismaClient();
  await prisma.ascCoach.delete({ where: { id } });
  redirectTo("coaches");
  redirect("/admin/coaches");
}

export async function createProgramme(formData: FormData) {
  await requirePermission("programme:create");
  const prisma = getPrismaClient();
  const programme = await prisma.programme.create({
    data: {
      facultyId: requiredText(formData, "facultyId"),
      sourceFacultyCode: textValue(formData, "sourceFacultyCode"),
      programmeCode: requiredText(formData, "programmeCode"),
      programmeName: requiredText(formData, "programmeName"),
      degreeName: textValue(formData, "degreeName"),
      academicLevel: textValue(formData, "academicLevel"),
      qualificationType: textValue(formData, "qualificationType"),
      programmeCredits: optionalNumber(formData, "programmeCredits"),
      durationYears: optionalNumber(formData, "durationYears"),
      yearLevels: textValue(formData, "yearLevels"),
      sourceFile: textValue(formData, "sourceFile"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("programmes", programme.id);
  redirect(`/admin/programmes/${programme.id}`);
}

export async function updateProgramme(id: string, formData: FormData) {
  await requirePermission("programme:update");
  const prisma = getPrismaClient();
  await prisma.programme.update({
    where: { id },
    data: {
      facultyId: requiredText(formData, "facultyId"),
      sourceFacultyCode: textValue(formData, "sourceFacultyCode"),
      programmeCode: requiredText(formData, "programmeCode"),
      programmeName: requiredText(formData, "programmeName"),
      degreeName: textValue(formData, "degreeName"),
      academicLevel: textValue(formData, "academicLevel"),
      qualificationType: textValue(formData, "qualificationType"),
      programmeCredits: optionalNumber(formData, "programmeCredits"),
      durationYears: optionalNumber(formData, "durationYears"),
      yearLevels: textValue(formData, "yearLevels"),
      sourceFile: textValue(formData, "sourceFile"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("programmes", id);
  redirect(`/admin/programmes/${id}`);
}

export async function deleteProgramme(id: string) {
  await requirePermission("programme:delete");
  const prisma = getPrismaClient();
  await prisma.programme.delete({ where: { id } });
  redirectTo("programmes");
  redirect("/admin/programmes");
}

export async function createCourseModule(formData: FormData) {
  await requirePermission("course-module:create");
  const prisma = getPrismaClient();
  const programmeId = requiredText(formData, "programmeId");
  const courseModule = await prisma.courseModule.create({
    data: {
      programmeId,
      facultyCode: textValue(formData, "facultyCode"),
      sourceFacultyCode: textValue(formData, "sourceFacultyCode"),
      programmeCode: requiredText(formData, "programmeCode"),
      programmeName: textValue(formData, "programmeName"),
      yearLevelRaw: requiredText(formData, "yearLevelRaw"),
      yearLevelSort: optionalNumber(formData, "yearLevelSort"),
      moduleCode: requiredText(formData, "moduleCode"),
      moduleName: textValue(formData, "moduleName"),
      moduleType: requiredText(formData, "moduleType"),
      moduleUnits: Number(requiredText(formData, "moduleUnits")),
      sourceFile: textValue(formData, "sourceFile"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("course-modules", courseModule.id);
  redirect(`/admin/course-modules/${courseModule.id}`);
}

export async function updateCourseModule(id: string, formData: FormData) {
  await requirePermission("course-module:update");
  const prisma = getPrismaClient();
  await prisma.courseModule.update({
    where: { id },
    data: {
      programmeId: requiredText(formData, "programmeId"),
      facultyCode: textValue(formData, "facultyCode"),
      sourceFacultyCode: textValue(formData, "sourceFacultyCode"),
      programmeCode: requiredText(formData, "programmeCode"),
      programmeName: textValue(formData, "programmeName"),
      yearLevelRaw: requiredText(formData, "yearLevelRaw"),
      yearLevelSort: optionalNumber(formData, "yearLevelSort"),
      moduleCode: requiredText(formData, "moduleCode"),
      moduleName: textValue(formData, "moduleName"),
      moduleType: requiredText(formData, "moduleType"),
      moduleUnits: Number(requiredText(formData, "moduleUnits")),
      sourceFile: textValue(formData, "sourceFile"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("course-modules", id);
  redirect(`/admin/course-modules/${id}`);
}

export async function deleteCourseModule(id: string) {
  await requirePermission("course-module:delete");
  const prisma = getPrismaClient();
  await prisma.courseModule.delete({ where: { id } });
  redirectTo("course-modules");
  redirect("/admin/course-modules");
}

export async function createResource(formData: FormData) {
  await requirePermission("resource:create");
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const title = requiredText(formData, "title");
  const category = requiredText(formData, "category");
  const url = requiredText(formData, "url");
  const baseSeedKey = buildAdminSeedKey("resource", facultyCode, title);
  const seedKey = await resolveUniqueAdminSeedKey(baseSeedKey, async (candidate) => {
    const existing = await prisma.resource.findUnique({
      where: { seedKey: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const resource = await prisma.resource.create({
    data: {
      seedKey,
      facultyId,
      resourceType: "link",
      category,
      title,
      description: textValue(formData, "description"),
      url,
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
      attachmentName: null,
      attachmentMimeType: null,
      attachmentSizeBytes: null,
      attachmentStatus: "pending",
      attachmentError: null,
    },
  });

  try {
    await enqueueDifySyncJob({
      sourceTable: "resources",
      sourceId: resource.id,
      action: "create",
      contentKind: "text",
      inputChecksum: null,
      payload: {
        name: title,
        text: buildResourceTextContent({
          title,
          category,
          description: textValue(formData, "description"),
          url,
          sourceUrl: textValue(formData, "sourceUrl"),
          notes: textValue(formData, "notes"),
        }),
      },
    });
  } catch (error) {
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        attachmentStatus: "failed",
        attachmentError: error instanceof Error ? error.message : "Failed to queue Dify sync",
      },
    });
    console.error("Failed to queue Dify sync for resource create:", error);
  }

  redirectTo("resources", resource.id);
  redirect("/admin/resources/" + resource.id);
}

export async function createResourceDocument(formData: FormData) {
  await requirePermission("resource:create");
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const title = requiredText(formData, "title");
  const category = requiredText(formData, "category");
  const file = formData.get("documentFile");

  if (!(file instanceof File)) {
    throw new Error("A document file is required.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseSeedKey = buildAdminSeedKey("resource", facultyCode, title + " document");
  const seedKey = await resolveUniqueAdminSeedKey(baseSeedKey, async (candidate) => {
    const existing = await prisma.resource.findUnique({
      where: { seedKey: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const resource = await prisma.resource.create({
    data: {
      seedKey,
      facultyId,
      resourceType: "document",
      category,
      title,
      description: textValue(formData, "description"),
      url: "/admin/resources",
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
      attachmentName: file.name || "uploaded-document",
      attachmentMimeType: file.type || "application/octet-stream",
      attachmentSizeBytes: file.size,
      attachmentStatus: "pending",
      attachmentError: null,
    },
  });

  const staged = await stageResourceUpload({
    sourceTable: "resources",
    sourceId: resource.id,
    fileName: file.name || "uploaded-document",
    mimeType: file.type || "application/octet-stream",
    bytes: buffer,
  });

  try {
    await enqueueDifySyncJob({
      sourceTable: "resources",
      sourceId: resource.id,
      action: "create",
      contentKind: "file",
      inputChecksum: null,
      payload: {
        name: title,
        filePath: staged.filePath,
        fileName: file.name || "uploaded-document",
        mimeType: file.type || "application/octet-stream",
      },
    });
  } catch (error) {
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        attachmentStatus: "failed",
        attachmentError: error instanceof Error ? error.message : "Failed to queue Dify sync",
      },
    });
    console.error("Failed to queue Dify sync for resource upload:", error);
  }

  redirectTo("resources", resource.id);
  redirect("/admin/resources/" + resource.id);
}

export async function updateResource(id: string, formData: FormData) {
  await requirePermission("resource:update");
  const prisma = getPrismaClient();
  const existingResource = await prisma.resource.findUnique({
    where: { id },
  });
  if (!existingResource) {
    throw new Error("Resource not found.");
  }
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const title = requiredText(formData, "title");
  const category = requiredText(formData, "category");
  const url = requiredText(formData, "url");
  const baseSeedKey = buildAdminSeedKey("resource", facultyCode, title);
  const seedKey = await resolveUniqueAdminSeedKey(baseSeedKey, async (candidate) => {
    const existing = await prisma.resource.findUnique({
      where: { seedKey: candidate },
      select: { id: true },
    });
    return Boolean(existing && existing.id !== id);
  });

  await prisma.resource.update({
    where: { id },
    data: {
      seedKey,
      facultyId,
      resourceType: existingResource.resourceType,
      category,
      title,
      description: textValue(formData, "description"),
      url,
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
      attachmentName: existingResource.attachmentName,
      attachmentMimeType: existingResource.attachmentMimeType,
      attachmentSizeBytes: existingResource.attachmentSizeBytes,
      attachmentStatus: existingResource.attachmentStatus,
      attachmentError: existingResource.attachmentError,
    },
  });

  try {
    await enqueueDifySyncJob({
      sourceTable: "resources",
      sourceId: id,
      action: "update",
      contentKind: "text",
      inputChecksum: null,
      payload: {
        name: title,
        text: buildResourceTextContent({
          title,
          category,
          description: textValue(formData, "description"),
          url,
          sourceUrl: textValue(formData, "sourceUrl"),
          notes: textValue(formData, "notes"),
        }),
      },
    });
  } catch (error) {
    await prisma.resource.update({
      where: { id },
      data: {
        attachmentStatus: "failed",
        attachmentError: error instanceof Error ? error.message : "Failed to queue Dify sync",
      },
    });
    console.error("Failed to queue Dify sync for resource update:", error);
  }

  redirectTo("resources", id);
  redirect("/admin/resources/" + id);
}

export async function deleteResource(id: string) {
  await requirePermission("resource:delete");
  const prisma = getPrismaClient();
  const existingResource = await prisma.resource.findUnique({ where: { id } });
  await prisma.resource.delete({ where: { id } });

  if (existingResource) {
    try {
      await enqueueDifySyncJob({
        sourceTable: "resources",
        sourceId: id,
        action: "delete",
        contentKind: "text",
        inputChecksum: null,
        payload: {
          name: existingResource.title,
        },
      });
    } catch (error) {
      console.error("Failed to queue Dify sync for resource delete:", error);
    }
  }

  redirectTo("resources");
  redirect("/admin/resources");
}

export async function createFaq(formData: FormData) {
  await requirePermission("faq:create");
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const question = requiredText(formData, "question");
  const answer = requiredText(formData, "answer");
  const category = requiredText(formData, "category");
  const baseSeedKey = buildAdminSeedKey("faq", facultyCode, `${category}::${question}`);
  const seedKey = await resolveUniqueAdminSeedKey(baseSeedKey, async (candidate) => {
    const existing = await prisma.faq.findUnique({
      where: { seedKey: candidate },
      select: { id: true },
    });
    return Boolean(existing);
  });

  const payload = { facultyId, category, question, answer, priority: optionalNumber(formData, "priority") };
  const requestId = textValue(formData, "requestId") ?? crypto.randomUUID();
  let result: { recordId: string; created: boolean } | undefined;
  for (let attempt = 0; attempt < 3 && !result; attempt += 1) {
    try {
      result = await executeMutationWithReceipt<{ recordId: string; created: boolean }>({
        store: prisma.mutationReceipt as unknown as MutationReceiptStore,
        requestId,
        payload,
        kind: "create",
        write: async () => { throw new Error("FAQ write must run inside transaction"); },
        transaction: async (work) => prisma.$transaction(async (tx) => work(
          tx.mutationReceipt as unknown as MutationReceiptStore,
          async () => {
            const identity = faqIdentity({ facultyId, category, question });
            const candidates = await tx.faq.findMany({ where: { facultyId } });
            const existing = candidates.find((candidate) => faqIdentity({ facultyId: candidate.facultyId, category: candidate.category, question: candidate.question }) === identity);
            const faq = existing
              ? await tx.faq.update({ where: { id: existing.id }, data: { answer, question, category, priority: payload.priority, sourceUrl: textValue(formData, "sourceUrl"), lastVerified: optionalDate(formData, "lastVerified"), notes: textValue(formData, "notes") } })
              : await tx.faq.create({ data: { seedKey, facultyId, question, answer, category, priority: payload.priority, sourceUrl: textValue(formData, "sourceUrl"), lastVerified: optionalDate(formData, "lastVerified"), notes: textValue(formData, "notes") } });
            return { recordId: faq.id, created: !existing };
          },
        ), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
      });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
      if (!retryable || attempt === 2) throw error;
    }
  }
  if (!result) throw new Error("FAQ mutation did not complete.");
  const receipt = await prisma.mutationReceipt.findUnique({ where: { requestId } });
  if (!receipt) throw new Error("Mutation receipt was not found after FAQ save.");
  if (receipt.syncJobId && receipt.result) {
    const previous = receipt.result as { recordId?: string };
    if (previous.recordId) {
      return {
        mutationId: receipt.id,
        requestId,
        kind: "create",
        recordId: previous.recordId,
        persistence: "saved",
        sync: { status: "pending", jobId: receipt.syncJobId },
      } satisfies MutationResult;
    }
  }
  const syncJob = await enqueueDifySyncJob({
    sourceTable: "faqs",
    sourceId: result.recordId,
    action: result.created ? "create" : "update",
    contentKind: "text",
    payload: { name: question, text: `${question}\n\n${answer}` },
  });
  await prisma.mutationReceipt.update({ where: { requestId }, data: { syncJobId: syncJob.id } });
  return {
    mutationId: receipt.id,
    requestId,
    kind: "create",
    recordId: result.recordId,
    persistence: "saved",
    sync: { status: "pending", jobId: syncJob.id },
  } satisfies MutationResult;
}

export async function updateFaq(id: string, formData: FormData) {
  await requirePermission("faq:update");
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const question = requiredText(formData, "question");
  const baseSeedKey = buildAdminSeedKey("faq", facultyCode, question);
  const seedKey = await resolveUniqueAdminSeedKey(baseSeedKey, async (candidate) => {
    const existing = await prisma.faq.findUnique({
      where: { seedKey: candidate },
      select: { id: true },
    });
    return Boolean(existing && existing.id !== id);
  });

  await prisma.faq.update({
    where: { id },
    data: {
      seedKey,
      facultyId,
      question,
      answer: requiredText(formData, "answer"),
      category: requiredText(formData, "category"),
      priority: optionalNumber(formData, "priority"),
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("faqs");
  redirect("/admin/faqs");
}

export async function deleteFaq(id: string) {
  await requirePermission("faq:delete");
  const prisma = getPrismaClient();
  await prisma.faq.delete({ where: { id } });
  redirectTo("faqs");
  redirect("/admin/faqs");
}

export async function refreshHealthDashboard() {
  await requirePermission("system:refresh");
  revalidatePath("/admin");
  revalidatePath("/admin/health");
  revalidateTag(ADMIN_CACHE_TAGS.overview, "max");
  revalidateTag(ADMIN_CACHE_TAGS.health, "max");
}
