"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CoachLevel } from "@/generated/prisma/enums";
import { getPrismaClient } from "@/lib/prisma";

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

function seedPart(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "general";
}

function redirectTo(entity: string, id?: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/${entity}`);
  if (id) {
    revalidatePath(`/admin/${entity}/${id}`);
  }
}

export async function createFaculty(formData: FormData) {
  const prisma = getPrismaClient();
  const faculty = await prisma.faculty.create({
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

  redirectTo("faculties", faculty.id);
  redirect(`/admin/faculties/${faculty.id}`);
}

export async function updateFaculty(id: string, formData: FormData) {
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
  const prisma = getPrismaClient();
  await prisma.faculty.delete({ where: { id } });
  redirectTo("faculties");
  redirect("/admin/faculties");
}

export async function createCoach(formData: FormData) {
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

  redirectTo("coaches", coach.id);
  redirect(`/admin/coaches/${coach.id}`);
}

export async function updateCoach(id: string, formData: FormData) {
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

  redirectTo("coaches", id);
  redirect(`/admin/coaches/${id}`);
}

export async function deleteCoach(id: string) {
  const prisma = getPrismaClient();
  await prisma.ascCoach.delete({ where: { id } });
  redirectTo("coaches");
  redirect("/admin/coaches");
}

export async function createProgramme(formData: FormData) {
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
  const prisma = getPrismaClient();
  await prisma.programme.delete({ where: { id } });
  redirectTo("programmes");
  redirect("/admin/programmes");
}

export async function createCourseModule(formData: FormData) {
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
  const prisma = getPrismaClient();
  await prisma.courseModule.delete({ where: { id } });
  redirectTo("course-modules");
  redirect("/admin/course-modules");
}

export async function createResource(formData: FormData) {
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const title = requiredText(formData, "title");
  const seedKey = `resource::${seedPart(facultyCode)}::${seedPart(title)}`;

  const resource = await prisma.resource.create({
    data: {
      seedKey,
      facultyId,
      category: requiredText(formData, "category"),
      title,
      description: textValue(formData, "description"),
      url: requiredText(formData, "url"),
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("resources", resource.id);
  redirect(`/admin/resources/${resource.id}`);
}

export async function updateResource(id: string, formData: FormData) {
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const title = requiredText(formData, "title");
  const seedKey = `resource::${seedPart(facultyCode)}::${seedPart(title)}`;

  await prisma.resource.update({
    where: { id },
    data: {
      seedKey,
      facultyId,
      category: requiredText(formData, "category"),
      title,
      description: textValue(formData, "description"),
      url: requiredText(formData, "url"),
      sourceUrl: textValue(formData, "sourceUrl"),
      lastVerified: optionalDate(formData, "lastVerified"),
      notes: textValue(formData, "notes"),
    },
  });

  redirectTo("resources", id);
  redirect(`/admin/resources/${id}`);
}

export async function deleteResource(id: string) {
  const prisma = getPrismaClient();
  await prisma.resource.delete({ where: { id } });
  redirectTo("resources");
  redirect("/admin/resources");
}

export async function createFaq(formData: FormData) {
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const question = requiredText(formData, "question");
  const seedKey = `faq::${seedPart(facultyCode)}::${seedPart(question)}`;

  const faq = await prisma.faq.create({
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

  redirectTo("faqs", faq.id);
  redirect(`/admin/faqs/${faq.id}`);
}

export async function updateFaq(id: string, formData: FormData) {
  const prisma = getPrismaClient();
  const facultyId = await facultyIdOrNull(formData);
  const facultyCode = await facultyCodeForId(prisma, facultyId);
  const question = requiredText(formData, "question");
  const seedKey = `faq::${seedPart(facultyCode)}::${seedPart(question)}`;

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

  redirectTo("faqs", id);
  redirect(`/admin/faqs/${id}`);
}

export async function deleteFaq(id: string) {
  const prisma = getPrismaClient();
  await prisma.faq.delete({ where: { id } });
  redirectTo("faqs");
  redirect("/admin/faqs");
}

export async function refreshHealthDashboard() {
  revalidatePath("/admin");
  revalidatePath("/admin/health");
}
